// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API endpoints
export const ENDPOINTS = {
  cuarteles: {
    base: `${API_BASE_URL}/harvest/barracks`,
    byId: (id: string | number) => `${API_BASE_URL}/harvest/barracks/${id}`,
  },
  listaCuarteles: {
    base: `${API_BASE_URL}/agriculturalWork/barracksList`,
    byId: (id: string | number) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}/state/${state}`,
  }
}; 