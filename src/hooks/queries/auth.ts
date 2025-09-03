import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { queryKeys } from '@/lib/query-keys';
import type {
  LoginCredentials,
  RegisterPatientData,
  RegisterDoctorData,
  User,
} from '@/types';

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.login,
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Store auth data in localStorage
      authService.setToken(data.token);
      authService.setUser(data.user);
      
      // Update auth cache
      queryClient.setQueryData(queryKeys.currentUser(), data.user);
      
      // Invalidate all queries to ensure fresh data for the new user
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Clear any existing auth data on login failure
      authService.logout();
      queryClient.removeQueries({ queryKey: queryKeys.auth });
    },
  });
};

// Register patient mutation
export const useRegisterPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.registerPatient,
    mutationFn: (patientData: RegisterPatientData) => authService.registerPatient(patientData),
    onSuccess: (data) => {
      // Store auth data in localStorage
      authService.setToken(data.token);
      authService.setUser(data.user);
      
      // Update auth cache
      queryClient.setQueryData(queryKeys.currentUser(), data.user);
      
      // Invalidate all queries to ensure fresh data for the new user
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Patient registration failed:', error);
    },
  });
};

// Register doctor mutation
export const useRegisterDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.registerDoctor,
    mutationFn: (doctorData: RegisterDoctorData) => authService.registerDoctor(doctorData),
    onSuccess: (data) => {
      // Store auth data in localStorage
      authService.setToken(data.token);
      authService.setUser(data.user);
      
      // Update auth cache
      queryClient.setQueryData(queryKeys.currentUser(), data.user);
      
      // Invalidate all queries to ensure fresh data for the new user
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Doctor registration failed:', error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.logout,
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Remove auth-related queries
      queryClient.removeQueries({ queryKey: queryKeys.auth });
    },
  });
};

// Get current user (from cache/localStorage)
export const useCurrentUser = (): User | null => {
  const queryClient = useQueryClient();
  
  // Try to get user from cache first
  const cachedUser = queryClient.getQueryData<User>(queryKeys.currentUser());
  
  if (cachedUser) {
    return cachedUser;
  }
  
  // Fallback to localStorage
  const storedUser = authService.getUser();
  
  if (storedUser) {
    // Update cache with stored user
    queryClient.setQueryData(queryKeys.currentUser(), storedUser);
    return storedUser;
  }
  
  return null;
};

// Check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const user = useCurrentUser();
  const token = authService.getToken();
  
  return !!(user && token);
};