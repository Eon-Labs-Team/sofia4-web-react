import { ENDPOINTS } from '@/lib/constants';
import { IVarietyType } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing variety types
 */
class VarietyTypeService {
  /**
   * Get all variety types
   * @returns Promise with all variety types
   */
  async findAll(): Promise<IVarietyType[]> {
    try {
      const response = await fetch(ENDPOINTS.varietyType.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching variety types:', error);
      throw error;
    }
  }

  /**
   * Create a new variety type
   * @param variety Variety type data
   * @returns Promise with created variety type
   */
  async createVariety(variety: Partial<IVarietyType>): Promise<IVarietyType> {
    try {
      const varietyData: Partial<IVarietyType> = {
        idOrder: variety.idOrder,
        cropName: variety.cropName,
        state: variety.state !== undefined ? variety.state : true,
      };

      const response = await fetch(ENDPOINTS.varietyType.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(varietyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating variety type:', error);
      throw error;
    }
  }

  /**
   * Update an existing variety type
   * @param id Variety type ID
   * @param variety Updated variety type data
   * @returns Promise with updated variety type
   */
  async updateVariety(id: string | number, variety: Partial<IVarietyType>): Promise<IVarietyType> {
    try {
      const response = await fetch(ENDPOINTS.varietyType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(variety),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating variety type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a variety type by setting its state to inactive
   * @param id Variety type ID
   * @returns Promise with operation result
   */
  async softDeleteVariety(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.varietyType.setState(id, false), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting variety type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single variety type by ID
   * @param id Variety type ID
   * @returns Promise with variety type data
   */
  async findById(id: string | number): Promise<IVarietyType> {
    try {
      const response = await fetch(ENDPOINTS.varietyType.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching variety type ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const varietyTypeService = new VarietyTypeService();

export default varietyTypeService; 