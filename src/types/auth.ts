export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'manager';
  permissions: string[];
}

export interface LoginCredentials {
  enterprise: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  enterpriseId: string;
}
