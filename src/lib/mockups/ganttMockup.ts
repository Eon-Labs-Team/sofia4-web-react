// Datos mockup para gráfico Gantt de órdenes de aplicación
export interface GanttTask {
  id: string;
  orderNumber: string;
  taskName: string;
  laborName: string;
  cuartelName: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  workState: 'confirmed' | 'pending' | 'void' | 'blocked';
  dependencies?: string[]; // IDs de tareas dependientes
  assignedWorker?: string;
  hectares: number;
  species?: string;
  variety?: string;
  taskType?: string;
}

export type GanttViewMode = 'cuartel' | 'faena' | 'cultivo';

export const ganttTasks: GanttTask[] = [
  {
    id: "gantt_1",
    orderNumber: "APL-2024-001",
    taskName: "Aplicación Preventiva Uva",
    laborName: "Aplicación de Fungicida",
    cuartelName: "Cuartel Norte A",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    progress: 100,
    workState: "confirmed",
    assignedWorker: "Juan Pérez",
    hectares: 15.5
  },
  {
    id: "gantt_2",
    orderNumber: "APL-2024-002",
    taskName: "Control Plagas Palto",
    laborName: "Aplicación de Insecticida",
    cuartelName: "Cuartel Sur B",
    startDate: "2024-01-18",
    endDate: "2024-01-20",
    progress: 60,
    workState: "pending",
    assignedWorker: "María González",
    hectares: 8.2
  },
  {
    id: "gantt_3",
    orderNumber: "APL-2024-003",
    taskName: "Fertilización Cerezo",
    laborName: "Fertilización Foliar",
    cuartelName: "Cuartel Este C",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    progress: 85,
    workState: "confirmed",
    dependencies: ["gantt_1"],
    assignedWorker: "Carlos Rodríguez",
    hectares: 12.0
  },
  {
    id: "gantt_4",
    orderNumber: "APL-2024-004",
    taskName: "Aplicación Herbicida Manzano",
    laborName: "Control de Malezas",
    cuartelName: "Cuartel Oeste D",
    startDate: "2024-01-22",
    endDate: "2024-01-25",
    progress: 0,
    workState: "blocked",
    assignedWorker: "Ana López",
    hectares: 20.3
  },
  {
    id: "gantt_5",
    orderNumber: "APL-2024-005",
    taskName: "Tratamiento Sanitario Durazno",
    laborName: "Aplicación Sanitaria",
    cuartelName: "Cuartel Central E",
    startDate: "2024-01-25",
    endDate: "2024-01-27",
    progress: 30,
    workState: "pending",
    dependencies: ["gantt_3"],
    assignedWorker: "Luis Martínez",
    hectares: 6.8
  },
  {
    id: "gantt_6",
    orderNumber: "APL-2024-006",
    taskName: "Aplicación Insecticida Nogal",
    laborName: "Control de Insectos",
    cuartelName: "Cuartel Nuevo F",
    startDate: "2024-01-28",
    endDate: "2024-01-30",
    progress: 0,
    workState: "void",
    assignedWorker: "Pedro Sánchez",
    hectares: 18.7
  },
  {
    id: "gantt_7",
    orderNumber: "APL-2024-007",
    taskName: "Control Malezas Olivo",
    laborName: "Aplicación Herbicida",
    cuartelName: "Cuartel Viejo G",
    startDate: "2024-02-01",
    endDate: "2024-02-03",
    progress: 95,
    workState: "confirmed",
    dependencies: ["gantt_5"],
    assignedWorker: "Rosa Fernández",
    hectares: 25.4
  },
  {
    id: "gantt_8",
    orderNumber: "APL-2024-008",
    taskName: "Nutrición Foliar Limón",
    laborName: "Fertilización Foliar",
    cuartelName: "Cuartel Alto H",
    startDate: "2024-02-05",
    endDate: "2024-02-07",
    progress: 45,
    workState: "pending",
    assignedWorker: "Miguel Torres",
    hectares: 11.2
  },
  {
    id: "gantt_9",
    orderNumber: "APL-2024-009",
    taskName: "Aplicación Bioestimulante Kiwi",
    laborName: "Bioestimulación",
    cuartelName: "Cuartel Bajo I",
    startDate: "2024-02-08",
    endDate: "2024-02-10",
    progress: 70,
    workState: "confirmed",
    dependencies: ["gantt_7"],
    assignedWorker: "Elena Vargas",
    hectares: 9.6
  },
  {
    id: "gantt_10",
    orderNumber: "APL-2024-010",
    taskName: "Control Hongos Arándano",
    laborName: "Aplicación Fungicida",
    cuartelName: "Cuartel Colina J",
    startDate: "2024-02-12",
    endDate: "2024-02-15",
    progress: 0,
    workState: "blocked",
    dependencies: ["gantt_8"],
    assignedWorker: "Francisco Ruiz",
    hectares: 14.1
  }
];

// Colores para diferentes estados en el Gantt
export const ganttStateColors = {
  confirmed: {
    bg: '#10b981',      // green-500
    progress: '#059669', // green-600
    text: '#ffffff'
  },
  pending: {
    bg: '#f59e0b',      // amber-500
    progress: '#d97706', // amber-600
    text: '#ffffff'
  },
  blocked: {
    bg: '#ef4444',      // red-500
    progress: '#dc2626', // red-600
    text: '#ffffff'
  },
  void: {
    bg: '#6b7280',      // gray-500
    progress: '#4b5563', // gray-600
    text: '#ffffff'
  }
};

// Función para obtener colores según estado
export const getGanttColors = (state: string) => {
  return ganttStateColors[state as keyof typeof ganttStateColors] || ganttStateColors.pending;
};

// Función para calcular la duración en días
export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para obtener el rango de fechas de todas las tareas
export const getDateRange = (tasks: GanttTask[]) => {
  if (tasks.length === 0) {
    // Si no hay tareas, retornar fechas por defecto
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { minDate: today, maxDate: tomorrow };
  }
  
  const allDates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  return { minDate, maxDate };
};

// Función para transformar datos IWork a GanttTask
export const transformWorkToGanttTask = (work: any): GanttTask => {
  const taskName = work.task?.taskName || work.customTask || 'Tarea sin nombre';
  const laborName = work.task?.taskName || work.customTask || 'Labor sin nombre';
  const cuartelName = work.barracks || 'Cuartel sin nombre';
  
  // Calcular progreso basado en hectáreas aplicadas
  const progress = work.hectares > 0 ? Math.round((work.appliedHectares / work.hectares) * 100) : 0;
  
  // Obtener el trabajador asignado
  const assignedWorker = work.responsibles?.supervisor?.name || 
                        work.responsibles?.planner?.name || 
                        work.workers?.[0]?.worker || 
                        'Sin asignar';
  
  // Manejar fechas - usar executionDate como fallback
  const startDate = work.startDate || work.executionDate || new Date().toISOString().split('T')[0];
  const endDate = work.endDate || work.executionDate || startDate;
  
  return {
    id: work._id || work.id,
    orderNumber: work.orderNumber || 'SIN-ORDEN',
    taskName,
    laborName,
    cuartelName,
    startDate,
    endDate,
    progress,
    workState: work.workState || 'pending',
    assignedWorker,
    hectares: work.hectares || 0,
    species: work.species,
    variety: work.variety,
    taskType: work.taskType
  };
};

// Función para agrupar tareas por cuartel
export const groupTasksByBarracks = (tasks: GanttTask[]): GanttTask[] => {
  const grouped = tasks.reduce((acc, task) => {
    const key = task.cuartelName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, GanttTask[]>);

  return Object.values(grouped).flat();
};

// Función para agrupar tareas por faena
export const groupTasksByFaena = (tasks: GanttTask[]): GanttTask[] => {
  const grouped = tasks.reduce((acc, task) => {
    const key = task.taskType || 'Sin tipo';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, GanttTask[]>);

  return Object.values(grouped).flat();
};

// Función para agrupar tareas por cultivo
export const groupTasksByCultivo = (tasks: GanttTask[]): GanttTask[] => {
  const grouped = tasks.reduce((acc, task) => {
    const key = task.species || 'Sin especie';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, GanttTask[]>);

  return Object.values(grouped).flat();
};

// Función para filtrar y agrupar tareas según el modo de vista
export const processTasksByViewMode = (tasks: GanttTask[], viewMode: GanttViewMode): GanttTask[] => {
  switch (viewMode) {
    case 'cuartel':
      return groupTasksByBarracks(tasks);
    case 'faena':
      return groupTasksByFaena(tasks);
    case 'cultivo':
      return groupTasksByCultivo(tasks);
    default:
      return tasks;
  }
}; 