import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GanttTask, 
  GanttViewMode,
  getGanttColors, 
  calculateDuration, 
  getDateRange,
  processTasksByViewMode
} from '@/lib/mockups/ganttMockup';
import { 
  Calendar, 
  Clock, 
  User, 
  Target, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GanttChartProps {
  tasks: GanttTask[];
  height?: string;
  onTaskClick?: (task: GanttTask) => void;
  showViewModeSelector?: boolean;
}

interface TooltipData {
  task: GanttTask;
  x: number;
  y: number;
  visible: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  tasks, 
  height = "600px", 
  onTaskClick,
  showViewModeSelector = true
}) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    task: {} as GanttTask,
    x: 0,
    y: 0,
    visible: false
  });
  const [viewMode, setViewMode] = useState<'days' | 'weeks'>('days');
  const [ganttViewMode, setGanttViewMode] = useState<GanttViewMode>('cuartel');

  // Procesar tareas según el modo de vista seleccionado
  const processedTasks = useMemo(() => {
    return processTasksByViewMode(tasks, ganttViewMode);
  }, [tasks, ganttViewMode]);

  // Calcular rango de fechas y timeline
  const { dateRange, timeline, totalDays } = useMemo(() => {
    const { minDate, maxDate } = getDateRange(processedTasks);
    
    // Agregar un padding de días al inicio y final
    const paddedMinDate = new Date(minDate);
    paddedMinDate.setDate(paddedMinDate.getDate() - 2);
    
    const paddedMaxDate = new Date(maxDate);
    paddedMaxDate.setDate(paddedMaxDate.getDate() + 2);
    
    const totalDays = Math.ceil(
      (paddedMaxDate.getTime() - paddedMinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Generar timeline
    const timeline: Date[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(paddedMinDate);
      date.setDate(date.getDate() + i);
      timeline.push(date);
    }
    
    return {
      dateRange: { minDate: paddedMinDate, maxDate: paddedMaxDate },
      timeline,
      totalDays
    };
  }, [processedTasks, viewMode]);

  // Función para calcular la posición de una tarea en el timeline
  const getTaskPosition = (task: GanttTask) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    const startDayOffset = Math.ceil(
      (startDate.getTime() - dateRange.minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const duration = calculateDuration(task.startDate, task.endDate);
    
    const leftPercent = (startDayOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return { leftPercent, widthPercent, duration };
  };

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Función para obtener texto del estado en español
  const getStateText = (state: string) => {
    const stateTexts = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      blocked: 'Bloqueada',
      void: 'Nula'
    };
    return stateTexts[state as keyof typeof stateTexts] || state;
  };

  // Función para obtener variante del badge según el estado
  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      case 'void':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Manejar hover en las barras
  const handleBarHover = (task: GanttTask, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      task,
      x: event.clientX,
      y: event.clientY - 10,
      visible: true
    });
  };

  const handleBarLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cronograma de Órdenes de Aplicación
            </CardTitle>
            <div className="flex gap-2">
              {showViewModeSelector && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={ganttViewMode} onValueChange={(value: GanttViewMode) => setGanttViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cuartel">Por Cuartel</SelectItem>
                      <SelectItem value="faena">Por Faena</SelectItem>
                      <SelectItem value="cultivo">Por Cultivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                variant={viewMode === 'days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('days')}
              >
                Días
              </Button>
              <Button
                variant={viewMode === 'weeks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('weeks')}
              >
                Semanas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height }} className="overflow-auto gantt-container">
            <div className="min-w-[800px]">
              {/* Header del timeline */}
              <div className="sticky top-0 bg-background border-b z-10">
                <div className="flex">
                  {/* Columna de tareas */}
                  <div className="w-80 p-4 border-r bg-muted/30 gantt-task-column">
                    <div className="font-semibold text-sm">Tareas</div>
                  </div>
                  
                  {/* Timeline header */}
                  <div className="flex-1 p-2">
                    <div className="flex">
                      {timeline
                        .filter((_, index) => index % (viewMode === 'weeks' ? 7 : 1) === 0)
                        .map((date, index) => (
                        <div
                          key={index}
                          className="flex-1 text-center text-xs font-medium py-2 border-l border-border gantt-timeline-header"
                          style={{ 
                            minWidth: viewMode === 'weeks' ? '100px' : '40px' 
                          }}
                        >
                          {formatDate(date)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filas de tareas */}
              <div className="relative">
                {processedTasks.map((task, index) => {
                  const { leftPercent, widthPercent, duration } = getTaskPosition(task);
                  const colors = getGanttColors(task.workState);

                  return (
                    <div key={task.id} className="flex border-b hover:bg-muted/30 gantt-task-row">
                      {/* Información de la tarea */}
                      <div className="w-80 p-3 border-r gantt-task-column">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate" title={task.taskName}>
                              {task.taskName}
                            </span>
                            <Badge variant={getStateBadgeVariant(task.workState)} className="text-xs">
                              {getStateText(task.workState)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {task.laborName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {task.cuartelName}
                          </div>
                          {task.species && (
                            <div className="text-xs text-muted-foreground">
                              {task.species} - {task.variety}
                            </div>
                          )}
                          {task.assignedWorker && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {task.assignedWorker}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Barra del Gantt */}
                      <div className="flex-1 relative h-16 flex items-center">
                        {/* Líneas de grid verticales */}
                        {timeline
                          .filter((_, index) => index % (viewMode === 'weeks' ? 7 : 1) === 0)
                          .map((_, index) => (
                          <div
                            key={index}
                            className="absolute top-0 bottom-0 gantt-grid-line"
                            style={{
                              left: `${(index * (viewMode === 'weeks' ? 7 : 1) / totalDays) * 100}%`
                            }}
                          />
                        ))}

                        {/* Barra de la tarea */}
                        <div
                          className="relative h-6 rounded cursor-pointer shadow-sm gantt-task-bar"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: colors.bg,
                            minWidth: '20px'
                          }}
                          onMouseEnter={(e) => handleBarHover(task, e)}
                          onMouseLeave={handleBarLeave}
                          onClick={() => onTaskClick?.(task)}
                        >
                          {/* Barra de progreso */}
                          <div
                            className="h-full rounded gantt-progress-bar"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: colors.progress,
                            }}
                          />
                          
                          {/* Texto en la barra */}
                          {widthPercent > 15 && (
                            <div
                              className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                              style={{ color: colors.text }}
                            >
                              {task.progress}%
                            </div>
                          )}
                        </div>

                        {/* Indicador de dependencias */}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div
                            className="absolute top-0 w-2 h-2 bg-blue-500 rounded-full"
                            style={{ left: `${leftPercent - 1}%` }}
                            title="Tiene dependencias"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="p-4 border-t bg-muted/20">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getGanttColors('confirmed').bg }} />
                <span>Confirmadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getGanttColors('pending').bg }} />
                <span>Pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getGanttColors('blocked').bg }} />
                <span>Bloqueadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getGanttColors('void').bg }} />
                <span>Nulas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Con dependencias</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 p-3 bg-popover border rounded-lg shadow-lg max-w-sm gantt-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold">{tooltip.task.orderNumber}</div>
            <div className="text-sm">{tooltip.task.taskName}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(tooltip.task.startDate).toLocaleDateString('es-CL')} - {new Date(tooltip.task.endDate).toLocaleDateString('es-CL')}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {tooltip.task.progress}% completado
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {tooltip.task.assignedWorker}
            </div>
            <div className="text-xs text-muted-foreground">
              {tooltip.task.hectares} hectáreas
            </div>
            {tooltip.task.species && (
              <div className="text-xs text-muted-foreground">
                {tooltip.task.species} - {tooltip.task.variety}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart; 