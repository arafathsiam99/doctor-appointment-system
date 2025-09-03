import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/auth';
import type { AuthState, LoginCredentials, RegisterPatientData, RegisterDoctorData, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, token } = await authService.login(credentials);
          
          // Store in localStorage via authService
          authService.setToken(token);
          authService.setUser(user);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear localStorage via authService
        authService.logout();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      registerPatient: async (userData: RegisterPatientData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, token } = await authService.registerPatient(userData);
          
          // Store in localStorage via authService
          authService.setToken(token);
          authService.setUser(user);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Patient registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      registerDoctor: async (userData: RegisterDoctorData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, token } = await authService.registerDoctor(userData);
          
          // Store in localStorage via authService
          authService.setToken(token);
          authService.setUser(user);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Doctor registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      setUser: (user: User) => {
        authService.setUser(user);
        set({ user });
      },

      setToken: (token: string) => {
        authService.setToken(token);
        set({ token, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        // Initialize auth state from localStorage on app start
        const token = authService.getToken();
        const user = authService.getUser();
        
        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential auth state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;