import { ENDPOINTS } from '@/lib/constants';
import { IWindCondition } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing wind condition data
 * Uses the IWindCondition interface from eon-mongoose
 */
class WindConditionService {
  
  /**
   * Get all wind conditions
   * @returns Promise with all wind conditions
   */
  async findAll(): Promise<IWindCondition[]> {
    try {
      const response = await fetch(ENDPOINTS.windConditions.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching wind conditions:', error);
      throw error;
    }
  }

  /**
   * Create a new wind condition
   * @param windCondition Wind condition data
   * @returns Promise with created wind condition
   */
  async createWindCondition(windCondition: Partial<IWindCondition>): Promise<IWindCondition> {
    try {
      const windConditionData: Partial<IWindCondition> = {
        ...windCondition,
        state: windCondition.state !== undefined ? windCondition.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.windConditions.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(windConditionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating wind condition:', error);
      throw error;
    }
  }

  /**
   * Update an existing wind condition
   * @param id Wind condition ID
   * @param windCondition Updated wind condition data
   * @returns Promise with updated wind condition
   */
  async updateWindCondition(id: string | number, windCondition: Partial<IWindCondition>): Promise<IWindCondition> {
    try {
      const windConditionData = { 
        ...windCondition,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.windConditions.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(windConditionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating wind condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a wind condition by setting its state to inactive
   * @param id Wind condition ID
   * @returns Promise with operation result
   */
  async softDeleteWindCondition(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.windConditions.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting wind condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single wind condition by ID
   * @param id Wind condition ID
   * @returns Promise with wind condition data
   */
  async findById(id: string | number): Promise<IWindCondition> {
    try {
      const response = await fetch(ENDPOINTS.windConditions.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching wind condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a wind condition
   * @param id Wind condition ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.windConditions.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for wind condition ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const windConditionService = new WindConditionService();

export default windConditionService;