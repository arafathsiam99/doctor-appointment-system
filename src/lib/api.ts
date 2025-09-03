import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ApiError } from '../types';
import { errorUtils, NetworkError, AuthenticationError } from './error-handling';

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://appointment-manager-node.onrender.com/api/v1';
const API_TIMEOUT = 10000; // 10 seconds

// Create Axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle network errors
    if (!error.response) {
      errorUtils.logError(error, 'Network');
      return Promise.reject(new NetworkError('Network connection failed. Please check your internet connection.'));
    }
    
    // Handle 401 Unauthorized errors
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
      
      return Promise.reject(new AuthenticationError('Session expired. Please login again.'));
    }
    
    // Transform error to our ApiError format
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      message: responseData?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: responseData?.code || error.code,
    };
    
    // Log error for debugging
    errorUtils.logError(apiError, 'API');
    
    return Promise.reject(apiError);
  }
);

// Utility function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Utility function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  return errorUtils.toApiError(error);
};

// Generic API request function
export const makeApiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  params?: Record<string, any>
): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      params,
    });
    
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export default apiClient;