import { ENDPOINTS } from '@/lib/constants';
import { ITask } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing labor (tasks) data
 */
class LaborService {
  /**
   * Get all labores
   * @returns Promise with all labores
   */
  async findAll(propertyId?: string | number | null): Promise<ITask[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.labores.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.labores.base}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
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
  async createLabor(labor: Partial<ITask>, propertyId?: string | number | null): Promise<ITask> {
    try {
      const laborData: Partial<ITask> = {
        ...labor,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: labor.state !== undefined ? labor.state : true
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        laborData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.labores.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
      const laborData = { ...labor };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        laborData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.labores.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.labores.changeState(id, false));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.labores.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: authService.getAuthHeaders(),
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