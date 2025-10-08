import { ENDPOINTS } from '@/lib/constants';
import { ITemperatureUnit } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing temperature unit data
 * Uses the ITemperatureUnit interface from eon-mongoose
 */
class TemperatureUnitService {
  
  /**
   * Get all temperature units
   * @returns Promise with all temperature units
   */
  async findAll(): Promise<ITemperatureUnit[]> {
    try {
      const response = await fetch(ENDPOINTS.temperatureUnit.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching temperature units:', error);
      throw error;
    }
  }

  /**
   * Create a new temperature unit
   * @param temperatureUnit Temperature unit data
   * @returns Promise with created temperature unit
   */
  async createTemperatureUnit(temperatureUnit: Partial<ITemperatureUnit>): Promise<ITemperatureUnit> {
    try {
      const temperatureUnitData: Partial<ITemperatureUnit> = {
        ...temperatureUnit,
        state: temperatureUnit.state !== undefined ? temperatureUnit.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.temperatureUnit.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(temperatureUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating temperature unit:', error);
      throw error;
    }
  }

  /**
   * Update an existing temperature unit
   * @param id Temperature unit ID
   * @param temperatureUnit Updated temperature unit data
   * @returns Promise with updated temperature unit
   */
  async updateTemperatureUnit(id: string | number, temperatureUnit: Partial<ITemperatureUnit>): Promise<ITemperatureUnit> {
    try {
      const temperatureUnitData = { 
        ...temperatureUnit,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.temperatureUnit.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(temperatureUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating temperature unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a temperature unit by setting its state to inactive
   * @param id Temperature unit ID
   * @returns Promise with operation result
   */
  async softDeleteTemperatureUnit(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.temperatureUnit.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting temperature unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single temperature unit by ID
   * @param id Temperature unit ID
   * @returns Promise with temperature unit data
   */
  async findById(id: string | number): Promise<ITemperatureUnit> {
    try {
      const response = await fetch(ENDPOINTS.temperatureUnit.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching temperature unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a temperature unit
   * @param id Temperature unit ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.temperatureUnit.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for temperature unit ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const temperatureUnitService = new TemperatureUnitService();

export default temperatureUnitService;