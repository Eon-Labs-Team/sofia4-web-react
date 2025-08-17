import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  BarChart3,
  Download,
  Copy,
  Loader2,
  Maximize,
  Minimize
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionString, setConnectionString] = useState('mongodb://admin:RqYHnFEieZBzaifpnv@100.200.100.30:27017/sofia_corellana_qa?authSource=admin');
  const [enterpriseId, setEnterpriseId] = useState('6898f0391766d0e9d498f365');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch('http://localhost:3000/api/sofia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionString,
          enterpriseId,
          prompt: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

    const chartHeight = isFullscreen ? "h-96" : "h-64";

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

  const downloadChart = (chartConfig: any, index: number) => {
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
                  onClick={toggleFullscreen}
                  className="h-6 w-6 p-0"
                  title="Pantalla completa"
                >
                  <Maximize className="h-3 w-3" />
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
      isFullscreen 
        ? "inset-0 m-4" 
        : "bottom-4 right-4 w-96 h-[600px]"
    )}>
      <Card className={cn(
        "flex flex-col h-full",
        isFullscreen ? "w-full" : "w-96 h-[600px]"
      )}>
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              sofIA Chat
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-6 w-6 p-0"
                title={isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSize}
                className="h-6 w-6 p-0"
                title="Minimizar"
              >
                <Minimize2 className="h-3 w-3" />
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

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Configuración de conexión */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-xs font-medium">Connection String:</label>
                <Input
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="h-6 text-xs"
                  placeholder="MongoDB connection string"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Enterprise ID:</label>
                <Input
                  value={enterpriseId}
                  onChange={(e) => setEnterpriseId(e.target.value)}
                  className="h-6 text-xs"
                  placeholder="Enterprise ID"
                />
              </div>
            </div>
          </div>

          <Separator className="flex-shrink-0" />

          {/* Mensajes */}
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div className={cn(
                    'max-w-[280px] space-y-2',
                    message.type === 'user' ? 'order-1' : 'order-2'
                  )}>
                    <div className={cn(
                      'rounded-lg px-3 py-2 text-sm',
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
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
                            size="sm"
                            onClick={() => downloadChart(chart, index)}
                            className="h-6 text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(chart, null, 2))}
                            className="h-6 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Mostrar datos si existen */}
                    {message.data && message.data.result && (
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          Datos: {message.data.result.length} registros
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(message.data, null, 2))}
                          className="h-6 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar datos
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Procesando...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            </ScrollArea>
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SofiaChat;
