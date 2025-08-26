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
  Square
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import sofiaChatService from '@/_services/sofiaChatService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  charts?: any[];
  data?: any;
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
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLarge, setIsLarge] = useState(false);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await sofiaChatService.sendMessage({                
        prompt: inputValue,
      });
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.data.interpretation || 'Respuesta procesada exitosamente',
          timestamp: new Date(),
          charts: data.data.visualization ? [data.data.visualization] : undefined,
          data: data.data,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Error en el procesamiento');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
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

  const renderChart = (chartConfig: any) => {
    if (!chartConfig || !chartConfig.config) return null;

    const { type, config } = chartConfig;
    
    const chartProps = {
      data: config.data,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    // Altura de los gráficos según el tamaño
    const chartHeight = isLarge ? "h-[500px]" : "h-64";

    switch (type) {
      case 'bar':
        return (
          <div className={cn("w-full mb-4", chartHeight)}>
            <Bar {...chartProps} />
          </div>
        );
      case 'line':
        return (
          <div className={cn("w-full mb-4", chartHeight)}>
            <Line {...chartProps} />
          </div>
        );
      case 'pie':
        return (
          <div className={cn("w-full mb-4", chartHeight)}>
            <Pie {...chartProps} />
          </div>
        );
      case 'doughnut':
        return (
          <div className={cn("w-full mb-4", chartHeight)}>
            <Doughnut {...chartProps} />
          </div>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadChart = (chartConfig: any) => {
    if (!chartConfig || !chartConfig.config) return;
    
    // Crear un canvas temporal para exportar
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    // Aquí podrías implementar la lógica de exportación del chart
    // Por ahora, solo mostramos un mensaje
    alert('Función de descarga en desarrollo');
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
                        : 'bg-gray-100 text-gray-900',
                      isLarge ? 'text-base' : 'text-sm'
                    )}>
                      {message.content}
                    </div>
                    
                    {/* Renderizar charts si existen */}
                    {message.charts && message.charts.map((chart, index) => (
                      <div key={index} className="space-y-2">
                        {renderChart(chart)}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size={isLarge ? "default" : "sm"}
                            onClick={() => downloadChart(chart)}
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
                            onClick={() => copyToClipboard(JSON.stringify(chart, null, 2))}
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
                    ))}
                    
                    {/* Mostrar datos si existen */}
                    {message.data && message.data.result && (
                      <div className="space-y-2">
                        <Badge variant="secondary" className={cn(
                          "text-xs",
                          isLarge ? "text-sm px-3 py-1" : ""
                        )}>
                          Datos: {message.data.result.length} registros
                        </Badge>
                        <Button
                          variant="outline"
                          size={isLarge ? "default" : "sm"}
                          onClick={() => copyToClipboard(JSON.stringify(message.data, null, 2))}
                          className={cn(
                            "text-xs",
                            isLarge ? "h-8 px-3" : "h-6"
                          )}
                        >
                          <Copy className={cn(
                            "mr-1",
                            isLarge ? "h-4 w-4" : "h-3 w-3"
                          )} />
                          Copiar datos
                        </Button>
                      </div>
                    )}
                    
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
              
              {isLoading && (
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
                    "flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg",
                    isLarge ? "text-base" : "text-sm"
                  )}>
                    <Loader2 className={cn(
                      "animate-spin",
                      isLarge ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    <span className="text-gray-600">Procesando...</span>
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
                placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje o habla..."}
                className={cn(
                  "flex-1",
                  isLarge ? "h-12 text-base px-4" : "h-9 text-sm px-3",
                  isListening && "bg-blue-50"
                )}
                disabled={isLoading}
              />
              
              {/* Botón de voz */}
              {isSpeechSupported && (
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
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size={isLarge ? "lg" : "icon"}
                className={cn(
                  "flex-shrink-0",
                  isLarge ? "px-4" : ""
                )}
              >
                <Send className={cn(
                  isLarge ? "h-5 w-5" : "h-4 w-4"
                )} />
                {isLarge && <span className="ml-2">Enviar</span>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SofiaChat;
