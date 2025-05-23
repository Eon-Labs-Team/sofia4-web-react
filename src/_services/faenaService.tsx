import { ENDPOINTS } from '@/lib/constants';
import { ITaskType } from '@/types/ITaskType';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing faena (task type) data
 */
class FaenaService {
  /**
   * Get all faenas
   * @returns Promise with all faenas
   */
  async findAll(): Promise<ITaskType[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.faenas.base);
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
      
      const faenas = await response.json();
      return faenas.data;
    } catch (error) {
      console.error('Error fetching faenas:', error);
      throw error;
    }
  }

  /**
   * Create a new faena
   * @param faena Faena data
   * @returns Promise with created faena
   */
  async createFaena(faena: Partial<ITaskType>): Promise<ITaskType> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const faenaData: Partial<ITaskType> = {
        name: faena.name,
        optionalCode: faena.optionalCode,
        workType: faena.workType,
        usageScope: faena.usageScope,
        usesCalibrationPerHa: faena.usesCalibrationPerHa !== undefined ? faena.usesCalibrationPerHa : false,
        allowedFarms: faena.allowedFarms || [],
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        faenaData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.faenas.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faenaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating faena:', error);
      throw error;
    }
  }

  /**
   * Update an existing faena
   * @param id Faena ID
   * @param faena Updated faena data
   * @returns Promise with updated faena
   */
  async updateFaena(id: string | number, faena: Partial<ITaskType>): Promise<ITaskType> {
    try {
      const { propertyId } = useAuthStore.getState();
      const faenaData = { ...faena };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        faenaData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.faenas.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faenaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating faena ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a faena by setting its state to inactive
   * @param id Faena ID
   * @returns Promise with operation result
   */
  async softDeleteFaena(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.faenas.changeState(id, false));
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
      console.error(`Error soft deleting faena ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single faena by ID
   * @param id Faena ID
   * @returns Promise with faena data
   */
  async findById(id: string | number): Promise<ITaskType> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.faenas.byId(id));
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
      console.error(`Error fetching faena ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const faenaService = new FaenaService();

export default faenaService; 