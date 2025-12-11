// Common error type for API responses
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// Type guard to ensure error follows ApiError structure
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null;
};

// Helper to safely extract error message
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  return 'An unknown error occurred';
};

// Helper to safely extract error status
export const getErrorStatus = (error: unknown): number | undefined => {
  if (isApiError(error)) {
    return error.response?.status;
  }
  return undefined;
};
