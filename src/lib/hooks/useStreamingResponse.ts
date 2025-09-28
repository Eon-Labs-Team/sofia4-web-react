import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface StreamingState {
  isStreaming: boolean;
  currentStep: number;
  totalSteps: number;
  currentMessage: string;
  events: StreamEvent[];
  finalData: any | null;
  error: string | null;
}

interface UseStreamingResponseReturn extends StreamingState {
  startStreaming: (url: string, requestData: any, headers?: Record<string, string>) => void;
  stopStreaming: () => void;
  reset: () => void;
}

export const useStreamingResponse = (): UseStreamingResponseReturn => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    currentStep: 0,
    totalSteps: 6,
    currentMessage: '',
    events: [],
    finalData: null,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    stopStreaming();
    setState({
      isStreaming: false,
      currentStep: 0,
      totalSteps: 6,
      currentMessage: '',
      events: [],
      finalData: null,
      error: null,
    });
  }, [stopStreaming]);

  const startStreaming = useCallback(async (url: string, requestData: any, headers: Record<string, string> = {}) => {
    reset();
    
    setState(prev => ({ 
      ...prev, 
      isStreaming: true,
      currentMessage: 'Conectando...',
      error: null 
    }));

    try {
      controllerRef.current = new AbortController();

      // First, make the POST request to trigger streaming
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...headers,
        },
        body: JSON.stringify(requestData),
        signal: controllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();            
            console.log('value', value);
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const eventData = line.slice(6);
              
              if (eventData.trim() === '') continue;

              try {
                const event: StreamEvent = JSON.parse(eventData);
                
                setState(prev => ({
                  ...prev,
                  events: [...prev.events, event],
                  currentStep: event.data.step || prev.currentStep,
                  totalSteps: event.data.total || prev.totalSteps,
                  currentMessage: event.data.message || prev.currentMessage,
                  error: event.data.error ? event.data.message : null,
                  finalData: event.type === 'complete' ? event.data.data : prev.finalData,
                }));

                // Si es el evento final o error, parar el streaming
                if (event.type === 'complete' || event.type === 'error') {
                  setState(prev => ({ ...prev, isStreaming: false }));
                  break;
                }

              } catch (parseError) {
                console.error('Error parsing event data:', parseError, eventData);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      console.error('Streaming error:', error);
      
      if (error.name === 'AbortError') {
        setState(prev => ({ 
          ...prev, 
          isStreaming: false,
          currentMessage: 'Proceso cancelado',
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isStreaming: false,
          error: error.message || 'Error de conexión',
          currentMessage: 'Error en la comunicación',
        }));
      }
    }
  }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    ...state,
    startStreaming,
    stopStreaming,
    reset,
  };
};
