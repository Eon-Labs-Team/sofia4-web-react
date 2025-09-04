import { API_BASE_SOFIA_CHAT } from '@/lib/constants';
import authService from './authService';

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

interface StreamingRequestConfig {
  url: string;
  requestData: any;
  headers: Record<string, string>;
}

class SofiaChatService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método para preparar la configuración de streaming
  prepareStreamingConfig(request: SofiaChatRequest): StreamingRequestConfig {
    const body = {...request, propertyId: authService.getPropertyId()};
    
    return {
      url: authService.buildUrlWithParams(`${API_BASE_SOFIA_CHAT}/api/sofia/process-query-streaming`),
      requestData: body,
      headers: this.getHeaders()
    };
  }

  // Método legacy para compatibilidad (mantener por ahora)
  async sendMessage(request: SofiaChatRequest): Promise<SofiaChatResponse> {
    try {
      let body = {...request, propertyId: authService.getPropertyId()}
      const response = await fetch(authService.buildUrlWithParams(`${API_BASE_SOFIA_CHAT}/api/sofia`), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
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
