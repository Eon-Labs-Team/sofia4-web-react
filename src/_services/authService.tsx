import { User, LoginCredentials, LoginResponse } from '@/types/auth';
import { ENDPOINTS } from '@/lib/constants';

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    enterprise: 'empresa1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: '2',
    enterprise: 'empresa1',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    fullName: 'Regular User',
    role: 'user',
    permissions: ['read', 'write']
  },
  {
    id: '3',
    enterprise: 'empresa1',
    username: 'manager',
    password: 'manager123',
    email: 'manager@example.com',
    fullName: 'Manager User',
    role: 'manager',
    permissions: ['read', 'write', 'delete']
  }
];

// Token utility functions
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
   * Login with credentials
   * In a real implementation, this would communicate with an API
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check credentials against mock data
    const user = MOCK_USERS.find(u => 
      u.enterprise === credentials.enterprise &&
      u.username === credentials.username && 
      u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Generate a mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    // Create the response object (exclude password)
    const { password, ...userWithoutPassword } = user;
    const response = {
      user: userWithoutPassword as User,
      token,
      enterpriseId: user.enterprise
    };
    
    // Store auth data in localStorage
    saveToken(token);
    saveUser(response.user);
    
    return response;
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
  
  /**{}
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
    return user?.permissions.includes(permission) || false;
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