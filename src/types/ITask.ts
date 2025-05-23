import { Document } from 'mongoose';

export interface AssociatedProductsType {
  productId: string;
  quantity: number;
}

export interface ITask extends Document {
  

  taskTypeId: string;
  /** Código opcional de referencia interna. Puede quedar vacío. */
  optionalCode?: string;
  
  /** Nombre de la tarea */
  taskName: string;
  
  /** Precio de la tarea */
  taskPrice: number;
  
  /** Rendimiento óptimo */
  optimalYield: number;
  
  /** Si es editable en la aplicación */
  isEditableInApp: boolean;
  
  /** Si utiliza cálculo húmedo por hectárea */
  usesWetCalculationPerHa: boolean;
  
  /** Contexto de uso: 0: solo web, 1: solo app, 2: web y app, 3:desactivado */
  usageContext: string;
  
  /** Rendimiento máximo de cosecha */
  maxHarvestYield: number;
  
  /** Mostrar ganancias totales en la aplicación */
  showTotalEarningsInApp: boolean;
  
  /** Productos asociados */
  associatedProducts: AssociatedProductsType[];
  
  /** Si requiere conteo de filas */
  requiresRowCount: boolean;
  
  /** Si requiere registro de horas */
  requiresHourLog: boolean;
  
  /** Marca de tiempo opcional para auditoría. */
  createdAt?: Date;
  updatedAt?: Date;
} 