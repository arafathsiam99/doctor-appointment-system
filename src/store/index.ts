// Export all stores
export { useAuthStore, default as useAuthStoreDefault } from './auth-store';
export { useUIStore, default as useUIStoreDefault } from './ui-store';

// Re-export types for convenience
export type { AuthState, UIState, RootState } from '../types/store';