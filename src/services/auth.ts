import { makeApiRequest } from '../lib/api';
import { responseTransformers } from '../lib/response-transformers';
import type {
  LoginCredentials,
  RegisterPatientData,
  RegisterDoctorData,
  LoginResponse,
  RegisterResponse,
  User,
} from '../types';

// Authentication service functions
export const authService = {
  /**
   * Login user (patient or doctor)
   */
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await makeApiRequest<LoginResponse>(
      'POST',
      '/auth/login',
      credentials
    );
    
    return {
      user: responseTransformers.transformUser(response.data.user),
      token: String(response.data.token),
    };
  },

  /**
   * Register a new patient
   */
  registerPatient: async (patientData: RegisterPatientData): Promise<{ user: User; token: string }> => {
    const response = await makeApiRequest<RegisterResponse>(
      'POST',
      '/auth/register/patient',
      patientData
    );
    
    return {
      user: responseTransformers.transformUser(response.data.user),
      token: String(response.data.token),
    };
  },

  /**
   * Register a new doctor
   */
  registerDoctor: async (doctorData: RegisterDoctorData): Promise<{ user: User; token: string }> => {
    const response = await makeApiRequest<RegisterResponse>(
      'POST',
      '/auth/register/doctor',
      doctorData
    );
    
    return {
      user: responseTransformers.transformUser(response.data.user),
      token: String(response.data.token),
    };
  },

  /**
   * Logout user (client-side cleanup)
   */
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  /**
   * Store authentication token
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  /**
   * Get stored user data
   */
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  /**
   * Store user data
   */
  setUser: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};

export default authService;