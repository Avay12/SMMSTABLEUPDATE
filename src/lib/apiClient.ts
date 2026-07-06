import axios from 'axios';
import { toast } from 'sonner';

// Create an Axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `https://smmstable.com/api`, // Update this to the actual backend URL
  withCredentials: true, // Important for sending/receiving cookies for auth
});

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., clear user state, redirect to login)
        window.dispatchEvent(new Event('auth-unauthorized'));
      }

      // Structured error handling
      const errorData = error.response.data?.error;
      const errorMessage = errorData?.message || error.response.data?.message || 'An unexpected error occurred';
      
      // Don't show toast for 401 unauth checks unless needed, but generally good to show API errors
      if (error.response.status !== 401) {
        toast.error(errorMessage);
      }
      
      // Create a clean error object for components to catch if needed
      const apiError = new Error(errorMessage);
      (apiError as any).details = errorData?.details;
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    }
    
    toast.error('Network error. Please check your connection.');
    return Promise.reject(error);
  }
);
