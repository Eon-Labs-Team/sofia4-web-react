import { ENDPOINTS } from '@/lib/constants';
import { IElectricityConsumption } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing electricity consumption data
 */
class ElectricityConsumptionService {
  /**
   * Get all electricity consumption records
   * @returns Promise with all electricity consumption records
   */
  async findAll(): Promise<IElectricityConsumption[]> {
    try {
      const response = await fetch(ENDPOINTS.electricityConsumption.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching electricity consumption records:', error);
      throw error;
    }
  }

  /**
   * Create a new electricity consumption record
   * @param data Electricity consumption data
   * @returns Promise with created electricity consumption record
   */
  async createElectricityConsumption(data: Partial<IElectricityConsumption>): Promise<IElectricityConsumption> {
    try {
      const electricityConsumptionData: Partial<IElectricityConsumption> = {
        meterNumber: data.meterNumber,
        date: data.date,
        quantity: data.quantity,
        unit: data.unit,
        state: data.state !== undefined ? data.state : true,
      };

      const response = await fetch(ENDPOINTS.electricityConsumption.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(electricityConsumptionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating electricity consumption record:', error);
      throw error;
    }
  }

  /**
   * Update an existing electricity consumption record
   * @param id Electricity consumption record ID
   * @param data Updated electricity consumption data
   * @returns Promise with updated electricity consumption record
   */
  async updateElectricityConsumption(id: string | number, data: Partial<IElectricityConsumption>): Promise<IElectricityConsumption> {
    try {
      const response = await fetch(ENDPOINTS.electricityConsumption.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating electricity consumption record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an electricity consumption record by setting its state to inactive
   * @param id Electricity consumption record ID
   * @returns Promise with operation result
   */
  async softDeleteElectricityConsumption(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.electricityConsumption.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting electricity consumption record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single electricity consumption record by ID
   * @param id Electricity consumption record ID
   * @returns Promise with electricity consumption data
   */
  async findById(id: string | number): Promise<IElectricityConsumption> {
    try {
      const response = await fetch(ENDPOINTS.electricityConsumption.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching electricity consumption record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const electricityConsumptionService = new ElectricityConsumptionService();

export default electricityConsumptionService; 