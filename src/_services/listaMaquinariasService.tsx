import { ENDPOINTS } from '@/lib/constants';
import { IMachineryList } from '@/types/IMachineryList';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing lista maquinarias (machinery list) data
 */
class ListaMaquinariasService {
  /**
   * Get all machinery list
   * @returns Promise with all machinery list
   */
  async findAll(): Promise<IMachineryList[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.listaMaquinarias.base);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const machineryData = await response.json();
      return machineryData.data || machineryData;
    } catch (error) {
      console.error('Error fetching machinery list:', error);
      throw error;
    }
  }

  /**
   * Create a new machinery list
   * @param machineryList IMachineryList data
   * @returns Promise with created machinery list
   */
  async createMachineryList(machineryList: Partial<IMachineryList>): Promise<IMachineryList> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const machineryListData: Partial<IMachineryList> = {
        equipment: machineryList.equipment,
        classifyZone: machineryList.classifyZone,
        machineryCode: machineryList.machineryCode,
        oldMachineryCode: machineryList.oldMachineryCode,
        licensePlate: machineryList.licensePlate,
        machineType: machineryList.machineType,
        brand: machineryList.brand,
        machineryModel: machineryList.machineryModel,
        madeYear: machineryList.madeYear,
        priceHour: machineryList.priceHour,
        onCharge: machineryList.onCharge,
        machineryState: machineryList.machineryState !== undefined ? machineryList.machineryState : true,
        objective: machineryList.objective,
        litersCapacity: machineryList.litersCapacity,
        improvementLiterHa: machineryList.improvementLiterHa,
        pressureBar: machineryList.pressureBar,
        revolution: machineryList.revolution,
        change: machineryList.change,
        kmByHour: machineryList.kmByHour,
        cleaningRecord: machineryList.cleaningRecord !== undefined ? machineryList.cleaningRecord : false,
        temperature: machineryList.temperature !== undefined ? machineryList.temperature : false,
        maintenanceRecord: machineryList.maintenanceRecord !== undefined ? machineryList.maintenanceRecord : false,
        temperatureEquipment: machineryList.temperatureEquipment !== undefined ? machineryList.temperatureEquipment : false,
        classifyCost: machineryList.classifyCost,
        subClassifyCost: machineryList.subClassifyCost,
        invoicePurchaseGuide: machineryList.invoicePurchaseGuide,
        purchaseDate: machineryList.purchaseDate,
        supplier: machineryList.supplier,
        observation: machineryList.observation,
        gpsCode: machineryList.gpsCode,
        gpsSupplier: machineryList.gpsSupplier,
        propertyLoans: machineryList.propertyLoans || [],
        loansDate: machineryList.loansDate,
        loansObservation: machineryList.loansObservation,
        image: machineryList.image,
        state: machineryList.state !== undefined ? machineryList.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryListData.propertyId = propertyId;
      }

      // Add createdBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryListData.createdBy = user.id;
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryListData.updatedBy = user.id;
      }

      const response = await fetch(ENDPOINTS.listaMaquinarias.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery list:', error);
      throw error;
    }
  }

  /**
   * Update an existing machinery list
   * @param id IMachineryList ID
   * @param machineryList Updated machinery list data
   * @returns Promise with updated machinery list
   */
  async updateMachineryList(id: string | number, machineryList: Partial<IMachineryList>): Promise<IMachineryList> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const updateData = { ...machineryList };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        updateData.propertyId = propertyId;
      }

      // Add updatedBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        updateData.updatedBy = user.id;
      }
      
      const response = await fetch(ENDPOINTS.listaMaquinarias.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a machinery list by setting its state to inactive
   * @param id IMachineryList ID
   * @returns Promise with operation result
   */
  async softDeleteMachineryList(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.listaMaquinarias.changeState(id, false), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single machinery list by ID
   * @param id IMachineryList ID
   * @returns Promise with machinery list data
   */
  async findById(id: string | number): Promise<IMachineryList> {
    try {
      const response = await fetch(ENDPOINTS.listaMaquinarias.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery list ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const listaMaquinariasService = new ListaMaquinariasService();

export default listaMaquinariasService; 