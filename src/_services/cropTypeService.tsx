import { ENDPOINTS } from '@/lib/constants';
import { ICropType } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing crop type data
 */
class CropTypeService {
  /**
   * Get all crop types
   * @returns Promise with all crop types
   */
  async findAll(): Promise<ICropType[]> {
    try {
      const response = await fetch(ENDPOINTS.cropType.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const cropTypeData = await response.json();
      return cropTypeData.data || cropTypeData;
    } catch (error) {
      console.error('Error fetching crop types:', error);
      throw error;
    }
  }

  /**
   * Create a new crop type
   * @param cropType Crop type data
   * @returns Promise with created crop type
   */
  async createCropType(cropType: Partial<ICropType>): Promise<ICropType> {
    try {
      const cropTypeData: Partial<ICropType> = {
        order: (cropType as any).idOrder || (cropType as any).order,
        cropName: cropType.cropName,
        mapColor: cropType.mapColor,
        cropListState: cropType.cropListState,
        state: cropType.state !== undefined ? cropType.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.cropType.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cropTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating crop type:', error);
      throw error;
    }
  }

  /**
   * Update an existing crop type
   * @param id Crop type ID
   * @param cropType Updated crop type data
   * @returns Promise with updated crop type
   */
  async updateCropType(id: string | number, cropType: Partial<ICropType>): Promise<ICropType> {
    try {
      const cropTypeData = {
        ...cropType,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.cropType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cropTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating crop type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a crop type by setting its state to inactive
   * @param id Crop type ID
   * @returns Promise with operation result
   */
  async softDeleteCropType(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.cropType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting crop type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single crop type by ID
   * @param id Crop type ID
   * @returns Promise with crop type data
   */
  async findById(id: string | number): Promise<ICropType> {
    try {
      const response = await fetch(ENDPOINTS.cropType.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching crop type ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const cropTypeService = new CropTypeService();

export default cropTypeService; 