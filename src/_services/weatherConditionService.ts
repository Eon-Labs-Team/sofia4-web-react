import { ENDPOINTS } from '@/lib/constants';
import { IWeatherCondition } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing weather condition data
 * Uses the IWeatherCondition interface from eon-mongoose
 */
class WeatherConditionService {
  
  /**
   * Get all weather conditions
   * @returns Promise with all weather conditions
   */
  async findAll(): Promise<IWeatherCondition[]> {
    try {
      const response = await fetch(ENDPOINTS.weatherConditions.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching weather conditions:', error);
      throw error;
    }
  }

  /**
   * Create a new weather condition
   * @param weatherCondition Weather condition data
   * @returns Promise with created weather condition
   */
  async createWeatherCondition(weatherCondition: Partial<IWeatherCondition>): Promise<IWeatherCondition> {
    try {
      const weatherConditionData: Partial<IWeatherCondition> = {
        ...weatherCondition,
        state: weatherCondition.state !== undefined ? weatherCondition.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.weatherConditions.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(weatherConditionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating weather condition:', error);
      throw error;
    }
  }

  /**
   * Update an existing weather condition
   * @param id Weather condition ID
   * @param weatherCondition Updated weather condition data
   * @returns Promise with updated weather condition
   */
  async updateWeatherCondition(id: string | number, weatherCondition: Partial<IWeatherCondition>): Promise<IWeatherCondition> {
    try {
      const weatherConditionData = { 
        ...weatherCondition,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.weatherConditions.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(weatherConditionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating weather condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a weather condition by setting its state to inactive
   * @param id Weather condition ID
   * @returns Promise with operation result
   */
  async softDeleteWeatherCondition(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.weatherConditions.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting weather condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single weather condition by ID
   * @param id Weather condition ID
   * @returns Promise with weather condition data
   */
  async findById(id: string | number): Promise<IWeatherCondition> {
    try {
      const response = await fetch(ENDPOINTS.weatherConditions.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching weather condition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a weather condition
   * @param id Weather condition ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.weatherConditions.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for weather condition ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const weatherConditionService = new WeatherConditionService();

export default weatherConditionService;