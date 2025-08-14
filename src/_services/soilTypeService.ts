import { ENDPOINTS } from '@/lib/constants';
import { ISoilType } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing soil type data
 * Uses the ISoilType interface from eon-mongoose
 */
class SoilTypeService {
  
  /**
   * Get all soil types
   * @returns Promise with all soil types
   */
  async findAll(): Promise<ISoilType[]> {
    try {
      const response = await fetch(ENDPOINTS.soilType.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching soil types:', error);
      throw error;
    }
  }

  /**
   * Create a new soil type
   * @param soilType Soil type data
   * @returns Promise with created soil type
   */
  async createSoilType(soilType: Partial<ISoilType>): Promise<ISoilType> {
    try {
      const soilTypeData: Partial<ISoilType> = {
        ...soilType,
        state: soilType.state !== undefined ? soilType.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.soilType.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(soilTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating soil type:', error);
      throw error;
    }
  }

  /**
   * Update an existing soil type
   * @param id Soil type ID
   * @param soilType Updated soil type data
   * @returns Promise with updated soil type
   */
  async updateSoilType(id: string | number, soilType: Partial<ISoilType>): Promise<ISoilType> {
    try {
      const soilTypeData = { 
        ...soilType,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.soilType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(soilTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating soil type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a soil type by setting its state to inactive
   * @param id Soil type ID
   * @returns Promise with operation result
   */
  async softDeleteSoilType(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.soilType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting soil type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single soil type by ID
   * @param id Soil type ID
   * @returns Promise with soil type data
   */
  async findById(id: string | number): Promise<ISoilType> {
    try {
      const response = await fetch(ENDPOINTS.soilType.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching soil type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a soil type
   * @param id Soil type ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.soilType.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for soil type ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const soilTypeService = new SoilTypeService();

export default soilTypeService;