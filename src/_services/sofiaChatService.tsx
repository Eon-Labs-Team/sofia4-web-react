import { API_BASE_SOFIA_CHAT } from '@/lib/constants';

interface SofiaChatRequest {
  prompt: string;
}

interface SofiaChatResponse {
  success: boolean;
  data: {
    interpretation?: string;
    visualization?: any;
    result?: any[];
  };
  message?: string;
}

class SofiaChatService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async sendMessage(request: SofiaChatRequest): Promise<SofiaChatResponse> {
    try {
      const response = await fetch(`${API_BASE_SOFIA_CHAT}/api/sofia`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SofiaChatService error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
}

export default new SofiaChatService();
