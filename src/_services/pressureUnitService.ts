import { ENDPOINTS } from '@/lib/constants';
import { IPressureUnit } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing pressure unit data
 * Uses the IPressureUnit interface from eon-mongoose
 */
class PressureUnitService {
  
  /**
   * Get all pressure units
   * @returns Promise with all pressure units
   */
  async findAll(): Promise<IPressureUnit[]> {
    try {
      const response = await fetch(ENDPOINTS.pressureUnit.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching pressure units:', error);
      throw error;
    }
  }

  /**
   * Create a new pressure unit
   * @param pressureUnit Pressure unit data
   * @returns Promise with created pressure unit
   */
  async createPressureUnit(pressureUnit: Partial<IPressureUnit>): Promise<IPressureUnit> {
    try {
      const pressureUnitData: Partial<IPressureUnit> = {
        ...pressureUnit,
        state: pressureUnit.state !== undefined ? pressureUnit.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.pressureUnit.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(pressureUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating pressure unit:', error);
      throw error;
    }
  }

  /**
   * Update an existing pressure unit
   * @param id Pressure unit ID
   * @param pressureUnit Updated pressure unit data
   * @returns Promise with updated pressure unit
   */
  async updatePressureUnit(id: string | number, pressureUnit: Partial<IPressureUnit>): Promise<IPressureUnit> {
    try {
      const pressureUnitData = { 
        ...pressureUnit,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.pressureUnit.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(pressureUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating pressure unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a pressure unit by setting its state to inactive
   * @param id Pressure unit ID
   * @returns Promise with operation result
   */
  async softDeletePressureUnit(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.pressureUnit.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting pressure unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single pressure unit by ID
   * @param id Pressure unit ID
   * @returns Promise with pressure unit data
   */
  async findById(id: string | number): Promise<IPressureUnit> {
    try {
      const response = await fetch(ENDPOINTS.pressureUnit.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching pressure unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a pressure unit
   * @param id Pressure unit ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.pressureUnit.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for pressure unit ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const pressureUnitService = new PressureUnitService();

export default pressureUnitService;