import { FormGridRules } from "@/lib/validationSchemas";

/**
 * Reglas de campos para Cuarteles/Barracas
 * 
 * Este archivo define las reglas de reactividad entre campos para los formularios
 * de cuarteles, específicamente para el filtrado de varietySpecies → varietyType
 */

export const barracksRules: FormGridRules = {
  rules: [
    // Regla 1: Cuando se selecciona varietySpecies, filtrar variety types disponibles
    {
      trigger: { 
        field: 'varietySpecies',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'filterOptions',
        targetField: 'variety',
        filterListKey: 'varietyTypesOptions',
        filterByField: 'cropTypeId',
      }
    },

    // Regla 1b: Limpiar variety actual cuando cambie varietySpecies (solo si la variety actual no pertenece al nuevo varietySpecies)
    {
      trigger: { 
        field: 'varietySpecies',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'preset',
        targetField: 'variety',
        preset: (formData, _parentData, externalData) => {
          const varietySpeciesId = formData.varietySpecies;
          const currentVarietyId = formData.variety;
          
          if (!currentVarietyId) {
            // Si no hay variety seleccionado, mantener vacío
            return currentVarietyId;
          }
          
          // Verificar si la variety actual pertenece al varietySpecies seleccionado
          const currentVariety = externalData?.varietyTypesOptions?.find(
            (variety: any) => variety._id === currentVarietyId
          );
          
          // Si la variety actual pertenece al varietySpecies seleccionado, mantenerla
          if (currentVariety && (currentVariety.cropTypeId === varietySpeciesId || currentVariety.cropType === varietySpeciesId)) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 FieldRules: Keeping variety field - it belongs to selected varietySpecies:', currentVarietyId);
            }
            return currentVarietyId;
          }
          
          // Si no pertenece, limpiar
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 FieldRules: Cleaning variety field due to varietySpecies change:', varietySpeciesId);
          }
          return '';
        }
      }
    },

    // Regla 2: Cuando se deselecciona varietySpecies, limpiar variety y mostrar lista vacía
    {
      trigger: {
        field: 'varietySpecies',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'filterOptions',
        targetField: 'variety',
        filterListKey: 'varietyTypesOptions',
        filterFunction: (allVarieties) => {
          // Cuando no hay cropType seleccionado, mostrar lista vacía
          if (process.env.NODE_ENV === 'development') {
            console.log('🚨 FieldRules: Clearing variety options due to varietySpecies deselection');
          }
          return [];
        }
      }
    },

    // Regla 2b: Limpiar variety cuando se deselecciona varietySpecies
    {
      trigger: {
        field: 'varietySpecies',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'variety',
        preset: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚨 FieldRules: Clearing variety field due to varietySpecies deselection');
          }
          return '';
        }
      }
    }
  ],
  
  // Los datos externos se establecerán dinámicamente cuando se use el sistema
  externalData: {
    cropTypesOptions: [],      // Array de crop types con _id, cropName
    varietyTypesOptions: [],   // Array de variety types con _id, varietyName, cropTypeId
    filteredVarietyTypes: []   // Array filtrado de variety types basado en cropType seleccionado
  }
};

/**
 * Función helper para crear reglas con datos externos actualizados
 */
export const createBarracksRules = (externalData: {
  cropTypesOptions?: any[];
  varietyTypesOptions?: any[];
}): FormGridRules => {
  // Filtrar variety types basado en el crop type seleccionado
  const getFilteredVarietyTypes = (cropTypeId: string) => {
    if (!cropTypeId || !externalData.varietyTypesOptions) return [];
    
    return externalData.varietyTypesOptions.filter((variety: any) => 
      variety.cropTypeId === cropTypeId || variety.cropType === cropTypeId
    );
  };

  return {
    ...barracksRules,
    externalData: {
      ...barracksRules.externalData,
      ...externalData,
      getFilteredVarietyTypes
    }
  };
};

/**
 * Tipos para las opciones externas
 */
export interface CropTypeOption {
  _id: string;
  cropName: string;
  mapColor?: string;
  cropListState?: boolean;
  state?: boolean;
}

export interface VarietyTypeOption {
  _id: string;
  varietyName: string;
  cropTypeId: string; // o cropType dependiendo de la estructura del backend
  cropType?: string;  // campo alternativo
  state?: boolean;
}