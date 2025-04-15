import { create } from 'zustand';
import { User, LoginCredentials } from '@/types/auth';
import authService from '@/_services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  enterpriseId: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: authService.getCurrentUser(),
  token: authService.getAuthToken(),
  isAuthenticated: authService.isLoggedIn(),
  isLoading: false,
  error: null,
  enterpriseId: null,
  // Login action
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.login(credentials);
      
      set({
        enterpriseId: response.enterpriseId,
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  // Logout action
  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },
  
  // Clear any auth errors
  clearError: () => {
    set({ error: null });
  }
})); 