import { FormGridRules } from "@/lib/validationSchemas";

/**
 * Reglas de campos para Work Association Wizard
 * 
 * Basado exactamente en ordenAplicacionRules.ts pero adaptado para WorkAssociation
 */

export const workAssociationRules: FormGridRules = {
  rules: [
    // Regla 1: Cuando se selecciona un cuartel, actualizar la especie (buscar nombre del cropType)
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'calculate',
        targetField: 'species',
        calculate: (formData, _parentData, externalData) => {
          const barracksId = formData.barracks;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 SPECIES RULE TRIGGERED!', {
              barracksId,
              formData,
              externalData: {
                cuarteles: externalData?.cuartelesOptions?.length || 0,
                cropTypes: externalData?.cropTypesOptions?.length || 0
              }
            });
          }
          
          // Buscar el cuartel seleccionado
          const selectedCuartel = externalData?.cuartelesOptions?.find((cuartel: any) => 
            cuartel._id === barracksId
          );
          
          if (!selectedCuartel?.varietySpecies) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 No varietySpecies found for selected cuartel:', barracksId);
            }
            return '';
          }
          
          // Buscar el nombre del cropType usando el varietySpecies ID
          const cropType = externalData?.cropTypesOptions?.find((crop: any) => 
            crop._id === selectedCuartel.varietySpecies
          );
          
          const speciesName = cropType?.cropName || selectedCuartel.varietySpecies;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🌱 Species lookup result:', {
              barracksId,
              varietySpeciesId: selectedCuartel.varietySpecies,
              speciesName
            });
          }
          
          return speciesName;
        }
      }
    },
    
    // Regla 2: Cuando se selecciona un cuartel, actualizar la variedad (buscar nombre del varietyType)
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'calculate',
        targetField: 'variety',
        calculate: (formData, _parentData, externalData) => {
          const barracksId = formData.barracks;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🍇 VARIETY RULE TRIGGERED!', {
              barracksId,
              formData
            });
          }
          
          // Buscar el cuartel seleccionado
          const selectedCuartel = externalData?.cuartelesOptions?.find((cuartel: any) => 
            cuartel._id === barracksId
          );
          
          if (!selectedCuartel?.variety) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 No variety found for selected cuartel:', barracksId);
            }
            return '';
          }
          
          // Buscar el nombre del varietyType usando el variety ID
          const varietyType = externalData?.varietyTypesOptions?.find((variety: any) => 
            variety._id === selectedCuartel.variety
          );
          
          const varietyName = varietyType?.varietyName || selectedCuartel.variety;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🍇 Variety lookup result:', {
              barracksId,
              varietyId: selectedCuartel.variety,
              varietyName
            });
          }
          
          return varietyName;
        }
      }
    },

    // Regla 3: Limpiar especie cuando se deselecciona el cuartel
    {
      trigger: {
        field: 'barracks',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'species',
        preset: () => ''
      }
    },

    // Regla 4: Limpiar variedad cuando se deselecciona el cuartel
    {
      trigger: {
        field: 'barracks',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'variety',
        preset: () => ''
      }
    }
  ],
  
  // Los datos externos se establecerán dinámicamente
  externalData: {
    cuartelesOptions: [],
    cropTypesOptions: [],
    varietyTypesOptions: []
  }
};

/**
 * Función helper para crear reglas con datos externos actualizados
 */
export const createWorkAssociationRules = (externalData: {
  cuartelesOptions?: any[];
  cropTypesOptions?: any[];
  varietyTypesOptions?: any[];
}): FormGridRules => {
  return {
    ...workAssociationRules,
    externalData: {
      ...workAssociationRules.externalData,
      ...externalData
    }
  };
};

