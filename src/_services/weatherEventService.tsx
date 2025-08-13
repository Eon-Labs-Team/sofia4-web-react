import { ENDPOINTS, API_BASE_URL } from '@/lib/constants';
import { IWeatherEvent } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing weather events data
 */
class WeatherEventService {
  /**
   * Get all weather events
   * @returns Promise with all weather events
   */
  async findAll(): Promise<IWeatherEvent[]> {
    try {
      const response = await fetch(ENDPOINTS.weatherEvent.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather events:', error);
      throw error;
    }
  }

  /**
   * Create a new weather event
   * @param weatherEvent Weather event data
   * @returns Promise with created weather event
   */
  async createWeatherEvent(weatherEvent: Partial<IWeatherEvent>): Promise<IWeatherEvent> {
    try {
      const weatherEventData: Partial<IWeatherEvent> = {
        eventDate: weatherEvent.eventDate,
        temperature: weatherEvent.temperature,
        temperatureUnit: weatherEvent.temperatureUnit,
        damp: weatherEvent.damp,
        precipitation: weatherEvent.precipitation,
        windSpeed: weatherEvent.windSpeed,
        sunRadiation: weatherEvent.sunRadiation,
        others: weatherEvent.others,
        state: weatherEvent.state !== undefined ? weatherEvent.state : true
      };

      const response = await fetch(ENDPOINTS.weatherEvent.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(weatherEventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating weather event:', error);
      throw error;
    }
  }

  /**
   * Update an existing weather event
   * @param id Weather event ID
   * @param weatherEvent Updated weather event data
   * @returns Promise with updated weather event
   */
  async updateWeatherEvent(id: string | number, weatherEvent: Partial<IWeatherEvent>): Promise<IWeatherEvent> {
    try {
      const response = await fetch(ENDPOINTS.weatherEvent.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(weatherEvent),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating weather event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a weather event by setting its state to inactive
   * @param id Weather event ID
   * @returns Promise with operation result
   */
  async softDeleteWeatherEvent(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.weatherEvent.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting weather event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single weather event by ID
   * @param id Weather event ID
   * @returns Promise with weather event data
   */
  async findById(id: string | number): Promise<IWeatherEvent> {
    try {
      const response = await fetch(ENDPOINTS.weatherEvent.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching weather event ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const weatherEventService = new WeatherEventService();

export default weatherEventService; 