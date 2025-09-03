import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/auth-store';
import { useUIStore } from '../../store/ui-store';
import { authService } from '../../services/auth';
import type { User, LoginCredentials } from '../../types';

// Mock the auth service
vi.mock('../../services/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
  },
}));

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'PATIENT',
};

const mockToken = 'mock-jwt-token';

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset both stores
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    useUIStore.setState({
      isLoading: false,
      notifications: [],
      modals: {
        appointmentBooking: false,
        statusUpdate: false,
      },
    });

    vi.clearAllMocks();
  });

  it('should coordinate loading states between auth and UI stores', async () => {
    const credentials: LoginCredentials = {
      email: 'john@example.com',
      password: 'password123',
      role: 'PATIENT',
    };

    // Mock a delayed login response
    let resolveLogin: (value: { user: User; token: string }) => void;
    const loginPromise = new Promise<{ user: User; token: string }>((resolve) => {
      resolveLogin = resolve;
    });

    vi.mocked(authService.login).mockReturnValue(loginPromise);

    const { login } = useAuthStore.getState();
    const { setLoading } = useUIStore.getState();

    // Start login process
    const loginCall = login(credentials);

    // Both stores should show loading
    expect(useAuthStore.getState().isLoading).toBe(true);
    
    // UI store can also be set to loading for global loading state
    setLoading(true);
    expect(useUIStore.getState().isLoading).toBe(true);

    // Resolve login
    resolveLogin!({ user: mockUser, token: mockToken });
    await loginCall;

    // Auth store should no longer be loading
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // UI store loading can be manually cleared
    setLoading(false);
    expect(useUIStore.getState().isLoading).toBe(false);
  });

  it('should handle authentication errors with notifications', async () => {
    const credentials: LoginCredentials = {
      email: 'john@example.com',
      password: 'wrongpassword',
      role: 'PATIENT',
    };

    const errorMessage = 'Invalid credentials';
    vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

    const { login } = useAuthStore.getState();
    const { addNotification } = useUIStore.getState();

    try {
      await login(credentials);
    } catch (error) {
      // Add error notification when login fails
      addNotification({
        type: 'error',
        message: 'Login failed. Please check your credentials.',
      });
    }

    // Check auth store state
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.error).toBe(errorMessage);

    // Check UI store has notification
    const uiState = useUIStore.getState();
    expect(uiState.notifications).toHaveLength(1);
    expect(uiState.notifications[0].type).toBe('error');
    expect(uiState.notifications[0].message).toBe('Login failed. Please check your credentials.');
  });

  it('should handle successful authentication with success notification', async () => {
    const credentials: LoginCredentials = {
      email: 'john@example.com',
      password: 'password123',
      role: 'PATIENT',
    };

    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    const { login } = useAuthStore.getState();
    const { addNotification } = useUIStore.getState();

    await login(credentials);

    // Add success notification after successful login
    addNotification({
      type: 'success',
      message: `Welcome back, ${mockUser.name}!`,
    });

    // Check auth store state
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user).toEqual(mockUser);

    // Check UI store has success notification
    const uiState = useUIStore.getState();
    expect(uiState.notifications).toHaveLength(1);
    expect(uiState.notifications[0].type).toBe('success');
    expect(uiState.notifications[0].message).toBe(`Welcome back, ${mockUser.name}!`);
  });

  it('should handle logout with cleanup of both stores', () => {
    // Set initial authenticated state
    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
    });

    // Set some UI state
    useUIStore.setState({
      notifications: [
        {
          id: '1',
          type: 'info',
          message: 'Some notification',
        },
      ],
      modals: {
        appointmentBooking: true,
        statusUpdate: false,
      },
    });

    const { logout } = useAuthStore.getState();
    const { clearNotifications, closeAllModals, addNotification } = useUIStore.getState();

    // Perform logout with UI cleanup
    logout();
    clearNotifications();
    closeAllModals();
    addNotification({
      type: 'info',
      message: 'You have been logged out successfully.',
    });

    // Check auth store is cleared
    const authState = useAuthStore.getState();
    expect(authState.user).toBeNull();
    expect(authState.token).toBeNull();
    expect(authState.isAuthenticated).toBe(false);

    // Check UI store is cleaned up with logout notification
    const uiState = useUIStore.getState();
    expect(uiState.notifications).toHaveLength(1);
    expect(uiState.notifications[0].message).toBe('You have been logged out successfully.');
    expect(uiState.modals.appointmentBooking).toBe(false);
    expect(uiState.modals.statusUpdate).toBe(false);
  });

  it('should maintain independent state management', () => {
    // Both stores should work independently
    const { setUser } = useAuthStore.getState();
    const { addNotification, openModal } = useUIStore.getState();

    // Update auth store
    setUser(mockUser);

    // Update UI store
    addNotification({
      type: 'warning',
      message: 'Independent notification',
    });
    openModal('appointmentBooking');

    // Check both stores have their respective states
    const authState = useAuthStore.getState();
    const uiState = useUIStore.getState();

    expect(authState.user).toEqual(mockUser);
    expect(uiState.notifications[0].message).toBe('Independent notification');
    expect(uiState.modals.appointmentBooking).toBe(true);

    // Changes to one store shouldn't affect the other
    expect(authState.isLoading).toBe(false); // UI loading doesn't affect auth loading
    expect(uiState.isLoading).toBe(false); // Auth loading doesn't affect UI loading
  });
});