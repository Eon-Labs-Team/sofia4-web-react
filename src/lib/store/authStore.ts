import { create } from 'zustand';
import { User, LoginCredentials } from '@/types/auth';
import authService from '@/_services/authService';

// Constants for localStorage keys
import { PROPERTY_ID_KEY } from '@/_services/authService';

// Helper functions for localStorage
const savePropertyIdToStorage = (id: string | number): void => {
  console.log('saving propertyId to storage', id);
  localStorage.setItem(PROPERTY_ID_KEY, id.toString());
};

const getPropertyIdFromStorage = (): string | number | null => {
  const stored = localStorage.getItem(PROPERTY_ID_KEY);
  if (!stored) return null;
  
  // Try to parse as number, if it fails return as string
  const asNumber = Number(stored);
  return isNaN(asNumber) ? stored : asNumber;
};

const removePropertyIdFromStorage = (): void => {
  localStorage.removeItem(PROPERTY_ID_KEY);
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  enterpriseId: string | null;
  propertyId: string | number | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setPropertyId: (id: string | number) => void;
  clearPropertyId: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state - load propertyId from localStorage
  user: authService.getCurrentUser(),
  token: authService.getAuthToken(),
  isAuthenticated: authService.isLoggedIn(),
  isLoading: false,
  error: null,
  enterpriseId: null,
  propertyId: getPropertyIdFromStorage(),
  
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
    removePropertyIdFromStorage(); // Clear propertyId from localStorage
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      propertyId: null
    });
  },
  
  // Clear any auth errors
  clearError: () => {
    set({ error: null });
  },

  // Set the current property ID and save to localStorage
  setPropertyId: (id: string | number) => {
    savePropertyIdToStorage(id);
    set({ propertyId: id });
  },
  
  // Clear the current property ID and remove from localStorage
  clearPropertyId: () => {
    removePropertyIdFromStorage();
    set({ propertyId: null });
  }
})); 