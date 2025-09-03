import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth';
import type { User, LoginCredentials, RegisterPatientData, RegisterDoctorData } from '../../types';

// Mock the auth service
vi.mock('../../services/auth', () => ({
    authService: {
        login: vi.fn(),
        registerPatient: vi.fn(),
        registerDoctor: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
        setToken: vi.fn(),
        getUser: vi.fn(),
        setUser: vi.fn(),
        isAuthenticated: vi.fn(),
    },
}));

const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'PATIENT',
    photo_url: 'https://example.com/photo.jpg',
};

const mockToken = 'mock-jwt-token';

describe('AuthStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const state = useAuthStore.getState();

            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('Login', () => {
        it('should login successfully', async () => {
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

            await login(credentials);

            const state = useAuthStore.getState();

            expect(authService.login).toHaveBeenCalledWith(credentials);
            expect(authService.setToken).toHaveBeenCalledWith(mockToken);
            expect(authService.setUser).toHaveBeenCalledWith(mockUser);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should handle login failure', async () => {
            const credentials: LoginCredentials = {
                email: 'john@example.com',
                password: 'wrongpassword',
                role: 'PATIENT',
            };

            const errorMessage = 'Invalid credentials';
            vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

            const { login } = useAuthStore.getState();

            await expect(login(credentials)).rejects.toThrow(errorMessage);

            const state = useAuthStore.getState();

            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
        });

        it('should set loading state during login', async () => {
            const credentials: LoginCredentials = {
                email: 'john@example.com',
                password: 'password123',
                role: 'PATIENT',
            };

            let resolveLogin: (value: { user: User; token: string }) => void;
            const loginPromise = new Promise<{ user: User; token: string }>((resolve) => {
                resolveLogin = resolve;
            });

            vi.mocked(authService.login).mockReturnValue(loginPromise);

            const { login } = useAuthStore.getState();

            const loginCall = login(credentials);

            // Check loading state is true during login
            expect(useAuthStore.getState().isLoading).toBe(true);

            // Resolve the login
            resolveLogin!({ user: mockUser, token: mockToken });
            await loginCall;

            // Check loading state is false after login
            expect(useAuthStore.getState().isLoading).toBe(false);
        });
    });

    describe('Logout', () => {
        it('should logout successfully', () => {
            // Set initial authenticated state
            useAuthStore.setState({
                user: mockUser,
                token: mockToken,
                isAuthenticated: true,
            });

            const { logout } = useAuthStore.getState();
            logout();

            const state = useAuthStore.getState();

            expect(authService.logout).toHaveBeenCalled();
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('Register Patient', () => {
        it('should register patient successfully', async () => {
            const patientData: RegisterPatientData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
                photo_url: 'https://example.com/jane.jpg',
            };

            const mockPatientUser: User = {
                ...mockUser,
                name: 'Jane Doe',
                email: 'jane@example.com',
            };

            vi.mocked(authService.registerPatient).mockResolvedValue({
                user: mockPatientUser,
                token: mockToken,
            });

            const { registerPatient } = useAuthStore.getState();

            await registerPatient(patientData);

            const state = useAuthStore.getState();

            expect(authService.registerPatient).toHaveBeenCalledWith(patientData);
            expect(authService.setToken).toHaveBeenCalledWith(mockToken);
            expect(authService.setUser).toHaveBeenCalledWith(mockPatientUser);
            expect(state.user).toEqual(mockPatientUser);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should handle patient registration failure', async () => {
            const patientData: RegisterPatientData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
            };

            const errorMessage = 'Email already exists';
            vi.mocked(authService.registerPatient).mockRejectedValue(new Error(errorMessage));

            const { registerPatient } = useAuthStore.getState();

            await expect(registerPatient(patientData)).rejects.toThrow(errorMessage);

            const state = useAuthStore.getState();

            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
        });
    });

    describe('Register Doctor', () => {
        it('should register doctor successfully', async () => {
            const doctorData: RegisterDoctorData = {
                name: 'Dr. Smith',
                email: 'dr.smith@example.com',
                password: 'password123',
                specialization: 'Cardiology',
                photo_url: 'https://example.com/dr-smith.jpg',
            };

            const mockDoctorUser: User = {
                ...mockUser,
                name: 'Dr. Smith',
                email: 'dr.smith@example.com',
                role: 'DOCTOR',
            };

            vi.mocked(authService.registerDoctor).mockResolvedValue({
                user: mockDoctorUser,
                token: mockToken,
            });

            const { registerDoctor } = useAuthStore.getState();

            await registerDoctor(doctorData);

            const state = useAuthStore.getState();

            expect(authService.registerDoctor).toHaveBeenCalledWith(doctorData);
            expect(authService.setToken).toHaveBeenCalledWith(mockToken);
            expect(authService.setUser).toHaveBeenCalledWith(mockDoctorUser);
            expect(state.user).toEqual(mockDoctorUser);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('Utility Actions', () => {
        it('should set user', () => {
            const { setUser } = useAuthStore.getState();
            setUser(mockUser);

            const state = useAuthStore.getState();

            expect(authService.setUser).toHaveBeenCalledWith(mockUser);
            expect(state.user).toEqual(mockUser);
        });

        it('should set token', () => {
            const { setToken } = useAuthStore.getState();
            setToken(mockToken);

            const state = useAuthStore.getState();

            expect(authService.setToken).toHaveBeenCalledWith(mockToken);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
        });

        it('should clear error', () => {
            // Set initial error state
            useAuthStore.setState({ error: 'Some error' });

            const { clearError } = useAuthStore.getState();
            clearError();

            const state = useAuthStore.getState();

            expect(state.error).toBeNull();
        });

        it('should initialize from localStorage', () => {
            vi.mocked(authService.getToken).mockReturnValue(mockToken);
            vi.mocked(authService.getUser).mockReturnValue(mockUser);

            const { initialize } = useAuthStore.getState();
            initialize();

            const state = useAuthStore.getState();

            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should initialize with empty state when no stored data', () => {
            vi.mocked(authService.getToken).mockReturnValue(null);
            vi.mocked(authService.getUser).mockReturnValue(null);

            const { initialize } = useAuthStore.getState();
            initialize();

            const state = useAuthStore.getState();

            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });
});