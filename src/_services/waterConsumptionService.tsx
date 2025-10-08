import { ENDPOINTS } from '@/lib/constants';
import { IWaterConsumption } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing water consumption data
 */
class WaterConsumptionService {
  /**
   * Get all water consumption records
   * @returns Promise with all water consumption records
   */
  async findAll(): Promise<IWaterConsumption[]> {
    try {
      const response = await fetch(ENDPOINTS.waterConsumption.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching water consumption records:', error);
      throw error;
    }
  }

  /**
   * Create a new water consumption record
   * @param waterConsumption Water consumption data
   * @returns Promise with created water consumption record
   */
  async createWaterConsumption(waterConsumption: Partial<IWaterConsumption>): Promise<IWaterConsumption> {
    try {
      const waterConsumptionData: Partial<IWaterConsumption> = {
        zone: waterConsumption.zone,
        sectorOrBooth: waterConsumption.sectorOrBooth,
        date: waterConsumption.date,
        time: waterConsumption.time,
        meterNumber: waterConsumption.meterNumber,
        privateQuantity: waterConsumption.privateQuantity,
        publicQuantity: waterConsumption.publicQuantity,
        totalQuantity: waterConsumption.totalQuantity,
        flowRate: waterConsumption.flowRate,
        observation: waterConsumption.observation,
        state: waterConsumption.state !== undefined ? waterConsumption.state : true
      };

      const response = await fetch(ENDPOINTS.waterConsumption.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(waterConsumptionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating water consumption record:', error);
      throw error;
    }
  }

  /**
   * Update an existing water consumption record
   * @param id Water consumption ID
   * @param waterConsumption Updated water consumption data
   * @returns Promise with updated water consumption record
   */
  async updateWaterConsumption(id: string | number, waterConsumption: Partial<IWaterConsumption>): Promise<IWaterConsumption> {
    try {
      const response = await fetch(ENDPOINTS.waterConsumption.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(waterConsumption),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating water consumption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a water consumption record by setting its state to inactive
   * @param id Water consumption ID
   * @returns Promise with operation result
   */
  async softDeleteWaterConsumption(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.waterConsumption.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting water consumption ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single water consumption record by ID
   * @param id Water consumption ID
   * @returns Promise with water consumption data
   */
  async findById(id: string | number): Promise<IWaterConsumption> {
    try {
      const response = await fetch(ENDPOINTS.waterConsumption.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching water consumption ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const waterConsumptionService = new WaterConsumptionService();

export default waterConsumptionService; 