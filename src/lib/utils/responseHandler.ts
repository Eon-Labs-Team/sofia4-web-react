import { toast } from "@/components/ui/use-toast";

// Types for the enhanced response format
export interface OperationResult {
  operation: 'WORK_CREATION' | 'ENTITY_CREATION';
  result: 'SUCCESS' | 'FAILURE';
  error?: string;
  data?: any;
  message: string;
}

export interface EnhancedEntityWorkResponse {
  success: boolean;
  overallResult: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  message: string;
  operations: OperationResult[];
  results?: {
    entityRecords?: any[];
    workRecord?: any;
  };
  metadata: {
    timestamp: string;
    entityType: string;
    recordsAttempted: number;
    recordsCreated: number;
  };
}

export interface StandardResponse {
  status: 'OK' | 'PARTIAL' | 'FAIL';
  data: EnhancedEntityWorkResponse;
}

// Configuration for different entity types
export const ENTITY_LABELS: Record<string, { singular: string; plural: string }> = {
  MONITORING_PHENOLOGICAL_STATE: { singular: 'Monitoreo', plural: 'Monitoreos' },
  IRRIGATION_RECORD: { singular: 'Registro de riego', plural: 'Registros de riego' },
  SOIL_ANALYSIS: { singular: 'Análisis de suelo', plural: 'Análisis de suelo' },
  LEAF_ANALYSIS: { singular: 'Análisis foliar', plural: 'Análisis foliares' },
  EQUIPMENT_CALIBRATION: { singular: 'Calibración de equipo', plural: 'Calibraciones de equipo' },
  FACILITY_CLEANING: { singular: 'Limpieza de instalación', plural: 'Limpiezas de instalaciones' },
  WASTE_MANAGEMENT: { singular: 'Manejo de residuos', plural: 'Manejos de residuos' },
  WEED_MONITORING: { singular: 'Monitoreo de maleza', plural: 'Monitoreos de maleza' },
  WEATHER_EVENT: { singular: 'Evento climático', plural: 'Eventos climáticos' },
  ANIMAL_ADMISSION: { singular: 'Admisión animal', plural: 'Admisiones animales' },
  HYGIENE_SANITATION: { singular: 'Higiene y saneamiento', plural: 'Higiene y saneamientos' },
  TRAINING_TALKS: { singular: 'Capacitación', plural: 'Capacitaciones' },
  VISITOR_LOG: { singular: 'Registro de visitante', plural: 'Registros de visitantes' },
  MACHINERY_CLEANING: { singular: 'Limpieza de maquinaria', plural: 'Limpiezas de maquinaria' },
  WATER_ANALYSIS: { singular: 'Análisis de agua', plural: 'Análisis de agua' },
  WATER_CONSUMPTION: { singular: 'Consumo de agua', plural: 'Consumos de agua' },
  ELECTRICITY_CONSUMPTION: { singular: 'Consumo eléctrico', plural: 'Consumos eléctricos' },
  CHLORINE_REGISTRATION: { singular: 'Registro de cloro', plural: 'Registros de cloro' },
  MASS_BALANCE: { singular: 'Balance de masa', plural: 'Balances de masa' },
  SOIL_FERTILIZATION: { singular: 'Fertilización de suelo', plural: 'Fertilizaciones de suelo' },
  GENERIC_TREATMENT: { singular: 'Tratamiento genérico', plural: 'Tratamientos genéricos' },
  PERSONNEL_PROVISION: { singular: 'Provisión de personal', plural: 'Provisiones de personal' },
  TECHNICAL_IRRIGATION_MAINTENANCE: { singular: 'Mantenimiento técnico de riego', plural: 'Mantenimientos técnicos de riego' },
  HAND_WASHING: { singular: 'Lavado de manos', plural: 'Lavados de manos' },
  CHLORINATION: { singular: 'Cloración', plural: 'Cloraciones' },
  CALIBRATE_SPRINKLER: { singular: 'Calibración de aspersor', plural: 'Calibraciones de aspersores' },
  CALIBRATION_MEASURING_EQUIPMENT: { singular: 'Calibración de equipo de medición', plural: 'Calibraciones de equipos de medición' },
  BACK_PUMP_CALCULATION: { singular: 'Cálculo de bomba trasera', plural: 'Cálculos de bombas traseras' },
  CALICATA: { singular: 'Calicata', plural: 'Calicatas' },
  IRRIGATION_SECTOR_CAPACITY: { singular: 'Capacidad sector de riego', plural: 'Capacidades de sectores de riego' },
  WASTE_REMOVAL: { singular: 'Retiro de residuos', plural: 'Retiros de residuos' },
};

// User-friendly error messages for different operations
export const OPERATION_ERROR_MESSAGES = {
  WORK_CREATION: {
    creation: "Hubo un problema al crear el trabajo asociado",
    update: "Hubo un problema al actualizar el trabajo asociado"
  },
  ENTITY_CREATION: {
    creation: "Hubo un problema al guardar el registro",
    update: "Hubo un problema al actualizar el registro"
  }
};

// User-friendly success messages for different operations  
export const OPERATION_SUCCESS_MESSAGES = {
  WORK_CREATION: {
    creation: "Trabajo asociado creado correctamente",
    update: "Trabajo asociado actualizado correctamente"
  },
  ENTITY_CREATION: {
    creation: "Registro guardado correctamente",
    update: "Registro actualizado correctamente"
  }
};

/**
 * Function to check if response follows the enhanced format
 */
export const isEnhancedResponse = (response: any): response is StandardResponse => {
  return response && 
         typeof response === 'object' && 
         'status' in response && 
         'data' in response &&
         'overallResult' in response.data &&
         'operations' in response.data &&
         Array.isArray(response.data.operations);
};

/**
 * Function to get entity label for display
 */
export const getEntityLabel = (entityType: string, isPlural: boolean = false): string => {
  const labels = ENTITY_LABELS[entityType];
  if (!labels) {
    return isPlural ? 'Registros' : 'Registro';
  }
  return isPlural ? labels.plural : labels.singular;
};

/**
 * Function to get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (operation: 'WORK_CREATION' | 'ENTITY_CREATION', operationType: 'creation' | 'update'): string => {
  return OPERATION_ERROR_MESSAGES[operation][operationType];
};

/**
 * Function to get user-friendly success message
 */
export const getUserFriendlySuccessMessage = (operation: 'WORK_CREATION' | 'ENTITY_CREATION', operationType: 'creation' | 'update'): string => {
  return OPERATION_SUCCESS_MESSAGES[operation][operationType];
};

/**
 * Function to handle enhanced response and show appropriate alerts
 */
export const handleEnhancedResponse = (
  response: StandardResponse, 
  operationType: 'creation' | 'update' = 'creation',
  entityType?: string
) => {
  const { status, data } = response;
  const { overallResult, operations, metadata } = data;

  // Get entity label for display
  const entityLabel = getEntityLabel(entityType || metadata.entityType);

  // Find specific operation results
  const workCreation = operations.find(op => op.operation === 'WORK_CREATION');
  const entityCreation = operations.find(op => op.operation === 'ENTITY_CREATION');

  switch (status) {
    case 'OK':
      // Both operations successful
      toast({
        title: "Datos guardados correctamente",
        description: `${entityLabel} ${operationType === 'creation' ? 'creado' : 'actualizado'} y trabajo asociado correctamente. ${metadata.recordsCreated} registro(s) procesado(s).`,
        variant: "default",
      });
      break;

    case 'PARTIAL':
      // Partial success - some operations failed
      let partialMessage = "";
      let actionRequired = "";

      if (entityCreation?.result === 'SUCCESS' && workCreation?.result === 'FAILURE') {
        partialMessage = `${entityLabel} ${operationType === 'creation' ? 'creado' : 'actualizado'} exitosamente, pero ${getUserFriendlyErrorMessage('WORK_CREATION', operationType).toLowerCase()}.`;
        actionRequired = "El registro se guardó correctamente, pero no se pudo asociar un trabajo. Podrás asociar un trabajo más tarde desde la opción de editar.";
      } else if (workCreation?.result === 'SUCCESS' && entityCreation?.result === 'FAILURE') {
        partialMessage = `${getUserFriendlySuccessMessage('WORK_CREATION', operationType)}, pero ${getUserFriendlyErrorMessage('ENTITY_CREATION', operationType).toLowerCase()}.`;
        actionRequired = "Por favor, revisa los datos ingresados e intenta nuevamente. Si el problema persiste, contacta al soporte técnico.";
      }

      toast({
        title: "Proceso completado parcialmente",
        description: partialMessage,
        variant: "default",
      });

      // Show action required message after a short delay
      if (actionRequired) {
        setTimeout(() => {
          toast({
            title: "Acción recomendada",
            description: actionRequired,
            variant: "default",
          });
        }, 5000);
      }
      break;

    case 'FAIL':
      // Complete failure
      let failureMessage = `No se pudo ${operationType === 'creation' ? 'crear' : 'actualizar'} el ${entityLabel.toLowerCase()}.`;
      let helpMessage = "";
      let problemAreas = [];

      if (workCreation?.result === 'FAILURE') {
        problemAreas.push("trabajo asociado");
      }
      if (entityCreation?.result === 'FAILURE') {
        problemAreas.push("registro principal");
      }

      if (problemAreas.length > 0) {
        helpMessage = `Hubo problemas con: ${problemAreas.join(' y ')}.`;
      } else {
        helpMessage = "Ocurrió un problema inesperado en el sistema.";
      }

      toast({
        title: "Error en el proceso",
        description: failureMessage,
        variant: "destructive",
      });

      // Show helpful guidance after a short delay
      setTimeout(() => {
        toast({
          title: "¿Qué puedes hacer?",
          description: `${helpMessage} Por favor, verifica los datos ingresados e intenta nuevamente. Si el problema persiste, contacta al soporte técnico.`,
          variant: "destructive",
        });
      }, 5000);
      break;

    default:
      toast({
        title: "Error inesperado",
        description: "Ocurrió un problema inesperado. Por favor, intenta nuevamente o contacta al soporte técnico.",
        variant: "destructive",
      });
  }
};

/**
 * Function to handle response with fallback to legacy format
 */
export const handleResponseWithFallback = (
  result: any,
  operationType: 'creation' | 'update',
  entityType?: string,
  fallbackSuccessMessage?: string,
  fallbackErrorMessage?: string
) => {
  if (isEnhancedResponse(result)) {
    handleEnhancedResponse(result, operationType, entityType);
  } else {
    // Fallback for legacy response format
    const entityLabel = getEntityLabel(entityType || 'GENERIC');
    const defaultSuccessMessage = `${entityLabel} ${operationType === 'creation' ? 'creado' : 'actualizado'} correctamente`;
    
    toast({
      title: "Éxito",
      description: fallbackSuccessMessage || defaultSuccessMessage,
      variant: "default",
    });
  }
};

/**
 * Function to handle errors with enhanced response format
 */
export const handleErrorWithEnhancedFormat = (
  error: any,
  operationType: 'creation' | 'update',
  entityType?: string,
  fallbackErrorMessage?: string
) => {
  // Check if error contains enhanced response format
  if (error && typeof error === 'object' && 'response' in error && isEnhancedResponse(error.response)) {
    handleEnhancedResponse(error.response as StandardResponse, operationType, entityType);
  } else {
    // Fallback for legacy error format
    const entityLabel = getEntityLabel(entityType || 'GENERIC');
    const defaultErrorMessage = `No se pudo ${operationType === 'creation' ? 'crear' : 'actualizar'} el ${entityLabel.toLowerCase()}`;
    
    toast({
      title: "Error",
      description: fallbackErrorMessage || defaultErrorMessage,
      variant: "destructive",
    });
  }
};
