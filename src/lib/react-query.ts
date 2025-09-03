import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default options for React Query
const queryConfig: DefaultOptions = {
    queries: {
        // Cache data for 5 minutes before considering it stale
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes after component unmounts
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: (failureCount, error: unknown) => {
            // Don't retry on 4xx errors (client errors)
            const errorWithResponse = error as { response?: { status?: number } };
            if (errorWithResponse?.response?.status &&
                errorWithResponse.response.status >= 400 &&
                errorWithResponse.response.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
    },
    mutations: {
        // Retry mutations once on failure
        retry: 1,
    },
};

// Create and configure QueryClient
export const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: queryConfig,
    });
};

// Singleton instance for client-side usage
let queryClient: QueryClient | undefined;

export const getQueryClient = () => {
    if (typeof window === 'undefined') {
        // Server-side: always create a new client
        return createQueryClient();
    }

    // Client-side: create client once and reuse
    if (!queryClient) {
        queryClient = createQueryClient();
    }

    return queryClient;
};

// Cache invalidation utilities
export const cacheUtils = {
    /**
     * Invalidate all appointment-related queries
     */
    invalidateAppointments: (client: QueryClient) => {
        return client.invalidateQueries({
            queryKey: ['appointments'],
        });
    },

    /**
     * Invalidate patient appointments
     */
    invalidatePatientAppointments: (client: QueryClient) => {
        return client.invalidateQueries({
            queryKey: ['appointments', 'patient'],
        });
    },

    /**
     * Invalidate doctor appointments
     */
    invalidateDoctorAppointments: (client: QueryClient) => {
        return client.invalidateQueries({
            queryKey: ['appointments', 'doctor'],
        });
    },

    /**
     * Invalidate doctors list
     */
    invalidateDoctors: (client: QueryClient) => {
        return client.invalidateQueries({
            queryKey: ['doctors'],
        });
    },

    /**
     * Remove specific appointment from cache
     */
    removeAppointment: (client: QueryClient, appointmentId: string) => {
        return client.removeQueries({
            queryKey: ['appointments', 'detail', appointmentId],
        });
    },

    /**
     * Update appointment in cache
     */
    updateAppointmentInCache: (client: QueryClient, appointmentId: string, updater: (old: unknown) => unknown) => {
        client.setQueryData(['appointments', 'detail', appointmentId], updater);
    },
};

// Error handling for React Query
export const queryErrorHandler = (error: unknown) => {
    console.error('Query Error:', error);

    // You can add global error handling here
    // For example, show toast notifications, redirect on auth errors, etc.

    const errorWithResponse = error as { response?: { status?: number } };
    if (errorWithResponse?.response?.status === 401) {
        // Handle unauthorized errors
        // Could redirect to login or refresh token
    }
};