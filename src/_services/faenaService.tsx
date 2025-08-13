import { ENDPOINTS } from '@/lib/constants';
import { ITaskType } from '@eon-lib/eon-mongoose';
import authService from './authService';

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
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.faenas.base), {
        headers: authService.getAuthHeaders(),
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
      const faenaData: Partial<ITaskType> = {
        ...faena,
        //state: faena.state !== undefined ? faena.state : true
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.faenas.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
      const faenaData = { ...faena };
      
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.faenas.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.faenas.changeState(id, false)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.faenas.byId(id)), {
        headers: authService.getAuthHeaders(),
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