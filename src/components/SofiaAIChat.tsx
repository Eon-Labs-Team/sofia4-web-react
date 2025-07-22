import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageSquare, Maximize2, Minimize2, X, ChevronDown, CalendarIcon, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X as XIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SofiaAIChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  result?: any;
  sql?: string;
  interpretation?: string;
  visualization?: {
    type: string;
    config: any;
  };
}

// Definir los prompts predefinidos específicos para órdenes de aplicación
const PREDEFINED_PROMPTS = [
  {
    title: "Consultar órdenes por producto",
    prompt: "Consultar órdenes de aplicación que usaron {producto} en {fecha}"
  },
  {
    title: "Órdenes por cuartel",
    prompt: "Mostrar todas las órdenes de aplicación del cuartel {cuartel} en {mes}"
  },
  {
    title: "Productos más aplicados",
    prompt: "Muestra los productos fitosanitarios más aplicados en {mes}"
  },
  {
    title: "Órdenes por estado fenológico",
    prompt: "Consultar órdenes de aplicación en estado fenológico {estado} en {fecha}"
  },
  {
    title: "Eficiencia por hectárea",
    prompt: "Analizar la eficiencia de aplicación por hectárea en {cuartel} durante {mes}"
  },
  {
    title: "Productos por tipo",
    prompt: "Mostrar órdenes que aplicaron {tipo_producto} (insecticida/fungicida/herbicida) en {fecha}"
  }
];

export function SofiaAIChat({ open, onOpenChange }: SofiaAIChatProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [fullscreenTab, setFullscreenTab] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [activeCuartelField, setActiveCuartelField] = useState<string | null>(null);
  const [activeMonthField, setActiveMonthField] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { propertyId } = useAuthStore();

  const months = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Datos de ejemplo para cuarteles (en un caso real se obtendrían de la API)
  const cuarteles = [
    { id: '1', name: 'Cuartel A - Uvas' },
    { id: '2', name: 'Cuartel B - Manzanas' },
    { id: '3', name: 'Cuartel C - Peras' },
    { id: '4', name: 'Cuartel D - Duraznos' },
    { id: '5', name: 'Cuartel E - Cerezas' }
  ];

  // Función para hacer scroll al final de los mensajes
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hacer scroll cuando se añaden nuevos mensajes o cuando cambia el estado de carga
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Función para manejar el cambio en el input
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrompt(value);
    setShowPrompts(value.startsWith('/'));
  };

  // Función para seleccionar un prompt predefinido
  const selectPrompt = (promptText: string) => {
    setPrompt(promptText);
    setShowPrompts(false);
    inputRef.current?.focus();
  };

  // Función para manejar el clic en un campo de fecha
  const handleDateFieldClick = (fieldName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveDateField(fieldName);
  };

  // Función para seleccionar una fecha
  const handleDateSelect = (date: Date | undefined, fieldName: string) => {
    if (date && activeDateField) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      const newPrompt = prompt.replace(`{${fieldName}}`, formattedDate);
      setPrompt(newPrompt);
      setSelectedDate(date);
      setActiveDateField(null);
      inputRef.current?.focus();
    }
  };

  // Función para seleccionar un cuartel
  const handleCuartelSelect = (value: string, fieldName: string) => {
    const cuartel = cuarteles.find(c => c.id === value);
    if (cuartel) {
      const newPrompt = prompt.replace(`{${fieldName}}`, cuartel.name);
      setPrompt(newPrompt);
      setActiveCuartelField(null);
      inputRef.current?.focus();
    }
  };

  const handleMonthSelect = (month: string, year: string, fieldName: string) => {
    if (month && year) {
      const formatted = `${month}/${year}`;
      const newPrompt = prompt.replace(`{${fieldName}}`, formatted);
      setPrompt(newPrompt);
      setActiveMonthField(null);
      setSelectedMonth(null);
      setSelectedYear(null);
      inputRef.current?.focus();
    }
  };

  // Función para renderizar el input enriquecido
  const renderRichPromptInput = () => {
    const parts = prompt.split(/(\{[^}]+\})/g);
    return (
      <div
        className="flex flex-wrap items-center gap-2 w-full border rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary min-h-[48px]"
        style={{ minHeight: 48 }}
      >
        {parts.map((part, index) => {
          if (part.startsWith('{') && part.endsWith('}')) {
            const fieldName = part.slice(1, -1);
            // Campo de fecha
            if (fieldName.startsWith('fecha')) {
              return (
                <Popover key={index} open={activeDateField === fieldName} onOpenChange={(open) => !open && setActiveDateField(null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 px-3 text-base font-normal inline-flex items-center border border-slate-300"
                      style={{ minWidth: 90 }}
                      onClick={() => setActiveDateField(fieldName)}
                    >
                      {part}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => handleDateSelect(date, fieldName)}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Campo de cuartel
            if (fieldName.startsWith('cuartel')) {
              return (
                <Select
                  key={index}
                  value=""
                  onValueChange={value => handleCuartelSelect(value, fieldName)}
                  open={activeCuartelField === fieldName}
                  onOpenChange={open => setActiveCuartelField(open ? fieldName : null)}
                >
                  <SelectTrigger className="h-9 px-3 text-base font-normal min-w-[150px] border border-slate-300">
                    <SelectValue placeholder="Seleccionar cuartel" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuarteles.map(cuartel => (
                      <SelectItem key={cuartel.id} value={cuartel.id}>
                        {cuartel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
            // Campo de mes
            if (fieldName.startsWith('mes')) {
              return (
                <Popover key={index} open={activeMonthField === fieldName} onOpenChange={(open) => !open && setActiveMonthField(null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 px-3 text-base font-normal inline-flex items-center border border-slate-300"
                      style={{ minWidth: 90 }}
                      onClick={() => setActiveMonthField(fieldName)}
                    >
                      {part}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 flex gap-2 items-center" align="start">
                    <select
                      className="border rounded px-2 py-1 text-base"
                      value={selectedMonth ?? ''}
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                    >
                      <option value="">Mes</option>
                      {months.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="border rounded px-2 py-1 text-base"
                      value={selectedYear ?? ''}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                    >
                      <option value="">Año</option>
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="ml-2"
                      disabled={selectedMonth === null || selectedYear === null}
                      onClick={() => handleMonthSelect(
                        (selectedMonth! < 10 ? '0' : '') + selectedMonth!,
                        String(selectedYear!),
                        fieldName
                      )}
                    >
                      Seleccionar
                    </Button>
                  </PopoverContent>
                </Popover>
              );
            }
          }
          // Cada parte de texto es un input editable
          return (
            <input
              key={index}
              type="text"
              value={part}
              className="bg-transparent border-none outline-none text-base px-1 py-2 min-w-[10px] max-w-xs flex-1"
              style={{ minWidth: 10, maxWidth: 300 }}
              onChange={e => {
                // Reemplazar solo la parte editada
                const newParts = [...parts];
                newParts[index] = e.target.value;
                setPrompt(newParts.join(''));
              }}
            />
          );
        })}
      </div>
    );
  };

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return;
    
    // Agrega el mensaje del usuario
    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    
    try {
      // Conectar con el backend de Sofia para procesar la consulta
      const response = await fetch('http://localhost:4900/sofia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          propertyId,
          companyId: '123',
          context: 'ordenes_aplicacion'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Agrega el mensaje de respuesta
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.interpretation || 'No hay interpretación disponible',
          sql: data.sql,
          result: data.result,
          interpretation: data.interpretation,
          visualization: data.visualization
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        // Expandir automáticamente la última respuesta
        setExpandedMessage(messages.length + 1);
      } else {
        // Maneja error
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Error: ${response.statusText || 'Ocurrió un error al procesar la consulta'}`
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      // Simular respuesta para demostración
      const mockResponse: ChatMessage = {
        role: 'assistant',
        content: 'He procesado tu consulta sobre órdenes de aplicación. Aquí tienes los resultados:',
        sql: 'SELECT * FROM ordenes_aplicacion WHERE workType = "A"',
        result: [
          {
            orderNumber: 'OA-001',
            executionDate: '2024-01-15',
            barracks: 'Cuartel A',
            product: 'Insecticida ABC',
            hectares: 10.5,
            status: 'Completada'
          }
        ],
        interpretation: 'Se encontraron 1 órdenes de aplicación que coinciden con tu consulta.',
        visualization: {
          type: 'table',
          config: {
            title: 'Órdenes de Aplicación',
            columns: [
              { field: 'orderNumber', title: 'Número de Orden' },
              { field: 'executionDate', title: 'Fecha' },
              { field: 'barracks', title: 'Cuartel' },
              { field: 'product', title: 'Producto' },
              { field: 'hectares', title: 'Hectáreas' },
              { field: 'status', title: 'Estado' }
            ],
            data: [
              {
                orderNumber: 'OA-001',
                executionDate: '2024-01-15',
                barracks: 'Cuartel A',
                product: 'Insecticida ABC',
                hectares: 10.5,
                status: 'Completada'
              }
            ]
          }
        }
      };
      
      setMessages(prev => [...prev, mockResponse]);
      setExpandedMessage(messages.length + 1);
    } finally {
      setLoading(false);
    }
  };

  // Convertir configuración de visualización al formato de Chart.js
  const convertToChartJsConfig = (visualization: any) => {
    if (!visualization) return null;

    // Colores predefinidos para los gráficos
    const backgroundColors = [
      'rgba(34, 197, 94, 0.6)', // verde
      'rgba(59, 130, 246, 0.6)', // azul
      'rgba(239, 68, 68, 0.6)', // rojo
      'rgba(245, 158, 11, 0.6)', // amarillo
      'rgba(168, 85, 247, 0.6)', // púrpura
      'rgba(236, 72, 153, 0.6)', // rosa
      'rgba(14, 165, 233, 0.6)', // azul claro
      'rgba(16, 185, 129, 0.6)', // verde esmeralda
    ];

    const borderColors = [
      'rgba(34, 197, 94, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(16, 185, 129, 1)',
    ];

    try {
      switch (visualization.type) {
        case 'bar': {
          const labels = visualization.config.labels || [];
          const datasets = visualization.config.datasets || [];
          
          return {
            labels,
            datasets: datasets.map((dataset: any, index: number) => ({
              label: dataset.label,
              data: dataset.data,
              backgroundColor: dataset.backgroundColor || backgroundColors[index % backgroundColors.length],
              borderColor: dataset.borderColor || borderColors[index % borderColors.length],
              borderWidth: 1,
            })),
          };
        }
        case 'line': {
          const labels = visualization.config.labels || [];
          const datasets = visualization.config.datasets || [];
          
          return {
            labels,
            datasets: datasets.map((dataset: any, index: number) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.borderColor || borderColors[index % borderColors.length],
              backgroundColor: dataset.backgroundColor || 'rgba(34, 197, 94, 0.1)',
              tension: 0.3,
              fill: dataset.fill !== undefined ? dataset.fill : false,
            })),
          };
        }
        case 'pie':
        case 'doughnut': {
          const labels = visualization.config.labels || [];
          const data = visualization.config.data || [];
          
          return {
            labels,
            datasets: [
              {
                data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderColor: borderColors.slice(0, data.length),
                borderWidth: 1,
              },
            ],
          };
        }
        default:
          return null;
      }
    } catch (error) {
      console.error('Error al convertir configuración de visualización:', error);
      return null;
    }
  };

  // Togglear el estado expandido de un mensaje
  const toggleExpandMessage = (index: number) => {
    if (expandedMessage === index) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(index);
    }
  };

  // Mostrar contenido en pantalla completa
  const handleFullscreenView = (tab: string) => {
    setFullscreenTab(tab);
    // Cerrar el modal cuando se abre en pantalla completa
    if (tab === 'visualization') {
      onOpenChange(false);
    }
  };

  // Salir de la vista de pantalla completa
  const exitFullscreen = () => {
    setFullscreenTab(null);
    // Reabrir el modal si estaba cerrado
    if (!open) {
      onOpenChange(true);
    }
  };

  // Renderiza una visualización basada en el tipo
  const renderVisualization = (visualization: { type: string; config: any }, isFullscreen = false) => {
    if (!visualization || !visualization.config) {
      return (
        <div className="p-3 bg-green-50 rounded text-green-800">
          No hay datos de visualización disponibles
        </div>
      );
    }

    const chartOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: !isFullscreen,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: visualization.config.title || 'Resultados',
          color: '#15803d', // green-700
          font: {
            size: isFullscreen ? 18 : 14
          }
        },
      },
    };

    const containerClassName = isFullscreen 
      ? "w-full h-full flex items-center justify-center p-6" 
      : "overflow-x-auto";

    switch (visualization.type) {
      case 'table': {
        if (!visualization.config.columns || !Array.isArray(visualization.config.columns) || 
            !visualization.config.data || !Array.isArray(visualization.config.data)) {
          return (
            <div className="p-3 bg-green-50 rounded text-green-800">
              Los datos de la tabla no están en el formato correcto
            </div>
          );
        }

        return (
          <div className={containerClassName}>
            <div className={`border border-green-200 rounded ${isFullscreen ? '' : 'max-h-[300px]'}`}>
              <table className="w-full border-collapse table-auto">
                <thead className="sticky top-0 z-10 bg-green-100">
                  <tr>
                    {visualization.config.columns.map((column: any, index: number) => (
                      <th key={index} className={`px-3 py-2 text-left font-medium text-green-800 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>
                        {column.title || `Columna ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
              <div 
                className={`overflow-y-scroll ${isFullscreen ? 'max-h-[calc(100vh-200px)]' : 'max-h-[250px]'}`}
                style={{ 
                  minHeight: '100px',
                  width: '100%',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#16a34a #dcfce7'
                }}
              >
                <table className="w-full border-collapse table-auto" style={{ minWidth: '100%' }}>
                  <tbody>
                    {visualization.config.data.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                        {visualization.config.columns.map((column: any, colIndex: number) => (
                          <td key={colIndex} className={`px-3 py-2 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>
                            {row[column.field]?.toString().substring(0, isFullscreen ? 100 : 50) || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      case 'bar': {
        const chartData = convertToChartJsConfig(visualization);
        return chartData ? (
          <div className={isFullscreen ? "w-full h-full p-8" : "p-4"}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="p-3 bg-green-50 rounded text-green-800">
            No se pudo generar el gráfico de barras
          </div>
        );
      }
      case 'line': {
        const chartData = convertToChartJsConfig(visualization);
        return chartData ? (
          <div className={isFullscreen ? "w-full h-full p-8" : "p-4"}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="p-3 bg-green-50 rounded text-green-800">
            No se pudo generar el gráfico de líneas
          </div>
        );
      }
      case 'pie': {
        const chartData = convertToChartJsConfig(visualization);
        return chartData ? (
          <div className={isFullscreen ? "w-full h-full flex items-center justify-center p-8" : "p-4 max-w-md mx-auto"}>
            <div style={{ width: isFullscreen ? '70%' : '100%', height: isFullscreen ? '70%' : 'auto' }}>
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-50 rounded text-green-800">
            No se pudo generar el gráfico circular
          </div>
        );
      }
      case 'doughnut': {
        const chartData = convertToChartJsConfig(visualization);
        return chartData ? (
          <div className={isFullscreen ? "w-full h-full flex items-center justify-center p-8" : "p-4 max-w-md mx-auto"}>
            <div style={{ width: isFullscreen ? '70%' : '100%', height: isFullscreen ? '70%' : 'auto' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-50 rounded text-green-800">
            No se pudo generar el gráfico de dona
          </div>
        );
      }
      default:
        return (
          <div className="p-3 bg-green-50 rounded text-green-800">
            Visualización no soportada: {visualization.type}
          </div>
        );
    }
  };

  // Renderizar vista de pantalla completa
  const renderFullscreenView = () => {
    if (!fullscreenTab || expandedMessage === null || expandedMessage >= messages.length) {
      return null;
    }

    const message = messages[expandedMessage];
    if (message.role !== 'assistant' || !message.result) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
        <div className="bg-green-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {fullscreenTab === 'interpretation' ? 'Interpretación' : 
             fullscreenTab === 'sql' ? 'Consulta SQL' : 
             fullscreenTab === 'visualization' ? 'Visualización' : 'Datos Crudos'}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={exitFullscreen} 
            className="text-white hover:bg-green-600"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto bg-white">
          {fullscreenTab === 'interpretation' && (
            <div className="p-6 text-base">
              {message.interpretation || 'No hay interpretación disponible'}
            </div>
          )}
          
          {fullscreenTab === 'sql' && (
            <pre className="p-6 text-sm bg-slate-100 overflow-x-auto h-full">
              {message.sql || 'No hay consulta SQL disponible'}
            </pre>
          )}
          
          {fullscreenTab === 'visualization' && message.visualization && (
            <div className="flex flex-col h-full">
              <div className="bg-green-50 p-4 text-green-800 border-b border-green-200">
                <p className="font-medium mb-1">Interpretación:</p>
                <p>{message.interpretation || 'No hay interpretación disponible'}</p>
              </div>
              {renderVisualization(message.visualization, true)}
            </div>
          )}
          
          {fullscreenTab === 'raw' && (
            <div className="p-6 overflow-auto h-full">
              <pre className="text-sm">{JSON.stringify(message.result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b bg-green-50">
            <DialogTitle className="text-green-800 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-green-600" />
              Sofia AI - Asistente de Órdenes de Aplicación
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground p-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium mb-2">¡Hola! Soy Sofia AI</p>
                    <p>Tu asistente inteligente para consultar órdenes de aplicación de productos fitosanitarios.</p>
                    <p className="text-sm mt-2">Escribe / para ver ejemplos de consultas predefinidas</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Card className={`${message.role === 'user' ? 'bg-green-50 max-w-[80%]' : expandedMessage === index ? 'bg-white w-full' : 'bg-white max-w-[80%]'}`}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm">{message.content}</p>
                          {message.role === 'assistant' && message.result && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => toggleExpandMessage(index)} 
                              className="h-6 w-6 -mt-1 -mr-1"
                            >
                              {expandedMessage === index ? (
                                <Minimize2 className="h-4 w-4" />
                              ) : (
                                <Maximize2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {message.role === 'assistant' && message.result && expandedMessage === index && (
                          <Tabs defaultValue="interpretation" className="mt-3">
                            <TabsList className="bg-green-50">
                              <TabsTrigger value="interpretation">Interpretación</TabsTrigger>
                              <TabsTrigger value="sql">SQL</TabsTrigger>
                              <TabsTrigger value="visualization">Visualización</TabsTrigger>
                              <TabsTrigger value="raw">Datos Crudos</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="interpretation" className="mt-2">
                              <div className="relative text-sm p-2 bg-green-50 rounded">
                                {message.interpretation || 'No hay interpretación disponible'}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleFullscreenView('interpretation')} 
                                  className="absolute top-2 right-2 h-6 w-6"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="sql" className="mt-2">
                              <div className="relative">
                                <pre className="text-xs p-2 bg-slate-100 rounded overflow-x-auto">
                                  {message.sql || 'No hay consulta SQL disponible'}
                                </pre>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleFullscreenView('sql')} 
                                  className="absolute top-2 right-2 h-6 w-6"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="visualization" className="mt-2">
                              {message.visualization ? (
                                <div className="relative">
                                  {renderVisualization(message.visualization)}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleFullscreenView('visualization')} 
                                    className="absolute top-2 right-2 h-6 w-6 bg-white/70 hover:bg-white"
                                  >
                                    <Maximize2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-sm p-2 bg-green-50 rounded">
                                  No hay visualización disponible para esta consulta
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="raw" className="mt-2">
                              <div className="relative">
                                <div className="text-xs p-2 bg-slate-100 rounded overflow-x-auto max-h-[300px]">
                                  <pre>{JSON.stringify(message.result, null, 2)}</pre>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleFullscreenView('raw')} 
                                  className="absolute top-2 right-2 h-6 w-6"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                )}
                
                {/* Elemento invisible para hacer scroll al final */}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input con prompts y campos de fecha */}
            <div className="p-4 border-t">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    {prompt.match(/\{(fecha|cuartel|mes)[^}]*\}/)
                      ? renderRichPromptInput()
                      : (
                        <Input
                          ref={inputRef}
                          value={prompt}
                          onChange={handlePromptChange}
                          placeholder="Escribe / para ver ejemplos de consultas..."
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          className="pr-10 text-base h-12"
                        />
                      )}
                  </div>
                  {prompt && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPrompt("")}
                      className="h-10 w-10 text-slate-400 hover:text-slate-700"
                      tabIndex={-1}
                      aria-label="Limpiar"
                    >
                      <XIcon className="h-5 w-5" />
                    </Button>
                  )}
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !prompt.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white h-12 w-12 flex items-center justify-center"
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                
                {showPrompts && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-md shadow-lg border z-10">
                    <div className="p-2">
                      <div className="text-sm font-medium mb-2">Consultas predefinidas</div>
                      <div className="space-y-1">
                        {PREDEFINED_PROMPTS.map((item) => (
                          <button
                            key={item.title}
                            onClick={() => selectPrompt(item.prompt)}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vista de pantalla completa */}
      {renderFullscreenView()}
    </>
  );
} 