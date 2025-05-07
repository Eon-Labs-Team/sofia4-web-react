import { User, LoginCredentials, LoginResponse } from '@/types/auth';
import { API_BASE_SOFIA } from '@/lib/constants';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
    return null;
  }
};

class AuthService {
  /**
   * Login with credentials using the real API endpoint
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_SOFIA}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enterpriseName: credentials.enterprise,
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Authentication failed');
      }

      const { token, user } = data.data;

      // Store auth data in localStorage
      saveToken(token);
      saveUser(user);

      return {
        user,
        token,
        enterpriseId: credentials.enterprise
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid username or password');
    }
  }
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!getToken() && !!getUser();
  }
  
  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return getUser();
  }
  
  /**
   * Get the current token
   */
  getAuthToken(): string | null {
    return getToken();
  }
  
  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permission?.[permission] || false;
  }
  
  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}

const authService = new AuthService();
export default authService; 