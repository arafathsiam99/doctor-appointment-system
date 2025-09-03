# Store Management

This directory contains Zustand stores for global state management in the Doctor Appointment System.

## Stores

### AuthStore (`auth-store.ts`)

Manages authentication state and user data with localStorage persistence.

**State:**
- `user`: Current authenticated user data
- `token`: JWT authentication token
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state for auth operations
- `error`: Error message from auth operations

**Actions:**
- `login(credentials)`: Authenticate user and set auth state
- `logout()`: Clear auth state and localStorage
- `registerPatient(userData)`: Register new patient account
- `registerDoctor(userData)`: Register new doctor account
- `setUser(user)`: Update user data
- `setToken(token)`: Update auth token
- `clearError()`: Clear error state
- `initialize()`: Initialize auth state from localStorage

**Usage:**
```typescript
import { useAuthStore } from '@/store';

const { user, isAuthenticated, login, logout } = useAuthStore();

// Login
await login({ email, password, role: 'PATIENT' });

// Logout
logout();
```

### UIStore (`ui-store.ts`)

Manages UI state including loading states, notifications, and modals.

**State:**
- `isLoading`: Global loading state
- `notifications`: Array of notification objects
- `modals`: Object containing modal open/close states

**Actions:**
- `setLoading(loading)`: Set global loading state
- `addNotification(notification)`: Add notification with auto-removal
- `removeNotification(id)`: Remove specific notification
- `clearNotifications()`: Clear all notifications
- `openModal(modal)`: Open specific modal
- `closeModal(modal)`: Close specific modal
- `toggleModal(modal)`: Toggle modal state
- `closeAllModals()`: Close all modals

**Usage:**
```typescript
import { useUIStore } from '@/store';

const { 
  isLoading, 
  notifications, 
  modals,
  setLoading, 
  addNotification, 
  openModal 
} = useUIStore();

// Show loading
setLoading(true);

// Add notification
addNotification({
  type: 'success',
  message: 'Operation completed successfully!',
  duration: 3000
});

// Open modal
openModal('appointmentBooking');
```

## Features

### Persistence
- AuthStore automatically persists user data and token to localStorage
- State is restored on app initialization
- Secure token management through authService integration

### Auto-removal Notifications
- Notifications automatically remove after specified duration (default: 5000ms)
- Set `duration: 0` for persistent notifications
- Manual removal available via `removeNotification(id)`

### Type Safety
- Full TypeScript support with proper type definitions
- Strongly typed store interfaces
- Type-safe action parameters and return values

### Testing
- Comprehensive unit tests for all store functionality
- Integration tests for store coordination
- Mock support for external dependencies

## Best Practices

1. **Use stores for global state only** - Keep component-specific state local
2. **Handle errors gracefully** - Always wrap async actions in try-catch
3. **Clear state on logout** - Ensure sensitive data is properly cleared
4. **Use notifications for user feedback** - Provide clear success/error messages
5. **Manage loading states** - Show appropriate loading indicators during operations

## Integration with Components

```typescript
// Example: Login component
import { useAuthStore } from '@/store';

export function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  const { addNotification } = useUIStore();

  const handleSubmit = async (data) => {
    try {
      await login(data);
      addNotification({
        type: 'success',
        message: 'Login successful!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Login failed. Please try again.'
      });
    }
  };

  return (
    // Form JSX with loading state
  );
}
```