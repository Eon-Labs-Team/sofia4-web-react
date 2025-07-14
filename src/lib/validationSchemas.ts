import { z } from "zod";

// Esquema de validación para trabajadores
export const workerFormSchema = z.object({
  worker: z.string().min(1, "Debe seleccionar un trabajador"),
  classification: z.string().min(1, "La clasificación es requerida"),
  quadrille: z.string().optional(),
  workingDay: z.string().optional(),
  paymentMethod: z.string().optional(),
  contractor: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  salary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
  yield: z.coerce.number().min(0, "El rendimiento debe ser mayor o igual a 0"),
  totalHoursYield: z.coerce.number().min(0, "Las horas de rendimiento deben ser mayor o igual a 0"),
  yieldValue: z.coerce.number().min(0, "El valor de rendimiento debe ser mayor o igual a 0"),
  overtime: z.coerce.number().min(0, "Las horas extra deben ser mayor o igual a 0"),
  bonus: z.coerce.number().min(0, "El bono debe ser mayor o igual a 0"),
  additionalBonuses: z.coerce.number().min(0, "Los bonos adicionales deben ser mayor o igual a 0"),
  dayValue: z.coerce.number().min(0, "El valor día debe ser mayor o igual a 0"),
  totalDeal: z.coerce.number().min(0, "El total trato debe ser mayor o igual a 0"),
  dailyTotal: z.coerce.number().min(0, "El total diario debe ser mayor o igual a 0"),
  value: z.coerce.number().min(0, "El valor debe ser mayor o igual a 0"),
  exportPerformance: z.coerce.number().min(0, "El rendimiento exportación debe ser mayor o igual a 0"),
  juicePerformance: z.coerce.number().min(0, "El rendimiento jugo debe ser mayor o igual a 0"),
  othersPerformance: z.coerce.number().min(0, "Otros rendimientos deben ser mayor o igual a 0"),
  state: z.boolean().default(true),
  workId: z.string().optional(),
});

// Esquema de validación para maquinaria
export const machineryFormSchema = z.object({
  machinery: z.string().min(1, "El nombre de la maquinaria es requerido"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  finalHours: z.string().optional(),
  timeValue: z.coerce.number().min(0, "El valor tiempo debe ser mayor o igual a 0"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
  workId: z.string().optional(),
});

// Esquema de validación para productos
export const productFormSchema = z.object({
  category: z.string().optional(),
  product: z.string().min(1, "Debe seleccionar un producto"),
  unitOfMeasurement: z.string().min(1, "La unidad de medida es requerida"),
  amountPerHour: z.coerce.number().min(0, "La cantidad por hora debe ser mayor o igual a 0"),
  amount: z.coerce.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  netUnitValue: z.coerce.number().min(0, "El valor unitario neto debe ser mayor o igual a 0"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
  return: z.coerce.number().min(0, "El retorno debe ser mayor o igual a 0"),
  machineryRelationship: z.string().optional(),
  packagingCode: z.string().optional(),
  invoiceNumber: z.string().optional(),
  workId: z.string().optional(),
});

export type WorkerFormData = z.infer<typeof workerFormSchema>;
export type MachineryFormData = z.infer<typeof machineryFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>; 

// ====================================
// FORM GRID RULES SYSTEM
// ====================================

export interface FieldRule {
  // Cuándo se ejecuta la regla
  trigger: {
    field: string; // campo que dispara la regla
    condition?: (value: any, formData: any, parentData?: any) => boolean;
  };
  
  // Qué acción realizar
  action: {
    type: 'preset' | 'calculate';
    targetField: string;
    source?: 'parent' | 'selected' | 'external' | 'custom';
    sourceField?: string;
    calculate?: (formData: any, parentData?: any, externalData?: any) => any;
    preset?: (formData: any, parentData?: any, externalData?: any) => any;
  };
}

export interface FormGridRules {
  rules: FieldRule[];
  parentData?: any; // datos del formulario padre
  externalData?: { [key: string]: any }; // datos externos (listas, etc.)
}

// Utilidad para ejecutar reglas
export class FieldRulesEngine {
  private rules: FieldRule[];
  private parentData?: any;
  private externalData?: { [key: string]: any };

  constructor(rules: FormGridRules) {
    this.rules = rules.rules || [];
    this.parentData = rules.parentData;
    this.externalData = rules.externalData;
  }

  // Ejecutar reglas cuando un campo cambia
  executeRules(
    triggerField: string, 
    triggerValue: any, 
    currentFormData: any,
    setValue: (field: string, value: any) => void
  ): void {
    const applicableRules = this.rules.filter(rule => rule.trigger.field === triggerField);

    for (const rule of applicableRules) {
      // Verificar condición si existe
      if (rule.trigger.condition) {
        const shouldExecute = rule.trigger.condition(triggerValue, currentFormData, this.parentData);
        if (!shouldExecute) continue;
      }

      // Ejecutar acción
      let newValue: any;

      if (rule.action.type === 'preset') {
        if (rule.action.preset) {
          // Función personalizada
          newValue = rule.action.preset(currentFormData, this.parentData, this.externalData);
        } else if (rule.action.source === 'parent' && rule.action.sourceField) {
          // Valor del formulario padre
          newValue = this.getNestedValue(this.parentData, rule.action.sourceField);
        } else if (rule.action.source === 'external' && rule.action.sourceField) {
          // Valor de datos externos
          newValue = this.getNestedValue(this.externalData, rule.action.sourceField);
        }
      } else if (rule.action.type === 'calculate' && rule.action.calculate) {
        // Cálculo personalizado
        newValue = rule.action.calculate(currentFormData, this.parentData, this.externalData);
      }

      // Aplicar el nuevo valor si es válido
      if (newValue !== undefined && newValue !== null) {
        setValue(rule.action.targetField, newValue);
      }
    }
  }

  // Ejecutar todas las reglas de inicialización (útil para precargar datos)
  executeInitializationRules(
    currentFormData: any,
    setValue: (field: string, value: any) => void
  ): void {
    // Ejecutar reglas que no requieren trigger específico o que tienen preset automático
    for (const rule of this.rules) {
      if (rule.action.type === 'preset' && rule.action.source === 'parent' && rule.action.sourceField) {
        const newValue = this.getNestedValue(this.parentData, rule.action.sourceField);
        if (newValue !== undefined && newValue !== null) {
          setValue(rule.action.targetField, newValue);
        }
      }
    }
  }

  // Utilidad para acceder a propiedades anidadas
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Actualizar datos del padre (útil cuando el formulario padre cambia)
  updateParentData(newParentData: any): void {
    this.parentData = newParentData;
  }

  // Actualizar datos externos (útil cuando las listas cambian)
  updateExternalData(newExternalData: { [key: string]: any }): void {
    this.externalData = { ...this.externalData, ...newExternalData };
  }
} 