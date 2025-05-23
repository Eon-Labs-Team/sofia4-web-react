import { ENDPOINTS } from '@/lib/constants';
import { ITask } from '@/types/ITask';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing labor (tasks) data
 */
class LaborService {
  /**
   * Get all labores
   * @returns Promise with all labores
   */
  async findAll(): Promise<ITask[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.labores.base);
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
      
      const labores = await response.json();
      return labores.data || labores;
    } catch (error) {
      console.error('Error fetching labores:', error);
      throw error;
    }
  }

  /**
   * Create a new labor
   * @param labor Labor data
   * @returns Promise with created labor
   */
  async createLabor(labor: Partial<ITask>): Promise<ITask> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const laborData: Partial<ITask> = {
        taskTypeId: labor.taskTypeId,
        optionalCode: labor.optionalCode,
        taskName: labor.taskName,
        taskPrice: labor.taskPrice,
        optimalYield: labor.optimalYield,
        isEditableInApp: labor.isEditableInApp !== undefined ? labor.isEditableInApp : true,
        usesWetCalculationPerHa: labor.usesWetCalculationPerHa !== undefined ? labor.usesWetCalculationPerHa : false,
        usageContext: labor.usageContext || "2", // Por defecto, web y app
        maxHarvestYield: labor.maxHarvestYield,
        showTotalEarningsInApp: labor.showTotalEarningsInApp !== undefined ? labor.showTotalEarningsInApp : true,
        associatedProducts: labor.associatedProducts || [],
        requiresRowCount: labor.requiresRowCount !== undefined ? labor.requiresRowCount : false,
        requiresHourLog: labor.requiresHourLog !== undefined ? labor.requiresHourLog : false,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        laborData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.labores.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laborData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating labor:', error);
      throw error;
    }
  }

  /**
   * Update an existing labor
   * @param id Labor ID
   * @param labor Updated labor data
   * @returns Promise with updated labor
   */
  async updateLabor(id: string | number, labor: Partial<ITask>): Promise<ITask> {
    try {
      const { propertyId } = useAuthStore.getState();
      const laborData = { ...labor };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        laborData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.labores.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laborData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating labor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a labor by setting its state to inactive
   * @param id Labor ID
   * @returns Promise with operation result
   */
  async softDeleteLabor(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.labores.changeState(id, false));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
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
      console.error(`Error soft deleting labor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single labor by ID
   * @param id Labor ID
   * @returns Promise with labor data
   */
  async findById(id: string | number): Promise<ITask> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.labores.byId(id));
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
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching labor ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const laborService = new LaborService();

export default laborService; 