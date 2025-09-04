import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  Download,
  Copy,
  Loader2,
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import sofiaChatService from '@/_services/sofiaChatService';
import ttsService from '@/_services/ttsService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface StreamingEvent {
  type: string;
  data: {
    step?: number;
    total?: number;
    message?: string;
    interpretation?: string;
    visualization?: any;
    result?: any[];
    error?: string;
    data?: any;
    // Propiedades para chunking
    chunkIndex?: number;
    totalChunks?: number;
    progress?: number;
    // Propiedades adicionales de metadata
    aggregationPipeline?: any;
    tokenContent?: any;
    enterpriseId?: string;
    connectionString?: string;
    sessionId?: string;
    conversationId?: string;
    prompt?: string;
    additionalInputs?: any;
    history?: any;
    // Propiedades de estado
    success?: boolean;
    warning?: boolean;
    collection?: string;
    count?: number;
    details?: any;
    summary?: any;
  };
  timestamp: string;
}

interface MessageVisualization {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  config: any;
  title?: string;
  description?: string;
}

interface MessageData {
  result?: any[];
  rawData?: any;
  summary?: string;
}

interface StreamingStatus {
  isActive: boolean;
  step: number;
  totalSteps: number;
  currentMessage: string;
  events: StreamingEvent[];
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  visualizations?: MessageVisualization[];
  data?: MessageData;
  streaming?: StreamingStatus;
  isComplete: boolean;
  error?: string;
}

interface SofiaChatProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSize: () => void;
  isMinimized: boolean;
}

const SofiaChat: React.FC<SofiaChatProps> = ({ 
  isOpen, 
  onClose, 
  onToggleSize, 
  isMinimized 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy sofIA, tu asistente inteligente. Puedo ayudarte con análisis de datos, generar gráficos y responder preguntas sobre tu sistema. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      visualizations: [],
      isComplete: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLarge, setIsLarge] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Speech recognition hook
  const {
    transcript,
    finalTranscript,
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition({
    lang: 'es-ES',
    continuous: true,
    interimResults: true,
  });

  // Streaming response hook
  const {
    isStreaming,
    currentStep,
    totalSteps,
    currentMessage,
    events,
    finalData,
    error: streamingError,
    startStreaming,
    stopStreaming,
    reset: resetStreaming
  } = useStreamingResponse();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlayTTS = async (text: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      
      // Stop native TTS if it's being used
      ttsService.stop();

      setPlayingAudio(messageId);
      const audio = await ttsService.playText(text);
      setCurrentAudio(audio);

      // Only add event listeners if we got an actual audio element (ElevenLabs)
      if (audio && audio.addEventListener) {
        audio.addEventListener('ended', () => {
          setPlayingAudio(null);
          setCurrentAudio(null);
        });

        audio.addEventListener('error', () => {
          setPlayingAudio(null);
          setCurrentAudio(null);
        });
      } else {
        // For native TTS, we need to handle the state differently
        // Since native TTS returns a mock audio element, we'll use a timeout
        setTimeout(() => {
          setPlayingAudio(null);
          setCurrentAudio(null);
        }, text.length * 50); // Rough estimation of speech duration
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setPlayingAudio(null);
      setCurrentAudio(null);
    }
  };

  const handleStopTTS = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    // Also stop native TTS
    ttsService.stop();
    
    setPlayingAudio(null);
    setCurrentAudio(null);
  };

  const toggleTTSGlobal = () => {
    if (currentAudio) {
      handleStopTTS();
    }
    setTtsEnabled(!ttsEnabled);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Update input with speech transcript
  useEffect(() => {
    if (transcript || finalTranscript) {
      const fullTranscript = finalTranscript + transcript;
      setInputValue(fullTranscript);
    }
  }, [transcript, finalTranscript]);

  // Auto-send when final transcript is received and listening stops
  useEffect(() => {
    if (!isListening && finalTranscript.trim() && !isLoading) {
      // Small delay to ensure the input is updated
      const timer = setTimeout(() => {
        handleSendMessage();
        resetTranscript();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, finalTranscript, isLoading]);

  // Escuchar eventos de streaming y procesarlos
  useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[events.length - 1] as StreamingEvent;
      
      console.log('🔥 Nuevo evento streaming recibido:', {
        type: lastEvent.type,
        dataKeys: Object.keys(lastEvent.data || {}),
        timestamp: lastEvent.timestamp,
        hasVisualization: !!(lastEvent.data?.visualization),
        hasInterpretation: !!(lastEvent.data?.interpretation)
      });
      
      processStreamingEvent(lastEvent);
    }
  }, [events]);

  // Función para procesar eventos de streaming y actualizar mensajes
  const processStreamingEvent = (event: StreamingEvent): void => {
    console.log('🔥 Processing streaming event:', {
      type: event.type,
      data: event.data,
      timestamp: event.timestamp
    });

    setMessages(prevMessages => {
      const lastMessageIndex = prevMessages.length - 1;
      const lastMessage = prevMessages[lastMessageIndex];
      
      // Verificar que el último mensaje sea un mensaje de asistente en streaming
      if (!lastMessage || lastMessage.type !== 'assistant' || lastMessage.isComplete) {
        console.warn('No valid streaming message to update');
        return prevMessages;
      }

      const updatedMessage = processMessageUpdate(lastMessage, event);
      
      return [
        ...prevMessages.slice(0, -1),
        updatedMessage
      ];
    });
  };

  // Función para procesar actualizaciones de mensajes basadas en eventos
  const processMessageUpdate = (message: Message, event: StreamingEvent): Message => {
    const { type, data } = event;
    
    // Actualizar estado de streaming
    const updatedStreaming: StreamingStatus = {
      ...message.streaming!,
      isActive: type !== 'complete' && type !== 'error',
      step: data.step || message.streaming?.step || 0,
      totalSteps: data.total || message.streaming?.totalSteps || 6,
      currentMessage: data.message || message.streaming?.currentMessage || '',
      events: [...(message.streaming?.events || []), event]
    };

    // Procesar contenido según el tipo de evento
    let updatedContent = message.content;
    let updatedVisualizations = message.visualizations || [];
    let updatedData = message.data;
    let isComplete = false;
    let error = message.error;

    switch (type) {
      case 'progress':
      case 'step':
      case 'init':
      case 'auth':
      case 'connection':
      case 'analysis':
      case 'query-generation':
      case 'query-execution':
      case 'interpretation':
      case 'data-preparation':
      case 'data-sending':
        updatedContent = data.message || data.interpretation || message.content;
        break;

      case 'metadata':
        // Procesar el evento metadata que contiene tanto interpretación como visualización
        console.log('🎯 Procesando evento metadata:', data);
        
        // Extraer interpretación
        if (data.interpretation) {
          updatedContent = data.interpretation;
        }
        
        // Extraer visualización si existe
        if (data.visualization && data.visualization.type && data.visualization.config) {
          const newVisualization: MessageVisualization = {
            type: data.visualization.type,
            config: data.visualization.config,
            title: data.visualization.title || `Gráfico ${data.visualization.type}`,
            description: data.visualization.description || 'Visualización generada por sofIA'
          };
          updatedVisualizations = [newVisualization];
          console.log('📊 Visualización extraída de metadata:', newVisualization);
        }
        
        // Actualizar contenido con la interpretación si existe
        updatedContent = data.interpretation || updatedContent || 'Datos procesados exitosamente';
        break;
        
      case 'visualization':
        if (data.visualization) {
          const newVisualization: MessageVisualization = {
            type: data.visualization.type,
            config: data.visualization.config,
            title: data.visualization.title,
            description: data.visualization.description
          };
          updatedVisualizations = [newVisualization];
        }
        updatedContent = data.interpretation || data.message || message.content;
        break;
        
      case 'data':
      case 'result':
      case 'results':
        if (data.result || data.data) {
          updatedData = {
            result: data.result || data.data,
            rawData: data.data || data.result,
            summary: data.message || data.interpretation
          };
        }
        updatedContent = data.interpretation || data.message || message.content;
        break;
        
      case 'results_chunk':
        // Manejar chunks de resultados
        if (data.data) {
          const currentData = message.data || { result: [], rawData: null };
          const combinedResults = [...(currentData.result || []), ...data.data];
          
          updatedData = {
            result: combinedResults,
            rawData: combinedResults,
            summary: `Recibiendo datos... (${data.progress}% - Chunk ${data.chunkIndex + 1}/${data.totalChunks})`
          };
        }
        updatedContent = data.message || `Procesando chunk ${data.chunkIndex + 1}/${data.totalChunks} (${data.progress}%)`;
        break;
        
      case 'results_complete':
        updatedContent = data.message || 'Todos los datos recibidos exitosamente';
        if (message.data) {
          updatedData = {
            ...message.data,
            summary: data.message || 'Datos completos recibidos'
          };
        }
        break;
        
      case 'complete':
        isComplete = true;
        
        // El mensaje final debe preservar el contenido interpretado previo
        updatedContent = message.content !== 'Iniciando procesamiento...' 
          ? message.content 
          : (data.interpretation || data.message || '✅ Procesamiento completado');
        
        // Preservar visualizaciones existentes o agregar nuevas si vienen en complete
        if (data.visualization && data.visualization.type && data.visualization.config) {
          const finalVisualization: MessageVisualization = {
            type: data.visualization.type,
            config: data.visualization.config,
            title: data.visualization.title,
            description: data.visualization.description
          };
          updatedVisualizations = [finalVisualization];
        } else {
          // Mantener visualizaciones existentes
          updatedVisualizations = message.visualizations || [];
        }
        
        // Preservar datos existentes o agregar nuevos
        if (data.result || data.data) {
          updatedData = {
            result: data.result || data.data,
            rawData: data.data || data.result,
            summary: data.message || data.interpretation
          };
        } else {
          // Mantener datos existentes
          updatedData = message.data;
        }
        
        console.log('✅ Evento complete procesado:', {
          content: updatedContent,
          visualizations: updatedVisualizations?.length,
          dataRecords: updatedData?.result?.length
        });
        break;
        
      case 'error':
        isComplete = true;
        error = data.error || data.message || 'Error desconocido';
        updatedContent = `❌ Error: ${error}`;
        updatedStreaming.isActive = false;
        console.log('❌ Error procesado:', error);
        break;
        
      case 'heartbeat':
        // No actualizar contenido para heartbeats, solo mantener conexión viva
        break;
        
      default:
        // Eventos genéricos - registrar para debugging
        console.log(`🔄 Evento genérico '${type}':`, data);
        if (data.message || data.interpretation) {
          updatedContent = data.interpretation || data.message || updatedContent;
        }
        break;
    }

    return {
      ...message,
      content: updatedContent,
      visualizations: updatedVisualizations,
      data: updatedData,
      streaming: updatedStreaming,
      isComplete,
      error
    };
  };

  // Manejar finalización del streaming
  useEffect(() => {
    if (!isStreaming && (finalData || streamingError)) {
      setMessages(prevMessages => {
        const lastMessageIndex = prevMessages.length - 1;
        const lastMessage = prevMessages[lastMessageIndex];
        
        if (lastMessage && lastMessage.type === 'assistant' && !lastMessage.isComplete) {
          let finalMessage: Message;
          
          if (streamingError) {
            // Manejo de errores
            finalMessage = {
              ...lastMessage,
              content: `❌ Error: ${streamingError}`,
              isComplete: true,
              error: streamingError,
              streaming: {
                ...lastMessage.streaming!,
                isActive: false,
                currentMessage: 'Error en la comunicación'
              }
            };
          } else if (finalData) {
            // Procesar datos finales
            const finalVisualizations: MessageVisualization[] = [];
            let finalDataObj: MessageData | undefined;
            
            if (finalData.visualization) {
              finalVisualizations.push({
                type: finalData.visualization.type,
                config: finalData.visualization.config,
                title: finalData.visualization.title,
                description: finalData.visualization.description
              });
            }
            
            if (finalData.result || finalData.data) {
              finalDataObj = {
                result: finalData.result,
                rawData: finalData.data,
                summary: finalData.interpretation
              };
            }
            
            finalMessage = {
              ...lastMessage,
              content: finalData.interpretation || lastMessage.content || '✅ Procesamiento completado',
              visualizations: finalVisualizations.length > 0 ? finalVisualizations : lastMessage.visualizations,
              data: finalDataObj || lastMessage.data,
              isComplete: true,
              streaming: {
                ...lastMessage.streaming!,
                isActive: false,
                currentMessage: 'Completado'
              }
            };
          } else {
            // Finalización sin datos específicos
            finalMessage = {
              ...lastMessage,
              content: lastMessage.content || '✅ Procesamiento completado',
              isComplete: true,
              streaming: {
                ...lastMessage.streaming!,
                isActive: false,
                currentMessage: 'Completado'
              }
            };
          }
          
          // Auto-play TTS para el mensaje final si está habilitado y no hay error
          if (ttsEnabled && finalMessage.content && ttsService.isAvailable() && !finalMessage.error) {
            setTimeout(() => {
              handlePlayTTS(finalMessage.content, finalMessage.id);
            }, 1000);
          }
          
          return [
            ...prevMessages.slice(0, -1),
            finalMessage
          ];
        }
        
        return prevMessages;
      });
      
      console.log('✅ Sofia Streaming completado:', {
        success: !streamingError,
        finalData,
        error: streamingError,
        totalEvents: events.length
      });
    }
  }, [isStreaming, finalData, streamingError, ttsEnabled, events.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      visualizations: [],
      isComplete: true
    };

    // Crear mensaje de asistente inicial para streaming
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Iniciando procesamiento...',
      timestamp: new Date(),
      visualizations: [],
      data: undefined,
      streaming: {
        isActive: true,
        step: 0,
        totalSteps: 6,
        currentMessage: 'Conectando...',
        events: []
      },
      isComplete: false
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    const promptToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Preparar configuración de streaming
      const streamConfig = sofiaChatService.prepareStreamingConfig({
        prompt: promptToSend,
      });
      
      console.log('🚀 Iniciando streaming Sofia:', {
        url: streamConfig.url,
        prompt: promptToSend
      });
      
      // Iniciar streaming
      startStreaming(
        streamConfig.url,
        streamConfig.requestData,
        streamConfig.headers
      );
      
    } catch (error) {
      console.error('❌ Error al iniciar streaming:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date(),
        visualizations: [],
        isComplete: true,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };

      // Reemplazar el mensaje de streaming con el error
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = errorMessage;
        return newMessages;
      });
      
      // Auto-play TTS for error messages if enabled
      if (ttsEnabled && errorMessage.content && ttsService.isAvailable()) {
        setTimeout(() => {
          handlePlayTTS(errorMessage.content, errorMessage.id);
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSize = () => {
    setIsLarge(!isLarge);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      if (inputValue.trim()) {
        // Si hay texto, limpiarlo antes de empezar a escuchar
        setInputValue('');
        resetTranscript();
      }
      startListening();
    }
  };

  const handleStopVoice = () => {
    stopListening();
    // Si hay transcripción, mantenerla en el input sin enviar automáticamente
    if (finalTranscript.trim() || transcript.trim()) {
      const fullText = finalTranscript + transcript;
      setInputValue(fullText);
    }
  };

  // Función mejorada para renderizar visualizaciones
  const renderVisualization = (visualization: MessageVisualization, index: number) => {
    if (!visualization || !visualization.config) {
      console.warn('Invalid visualization data:', visualization);
      return null;
    }

    const { type, config, title, description } = visualization;
    
    const chartProps = {
      data: config.data,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...config.options?.plugins,
          title: {
            display: !!title,
            text: title,
            ...config.options?.plugins?.title
          }
        }
      },
    };

    // Altura de los gráficos según el tamaño
    const chartHeight = isLarge ? "h-[500px]" : "h-64";

    let ChartComponent;
    switch (type) {
      case 'bar':
        ChartComponent = Bar;
        break;
      case 'line':
        ChartComponent = Line;
        break;
      case 'pie':
        ChartComponent = Pie;
        break;
      case 'doughnut':
        ChartComponent = Doughnut;
        break;
      default:
        console.warn('Unknown chart type:', type);
        return null;
    }

    return (
      <div key={index} className="space-y-2 border border-gray-200 rounded-lg p-3">
        {title && (
          <h4 className={cn("font-semibold text-gray-800", isLarge ? "text-lg" : "text-base")}>
            {title}
          </h4>
        )}
        {description && (
          <p className={cn("text-gray-600", isLarge ? "text-sm" : "text-xs")}>
            {description}
          </p>
        )}
        <div className={cn("w-full", chartHeight)}>
          <ChartComponent {...chartProps} />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size={isLarge ? "default" : "sm"}
            onClick={() => downloadVisualization(visualization, index)}
            className={cn(
              "text-xs",
              isLarge ? "h-8 px-3" : "h-6"
            )}
          >
            <Download className={cn(
              "mr-1",
              isLarge ? "h-4 w-4" : "h-3 w-3"
            )} />
            Descargar
          </Button>
          <Button
            variant="outline"
            size={isLarge ? "default" : "sm"}
            onClick={() => copyToClipboard(JSON.stringify(visualization, null, 2))}
            className={cn(
              "text-xs",
              isLarge ? "h-8 px-3" : "h-6"
            )}
          >
            <Copy className={cn(
              "mr-1",
              isLarge ? "h-4 w-4" : "h-3 w-3"
            )} />
            Copiar
          </Button>
        </div>
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Función mejorada para descargar visualizaciones
  const downloadVisualization = (visualization: MessageVisualization, index: number) => {
    if (!visualization || !visualization.config) {
      console.warn('Cannot download invalid visualization');
      return;
    }
    
    try {
      // Crear nombre de archivo descriptivo
      const filename = `sofia-chart-${visualization.type}-${Date.now()}.json`;
      const dataStr = JSON.stringify({
        type: visualization.type,
        title: visualization.title,
        description: visualization.description,
        config: visualization.config,
        generatedAt: new Date().toISOString()
      }, null, 2);
      
      // Crear y descargar archivo
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Visualization downloaded:', filename);
    } catch (error) {
      console.error('❌ Error downloading visualization:', error);
      alert('Error al descargar la visualización');
    }
  };

  // Función para renderizar información de datos
  const renderDataInfo = (data: MessageData) => {
    if (!data) return null;
    
    return (
      <div className="space-y-2 border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={cn(
            "text-xs",
            isLarge ? "text-sm px-3 py-1" : ""
          )}>
            📊 Datos: {data.result?.length || 0} registros
          </Badge>
          {data.summary && (
            <span className={cn(
              "text-blue-600 font-medium",
              isLarge ? "text-sm" : "text-xs"
            )}>
              {data.summary}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size={isLarge ? "default" : "sm"}
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            className={cn(
              "text-xs bg-white",
              isLarge ? "h-8 px-3" : "h-6"
            )}
          >
            <Copy className={cn(
              "mr-1",
              isLarge ? "h-4 w-4" : "h-3 w-3"
            )} />
            Copiar datos
          </Button>
          
          {data.result && data.result.length > 0 && (
            <Button
              variant="outline"
              size={isLarge ? "default" : "sm"}
              onClick={() => {
                const csv = convertToCSV(data.result!);
                downloadAsCSV(csv, 'sofia-data.csv');
              }}
              className={cn(
                "text-xs bg-white",
                isLarge ? "h-8 px-3" : "h-6"
              )}
            >
              <Download className={cn(
                "mr-1",
                isLarge ? "h-4 w-4" : "h-3 w-3"
              )} />
              CSV
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Utilidad para convertir datos a CSV
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  // Utilidad para descargar CSV
  const downloadAsCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                sofIA Chat
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSize}
                  className="h-6 w-6 p-0"
                  title="Cambiar tamaño"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSize}
                  className="h-6 w-6 p-0"
                  title="Expandir"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                  title="Cerrar"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed z-50 shadow-lg",
      isLarge 
        ? "inset-0 m-4" 
        : "bottom-4 right-4 w-[600px] h-[500px]"
    )}>
      <Card className={cn(
        "flex flex-col h-full",
        isLarge ? "w-full" : "w-[600px] h-[500px]"
      )}>
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isLarge ? "text-2xl" : "text-lg"
            )}>
              <Bot className={cn(
                "text-blue-500",
                isLarge ? "h-7 w-7" : "h-5 w-5"
              )} />
              sofIA Chat
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTTSGlobal}
                className={cn(
                  "p-0",
                  isLarge ? "h-8 w-8" : "h-6 w-6"
                )}
                title={
                  ttsEnabled 
                    ? `Desactivar TTS (${ttsService.getCurrentProvider()})` 
                    : `Activar TTS (${ttsService.getCurrentProvider()})`
                }
              >
                {ttsEnabled ? (
                  <Volume2 className={cn(
                    ttsService.getCurrentProvider() === 'elevenlabs' ? "text-purple-500" : "text-blue-500",
                    isLarge ? "h-4 w-4" : "h-3 w-3"
                  )} />
                ) : (
                  <VolumeX className={cn(
                    "text-gray-400",
                    isLarge ? "h-4 w-4" : "h-3 w-3"
                  )} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSize}
                className={cn(
                  "p-0",
                  isLarge ? "h-8 w-8" : "h-6 w-6"
                )}
                title={isLarge ? "Tamaño mediano" : "Pantalla completa"}
              >
                {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSize}
                className={cn(
                  "p-0",
                  isLarge ? "h-8 w-8" : "h-6 w-6"
                )}
                title="Minimizar"
              >
                <Minimize2 className={cn(
                  isLarge ? "h-4 w-4" : "h-3 w-3"
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={cn(
                  "p-0",
                  isLarge ? "h-8 w-8" : "h-6 w-6"
                )}
                title="Cerrar"
              >
                <X className={cn(
                  isLarge ? "h-4 w-4" : "h-3 w-3"
                )} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Mensajes */}
          <Separator className="flex-shrink-0" />

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'assistant' && (
                    <div className={cn(
                      "rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0",
                      isLarge ? "w-12 h-12" : "w-8 h-8"
                    )}>
                      <Bot className={cn(
                        "text-blue-600",
                        isLarge ? "h-6 w-6" : "h-4 w-4"
                      )} />
                    </div>
                  )}
                  
                  <div className={cn(
                    'space-y-2',
                    message.type === 'user' ? 'order-1' : 'order-2',
                    isLarge ? 'max-w-[800px]' : 'max-w-[400px]'
                  )}>
                    <div className={cn(
                      'rounded-lg px-3 py-2',
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.streaming?.isActive 
                          ? 'bg-yellow-50 border border-yellow-200 text-gray-900'
                          : message.error
                            ? 'bg-red-50 border border-red-200 text-gray-900'
                            : 'bg-gray-100 text-gray-900',
                      isLarge ? 'text-base' : 'text-sm'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Mostrar contenido principal */}
                          <div className="space-y-2">
                            {/* Contenido del mensaje */}
                            <div>{message.content}</div>
                            
                            {/* Indicador de error */}
                            {message.error && (
                              <div className={cn(
                                "p-2 bg-red-50 border border-red-200 rounded text-red-800",
                                isLarge ? "text-sm" : "text-xs"
                              )}>
                                <strong>❌ Error:</strong> {message.error}
                              </div>
                            )}
                            
                            {/* Indicador de streaming */}
                            {message.streaming?.isActive && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  </div>
                                  <span className={cn(
                                    "text-blue-600 font-medium",
                                    isLarge ? "text-sm" : "text-xs"
                                  )}>
                                    {message.streaming.currentMessage} ({message.streaming.step}/{message.streaming.totalSteps})
                                  </span>
                                </div>
                                
                                {/* Barra de progreso */}
                                <div className="w-full bg-blue-100 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ 
                                      width: `${(message.streaming.step / message.streaming.totalSteps) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                                
                                {/* Contador de eventos */}
                                <div className={cn(
                                  "text-gray-500",
                                  isLarge ? "text-xs" : "text-[10px]"
                                )}>
                                  Eventos procesados: {message.streaming.events.length}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {message.type === 'assistant' && ttsEnabled && message.isComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (playingAudio === message.id) {
                                handleStopTTS();
                              } else {
                                handlePlayTTS(message.content, message.id);
                              }
                            }}
                            className={cn(
                              "flex-shrink-0 p-1",
                              isLarge ? "h-7 w-7" : "h-5 w-5"
                            )}
                            title={playingAudio === message.id ? "Pausar audio" : "Reproducir audio"}
                          >
                            {playingAudio === message.id ? (
                              <Pause className={cn(
                                "text-blue-600",
                                isLarge ? "h-4 w-4" : "h-3 w-3"
                              )} />
                            ) : (
                              <Play className={cn(
                                "text-gray-600 hover:text-blue-600",
                                isLarge ? "h-4 w-4" : "h-3 w-3"
                              )} />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Renderizar visualizaciones si existen */}
                    {message.visualizations && message.visualizations.length > 0 && (
                      <div className="space-y-3">
                        <div className={cn(
                          "text-gray-700 font-medium border-l-4 border-blue-500 pl-2",
                          isLarge ? "text-base" : "text-sm"
                        )}>
                          📊 Visualizaciones ({message.visualizations.length})
                        </div>
                        {message.visualizations.map((visualization, index) => 
                          renderVisualization(visualization, index)
                        )}
                      </div>
                    )}
                    
                    {/* Renderizar información de datos si existen */}
                    {message.data && renderDataInfo(message.data)}
                    
                    <div className={cn(
                      "text-gray-500",
                      isLarge ? "text-sm" : "text-xs"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className={cn(
                      "rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0",
                      isLarge ? "w-12 h-12" : "w-8 h-8"
                    )}>
                      <User className={cn(
                        "text-gray-600",
                        isLarge ? "h-6 w-6" : "h-4 w-4"
                      )} />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Indicador de conexión inicial */}
              {(isLoading && !isStreaming) && (
                <div className="flex gap-3 justify-start">
                  <div className={cn(
                    "rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0",
                    isLarge ? "w-12 h-12" : "w-8 h-8"
                  )}>
                    <Bot className={cn(
                      "text-blue-600",
                      isLarge ? "h-6 w-6" : "h-4 w-4"
                    )} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg",
                    isLarge ? "text-base" : "text-sm"
                  )}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-blue-600 font-medium">Estableciendo conexión...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            </ScrollArea>
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t flex-shrink-0">
            {/* Mostrar error de reconocimiento de voz si existe */}
            {speechError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className={cn(
                  "text-red-600",
                  isLarge ? "text-sm" : "text-xs"
                )}>
                  {speechError}
                </p>
              </div>
            )}
            
            {/* Indicador de que está escuchando */}
            {isListening && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className={cn(
                    "text-blue-600",
                    isLarge ? "text-sm" : "text-xs"
                  )}>
                    Escuchando... Habla ahora
                  </p>
                  <Button
                    onClick={handleStopVoice}
                    size="sm"
                    variant="outline"
                    className="ml-auto h-6 px-2"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Parar
                  </Button>
                </div>
                {transcript && (
                  <p className={cn(
                    "mt-1 text-gray-600 italic",
                    isLarge ? "text-sm" : "text-xs"
                  )}>
                    "{transcript}"
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening 
                    ? "Escuchando..." 
                    : isStreaming 
                      ? "Procesando respuesta..."
                      : isLoading
                        ? "Conectando..."
                        : "Escribe tu mensaje o habla..."
                }
                className={cn(
                  "flex-1",
                  isLarge ? "h-12 text-base px-4" : "h-9 text-sm px-3",
                  isListening && "bg-blue-50",
                  isStreaming && "bg-yellow-50"
                )}
                disabled={isLoading || isStreaming}
              />
              
              {/* Botón para detener streaming */}
              {isStreaming && (
                <Button
                  onClick={() => {
                    stopStreaming();
                    setIsLoading(false);
                  }}
                  size={isLarge ? "lg" : "icon"}
                  variant="destructive"
                  className="flex-shrink-0"
                  title="Detener procesamiento"
                >
                  <Square className={cn(
                    isLarge ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  {isLarge && <span className="ml-2">Detener</span>}
                </Button>
              )}
              
              {/* Botón de voz */}
              {isSpeechSupported && !isStreaming && (
                <Button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  size={isLarge ? "lg" : "icon"}
                  variant={isListening ? "destructive" : "outline"}
                  className={cn(
                    "flex-shrink-0",
                    isListening && "animate-pulse"
                  )}
                  title={isListening ? "Parar grabación de voz" : "Iniciar grabación de voz"}
                >
                  {isListening ? (
                    <MicOff className={cn(
                      isLarge ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  ) : (
                    <Mic className={cn(
                      isLarge ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  )}
                  {isLarge && (
                    <span className="ml-2">
                      {isListening ? "Parar" : "Voz"}
                    </span>
                  )}
                </Button>
              )}
              
              {/* Botón de enviar */}
              {!isStreaming && (
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size={isLarge ? "lg" : "icon"}
                  className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    isLarge ? "px-4" : "",
                    (!inputValue.trim() || isLoading) 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-blue-600 hover:scale-105"
                  )}
                  title={!inputValue.trim() ? "Escribe un mensaje" : isLoading ? "Conectando..." : "Enviar mensaje"}
                >
                  {isLoading ? (
                    <Loader2 className={cn(
                      "animate-spin",
                      isLarge ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  ) : (
                    <Send className={cn(
                      isLarge ? "h-5 w-5" : "h-4 w-4"
                    )} />
                  )}
                  {isLarge && (
                    <span className="ml-2">
                      {isLoading ? "Conectando" : "Enviar"}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SofiaChat;
