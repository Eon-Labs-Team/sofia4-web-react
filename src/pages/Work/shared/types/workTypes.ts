import type { 
  IWork, 
  IWorkers, 
  IWorkerList, 
  IMachinery, 
  IMachineryList, 
  IProducts, 
  IProductCategory, 
  ITaskType, 
  ITask, 
  IWeatherCondition, 
  IWindCondition, 
  ICropType, 
  IVarietyType, 
  IOperationalArea
} from "@eon-lib/eon-mongoose/types";

// Tipos de trabajo específicos para nuestro sistema
export type WorkType = 'A' | 'C' | 'T';
export type WorkState = 'confirmed' | 'pending' | 'void' | 'blocked';
import type { Column } from "@/lib/store/gridStore";
import type { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import type { FormGridRules } from "@/lib/validationSchemas";

/**
 * Configuración específica para cada tipo de trabajo
 */
export interface WorkTypeConfig {
  workType: WorkType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  
  // Configuraciones de formulario
  formSections: SectionConfig[];
  defaultValues: Record<string, any>;
  validationSchema?: any;
  
  // Configuraciones de grid
  gridColumns: Column[];
  
  // Reglas de campo específicas
  fieldRules?: FormGridRules;
  
  // Componentes específicos opcionales
  specificComponents?: {
    customModals?: React.ComponentType<any>[];
    customSections?: React.ComponentType<any>[];
    customGrids?: React.ComponentType<any>[];
  };
  
  // Configuraciones específicas del tipo
  features?: {
    requiresProducts?: boolean;
    requiresWeather?: boolean;
    requiresPPE?: boolean;
    requiresWashing?: boolean;
    requiresHarvest?: boolean;
    requiresYield?: boolean;
    requiresQuality?: boolean;
  };
}

/**
 * Datos maestros necesarios para todos los tipos de trabajo
 */
export interface WorkMasterData {
  // Entidades principales
  workers: IWorkers[];
  workerList: IWorkerList[];
  machinery: IMachinery[];
  machineryList: IMachineryList[];
  products: IProducts[];
  productCategories: IProductCategory[];
  
  // Configuración de tareas
  taskTypes: ITaskType[];
  allTasks: ITask[];
  
  // Datos de contexto
  cuarteles: IOperationalArea[];
  weatherConditions: IWeatherCondition[];
  windConditions: IWindCondition[];
  cropTypes: ICropType[];
  varietyTypes: IVarietyType[];
  
  // Datos de inventario (para aplicaciones)
  warehouseProducts?: any[];
}

/**
 * Estado base para gestión de trabajos
 */
export interface WorkComponentState {
  // Datos principales
  works: IWork[];
  selectedWork: IWork | null;
  isLoading: boolean;
  
  // Modales y UI
  isDialogOpen: boolean;
  isWizardDialogOpen: boolean;
  isEditMode: boolean;
  
  // Entidades relacionadas al trabajo seleccionado
  workWorkers: IWorkers[];
  workMachinery: IMachinery[];
  workProducts: IProducts[];
  
  // Controles de vista
  showMap: boolean;
  showGantt: boolean;
  showActivity: boolean;
}

/**
 * Props para componentes de trabajo
 */
export interface WorkComponentProps {
  workType: WorkType;
  masterData: WorkMasterData;
  state: WorkComponentState;
  onStateChange: (updates: Partial<WorkComponentState>) => void;
  onWorkCreate: (workData: Partial<IWork>) => Promise<void>;
  onWorkUpdate: (id: string, workData: Partial<IWork>) => Promise<void>;
  onWorkDelete: (id: string) => Promise<void>;
}

/**
 * Opciones para el selector de tipo de trabajo
 */
export interface WorkTypeSelectorOption {
  workType: WorkType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
}

/**
 * Resultado de validación de formulario
 */
export interface WorkFormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

/**
 * Configuración para grids de entidades relacionadas (workers, machinery, products)
 */
export interface EntityGridConfig {
  entityType: 'workers' | 'machinery' | 'products';
  columns: Column[];
  formSections: SectionConfig[];
  fieldRules?: FormGridRules;
  validationSchema?: any;
  defaultValues?: Record<string, any>;
}

/**
 * Helper types para mejor tipado
 */
export type WorkTypeConfigMap = Record<WorkType, WorkTypeConfig>;
export type WorkFormData = Partial<IWork>;
export type WorkEntityData = IWorkers | IMachinery | IProducts;

/**
 * Estados de trabajo disponibles con metadata
 */
export const WORK_STATES: Record<WorkState, { label: string; color: string; icon: string }> = {
  confirmed: { label: 'Confirmada', color: 'green', icon: 'CheckCircle' },
  pending: { label: 'Pendiente', color: 'amber', icon: 'AlertTriangle' },
  void: { label: 'Nula', color: 'gray', icon: 'XCircle' },
  blocked: { label: 'Bloqueada', color: 'red', icon: 'XCircle' }
} as const;

/**
 * Tipos de trabajo disponibles con metadata
 */
export const WORK_TYPES: Record<WorkType, { label: string; description: string }> = {
  A: { label: 'Aplicación de Productos', description: 'Aplicaciones de pesticidas, fertilizantes y otros productos químicos' },
  C: { label: 'Cosecha', description: 'Actividades de cosecha y recolección de productos agrícolas' },
  T: { label: 'Trabajo Agrícola', description: 'Labores agrícolas generales y mantenimiento de cultivos' }
} as const;