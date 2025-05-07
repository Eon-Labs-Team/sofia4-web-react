export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permission: {
    bpa: boolean;
    cosecha: boolean;
    gestion: boolean;
    certificacion: boolean;
  };
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
