import { ENDPOINTS } from '@/lib/constants';
import { IChlorination } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing water chlorination data
 */
class ChlorinationService {
  /**
   * Get all chlorination records
   * @returns Promise with all chlorination records
   */
  async findAll(): Promise<IChlorination[]> {
    try {
      const response = await fetch(`${ENDPOINTS.chlorination.base}`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chlorination records:', error);
      throw error;
    }
  }

  /**
   * Create a new chlorination record
   * @param chlorination Chlorination data
   * @returns Promise with created chlorination record
   */
  async createChlorination(chlorination: Partial<IChlorination>): Promise<IChlorination> {
    try {
      const chlorinationData: Partial<IChlorination> = {
        date: chlorination.date,
        site: chlorination.site,
        supervisor: chlorination.supervisor,
        frequency: chlorination.frequency,
        observations: chlorination.observations,
        name: chlorination.name,
        signature: chlorination.signature,
        state: chlorination.state !== undefined ? chlorination.state : true,
      };

      const response = await fetch(`${ENDPOINTS.chlorination.base}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(chlorinationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chlorination record:', error);
      throw error;
    }
  }

  /**
   * Update an existing chlorination record
   * @param id Chlorination ID
   * @param chlorination Updated chlorination data
   * @returns Promise with updated chlorination record
   */
  async updateChlorination(id: string | number, chlorination: Partial<IChlorination>): Promise<IChlorination> {
    try {
      const response = await fetch(`${ENDPOINTS.chlorination.byId(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(chlorination),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating chlorination record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a chlorination record by setting its state to inactive
   * @param id Chlorination ID
   * @returns Promise with operation result
   */
  async softDeleteChlorination(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.chlorination.changeState(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting chlorination record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single chlorination record by ID
   * @param id Chlorination ID
   * @returns Promise with chlorination data
   */
  async findById(id: string | number): Promise<IChlorination> {
    try {
      const response = await fetch(`${ENDPOINTS.chlorination.byId(id)}`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching chlorination record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const chlorinationService = new ChlorinationService();

export default chlorinationService; 