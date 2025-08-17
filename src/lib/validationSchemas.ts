import { z } from "zod";

// Esquema de validación para trabajadores
export const workerFormSchema = z.object({
  worker: z.string().min(1, "Debe seleccionar un trabajador"),
  classification: z.string().optional(),
  quadrille: z.string().optional(),
  workingDay: z.coerce.number().min(0, "Las jornadas debe ser mayor o igual a 0"),
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
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
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
    debounce?: number; // debounce específico para esta regla (ms)
    condition?: (value: any, formData: any, parentData?: any) => boolean;
  };
  
  // Qué acción realizar
  action: {
    type: 'preset' | 'calculate' | 'lookup' | 'filterOptions';
    targetField: string;
    source?: 'parent' | 'selected' | 'external' | 'custom' | 'list';
    sourceField?: string;
    // Nuevos campos para lookup en listas
    listKey?: string; // clave de la lista en externalData
    lookupField?: string; // campo por el cual buscar en la lista
    mappingField?: string; // campo a extraer del objeto encontrado
    calculate?: (formData: any, parentData?: any, externalData?: any) => any;
    preset?: (formData: any, parentData?: any, externalData?: any) => any;
    // Para filterOptions action - filtrar opciones de un select dinámicamente
    filterListKey?: string;     // Key en externalData para la lista a filtrar
    filterByField?: string;     // Campo por el cual filtrar
    filterFunction?: (items: any[], filterValue: any, formData?: any) => any[]; // Función custom de filtrado
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
  private debug: boolean;
  
  // Performance optimizations
  private rulesByTrigger: Map<string, FieldRule[]> = new Map();
  private debouncedExecutions: Map<string, NodeJS.Timeout> = new Map();
  
  // Callbacks para manejar filtrado de opciones
  private optionFilterCallbacks: Map<string, (filteredOptions: any[]) => void> = new Map();

  constructor(rules: FormGridRules, debug: boolean = false) {
    this.rules = rules.rules || [];
    this.parentData = rules.parentData;
    this.externalData = rules.externalData;
    this.debug = debug;
    
    // Pre-indexar reglas por trigger field para O(1) lookup
    this.indexRulesByTrigger();
  }

  // Pre-indexa las reglas por campo trigger para mejor performance
  private indexRulesByTrigger(): void {
    this.rulesByTrigger.clear();
    
    this.rules.forEach(rule => {
      const triggerField = rule.trigger.field;
      if (!this.rulesByTrigger.has(triggerField)) {
        this.rulesByTrigger.set(triggerField, []);
      }
      this.rulesByTrigger.get(triggerField)!.push(rule);
    });
    
    if (this.debug) {
      console.log('FieldRulesEngine: Indexed rules by trigger field:', 
        Object.fromEntries(this.rulesByTrigger.entries()));
    }
  }

  // Ejecutar reglas cuando un campo cambia (con debouncing)
  executeRules(
    triggerField: string, 
    triggerValue: any, 
    currentFormData: any,
    setValue: (field: string, value: any) => void
  ): void {
    // Usar índice para obtener reglas aplicables - O(1) lookup
    const applicableRules = this.rulesByTrigger.get(triggerField) || [];

    for (const rule of applicableRules) {
      // Manejar debouncing si está configurado
      if (rule.trigger.debounce) {
        this.executeWithDebounce(rule, triggerField, triggerValue, currentFormData, setValue);
      } else {
        this.executeRuleImmediately(rule, triggerValue, currentFormData, setValue);
      }
    }
  }

  // Ejecutar regla con debouncing
  private executeWithDebounce(
    rule: FieldRule,
    triggerField: string,
    triggerValue: any,
    currentFormData: any,
    setValue: (field: string, value: any) => void
  ): void {
    const debounceKey = `${triggerField}-${rule.action.targetField}`;
    
    // Cancelar ejecución anterior si existe
    if (this.debouncedExecutions.has(debounceKey)) {
      clearTimeout(this.debouncedExecutions.get(debounceKey)!);
    }

    // Programar nueva ejecución
    const timeout = setTimeout(() => {
      this.executeRuleImmediately(rule, triggerValue, currentFormData, setValue);
      this.debouncedExecutions.delete(debounceKey);
    }, rule.trigger.debounce);

    this.debouncedExecutions.set(debounceKey, timeout);
  }

  // Ejecutar regla inmediatamente
  private executeRuleImmediately(
    rule: FieldRule,
    triggerValue: any,
    currentFormData: any,
    setValue: (field: string, value: any) => void
  ): void {
    // Verificar condición si existe
    if (rule.trigger.condition) {
      const shouldExecute = rule.trigger.condition(triggerValue, currentFormData, this.parentData);
      if (!shouldExecute) return;
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
    } else if (rule.action.type === 'lookup' && rule.action.source === 'list') {
      // Buscar valor en una lista externa
      newValue = this.performListLookup(rule.action, triggerValue);
    } else if (rule.action.type === 'filterOptions') {
      // Filtrar opciones de un select
      this.performOptionsFiltering(rule.action, triggerValue, currentFormData);
      return; // No necesitamos setValue para esta acción
    }

    // Aplicar el nuevo valor solo si es diferente del actual para evitar bucles
    if (newValue !== undefined && newValue !== null) {
      const currentValue = this.getNestedValue(currentFormData, rule.action.targetField);
      if (!this.areValuesEqual(currentValue, newValue)) {
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
      
      // También ejecutar reglas de filtrado que dependan de valores iniciales
      if (rule.action.type === 'filterOptions') {
        const triggerFieldValue = this.getNestedValue(currentFormData, rule.trigger.field);
        if (triggerFieldValue) {
          // Verificar condición si existe
          const shouldExecute = rule.trigger.condition 
            ? rule.trigger.condition(triggerFieldValue, currentFormData, this.parentData)
            : true;
            
          if (shouldExecute) {
            this.performOptionsFiltering(rule.action, triggerFieldValue, currentFormData);
          }
        }
      }
    }
  }

  // Realizar lookup en una lista externa
  private performListLookup(action: FieldRule['action'], lookupValue: any): any {
    if (!action.listKey || !action.lookupField || !action.mappingField) {
      if (this.debug) {
        console.warn('performListLookup: Missing required fields (listKey, lookupField, mappingField)');
      }
      return undefined;
    }

    const list = this.externalData?.[action.listKey];
    if (!Array.isArray(list)) {
      if (this.debug) {
        console.warn(`performListLookup: List '${action.listKey}' not found or is not an array`);
      }
      return undefined;
    }

    // Buscar el elemento en la lista
    const foundItem = list.find((item: any) => {
      const itemValue = this.getNestedValue(item, action.lookupField!);
      return itemValue === lookupValue;
    });

    if (!foundItem) {
      if (this.debug) {
        console.warn(`performListLookup: No item found with ${action.lookupField} = ${lookupValue}`);
      }
      return undefined;
    }

    // Extraer el valor del campo de mapeo
    const mappedValue = this.getNestedValue(foundItem, action.mappingField!);
    if (this.debug) {
      console.log(`performListLookup: Found ${action.mappingField} = ${mappedValue} for ${action.lookupField} = ${lookupValue}`);
    }
    
    return mappedValue;
  }

  // Realizar filtrado de opciones para un select
  private performOptionsFiltering(action: FieldRule['action'], filterValue: any, formData: any): void {
    if (!action.filterListKey || !action.targetField) {
      if (this.debug) {
        console.warn('performOptionsFiltering: Missing required fields (filterListKey, targetField)');
      }
      return;
    }

    const sourceList = this.externalData?.[action.filterListKey];
    if (!Array.isArray(sourceList)) {
      if (this.debug) {
        console.warn(`performOptionsFiltering: List '${action.filterListKey}' not found or is not an array`);
      }
      return;
    }

    let filteredOptions: any[];

    if (action.filterFunction) {
      // Usar función custom de filtrado
      filteredOptions = action.filterFunction(sourceList, filterValue, formData);
    } else if (action.filterByField) {
      // Filtrado estándar por campo
      if (filterValue && filterValue !== '') {
        filteredOptions = sourceList.filter((item: any) => {
          const itemValue = this.getNestedValue(item, action.filterByField!);
          return itemValue === filterValue;
        });
      } else {
        // Si no hay valor de filtro, mostrar lista vacía o completa según configuración
        filteredOptions = [];
      }
    } else {
      // Sin filtrado específico, devolver la lista completa
      filteredOptions = [...sourceList];
    }

    if (this.debug) {
      console.log(`performOptionsFiltering: Filtered ${action.filterListKey} from ${sourceList.length} to ${filteredOptions.length} items for ${action.targetField}`);
    }

    // Llamar al callback para actualizar las opciones en el componente
    const callback = this.optionFilterCallbacks.get(action.targetField);
    if (callback) {
      callback(filteredOptions);
    }

    // También guardar en externalData para referencia
    const filteredKey = `${action.targetField}Filtered`;
    if (this.externalData) {
      this.externalData[filteredKey] = filteredOptions;
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

  // Registrar callback para filtrado de opciones
  registerOptionFilterCallback(fieldName: string, callback: (filteredOptions: any[]) => void): void {
    this.optionFilterCallbacks.set(fieldName, callback);
  }

  // Desregistrar callback
  unregisterOptionFilterCallback(fieldName: string): void {
    this.optionFilterCallbacks.delete(fieldName);
  }

  // Obtener opciones filtradas para un campo
  getFilteredOptions(fieldName: string): any[] {
    const filteredKey = `${fieldName}Filtered`;
    return this.externalData?.[filteredKey] || [];
  }

  // Obtener lista de campos que necesitan ser observados (para watch selectivo)
  getWatchedFields(): string[] {
    return Array.from(this.rulesByTrigger.keys());
  }

  // Comparar valores de forma eficiente para evitar actualizaciones innecesarias
  private areValuesEqual(value1: any, value2: any): boolean {
    // Comparación rápida para tipos primitivos
    if (value1 === value2) return true;
    
    // Si uno es null/undefined y el otro no, son diferentes
    if ((value1 == null) !== (value2 == null)) return false;
    
    // Para strings vacías vs null/undefined, considerarlas iguales
    if ((value1 === '' || value1 == null) && (value2 === '' || value2 == null)) {
      return true;
    }
    
    // Para números, convertir a string para comparar
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return value1 === value2;
    }
    
    // Para otros casos, usar comparación estricta
    return false;
  }
} 