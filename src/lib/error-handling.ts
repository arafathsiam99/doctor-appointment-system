import type { ApiError, ValidationError } from '../types';

/**
 * Custom error classes for better error handling
 */
export class AppError extends Error {
    public status: number;
    public code?: string;

    constructor(message: string, status: number = 500, code?: string) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
    }
}

export class ValidationAppError extends AppError {
    public errors: ValidationError[];

    constructor(message: string, errors: ValidationError[], status: number = 400) {
        super(message, status);
        this.name = 'ValidationAppError';
        this.errors = errors;
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network error occurred') {
        super(message, 0, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

/**
 * Error handling utilities
 */
export const errorUtils = {
    /**
     * Check if error is a network error
     */
    isNetworkError: (error: unknown): error is NetworkError => {
        return error instanceof NetworkError ||
            (error instanceof Error && error.message.includes('Network Error'));
    },

    /**
     * Check if error is an authentication error
     */
    isAuthError: (error: unknown): error is AuthenticationError => {
        if (error instanceof AuthenticationError) {
            return true;
        }
        return !!(error && typeof error === 'object' && 'status' in error && (error as any).status === 401);
    },

    /**
     * Check if error is an authorization error
     */
    isAuthorizationError: (error: unknown): error is AuthorizationError => {
        if (error instanceof AuthorizationError) {
            return true;
        }
        return !!(error && typeof error === 'object' && 'status' in error && (error as any).status === 403);
    },

    /**
     * Check if error is a validation error
     */
    isValidationError: (error: unknown): error is ValidationAppError => {
        if (error instanceof ValidationAppError) {
            return true;
        }
        return !!(error && typeof error === 'object' && 'status' in error && (error as any).status === 400);
    },

    /**
     * Extract user-friendly error message
     */
    getErrorMessage: (error: unknown): string => {
        if (error instanceof AppError) {
            return error.message;
        }

        if (error && typeof error === 'object' && 'message' in error) {
            return String(error.message);
        }

        if (typeof error === 'string') {
            return error;
        }

        return 'An unexpected error occurred';
    },

    /**
     * Get error status code
     */
    getErrorStatus: (error: unknown): number => {
        if (error instanceof AppError) {
            return error.status;
        }

        if (error && typeof error === 'object' && 'status' in error) {
            return Number((error as any).status) || 500;
        }

        return 500;
    },

    /**
     * Convert unknown error to ApiError format
     */
    toApiError: (error: unknown): ApiError => {
        return {
            message: errorUtils.getErrorMessage(error),
            status: errorUtils.getErrorStatus(error),
            code: error && typeof error === 'object' && 'code' in error ? String((error as any).code) : undefined,
        };
    },

    /**
     * Log error with context
     */
    logError: (error: unknown, context?: string): void => {
        const errorMessage = errorUtils.getErrorMessage(error);
        const errorStatus = errorUtils.getErrorStatus(error);

        console.error(`[${context || 'API'}] Error ${errorStatus}: ${errorMessage}`, error);
    },

    /**
     * Retry function with exponential backoff
     */
    retry: async <T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> => {
        let lastError: unknown;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry on authentication/authorization errors
                if (errorUtils.isAuthError(error) || errorUtils.isAuthorizationError(error)) {
                    throw error;
                }

                // Don't retry on validation errors
                if (errorUtils.isValidationError(error)) {
                    throw error;
                }

                // If this was the last attempt, throw the error
                if (attempt === maxRetries) {
                    throw error;
                }

                // Wait before retrying with exponential backoff
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    },
};

export default errorUtils;