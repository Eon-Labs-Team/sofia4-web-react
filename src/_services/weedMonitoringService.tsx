import { ENDPOINTS } from '@/lib/constants';
import { IWeedMonitoring } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

interface ApiResponse<T> {
  data: T[];
  status?: number;
  message?: string;
}

/**
 * Service for managing weed monitoring data
 */
class WeedMonitoringService {
  /**
   * Get all weed monitoring records
   * @returns Promise with all weed monitoring records or an ApiResponse containing the records
   */
  async findAll(): Promise<IWeedMonitoring[] | ApiResponse<IWeedMonitoring>> {
    try {
      const response = await fetch(ENDPOINTS.weedMonitoring.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching weed monitoring records:', error);
      throw error;
    }
  }

  /**
   * Create a new weed monitoring record
   * @param monitoring Weed monitoring data
   * @returns Promise with created weed monitoring record
   */
  async createWeedMonitoring(monitoring: Partial<IWeedMonitoring>): Promise<IWeedMonitoring> {
    try {
      const weedMonitoringData: Partial<IWeedMonitoring> = {
        date: monitoring.date,
        barracks: monitoring.barracks,
        crop: monitoring.crop,
        variety: monitoring.variety,
        sector: monitoring.sector,
        weedType: monitoring.weedType,
        developmentLevel: monitoring.developmentLevel,
        responsible: monitoring.responsible,
        observation: monitoring.observation,
        image1: monitoring.image1,
        image2: monitoring.image2,
        image3: monitoring.image3,
        state: monitoring.state !== undefined ? monitoring.state : true,
      };

      const response = await fetch(ENDPOINTS.weedMonitoring.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(weedMonitoringData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating weed monitoring record:', error);
      throw error;
    }
  }

  /**
   * Update an existing weed monitoring record
   * @param id Weed monitoring ID
   * @param monitoring Updated weed monitoring data
   * @returns Promise with updated weed monitoring record
   */
  async updateWeedMonitoring(id: string | number, monitoring: Partial<IWeedMonitoring>): Promise<IWeedMonitoring> {
    try {
      const response = await fetch(ENDPOINTS.weedMonitoring.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': '1235',
        },
        body: JSON.stringify(monitoring),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating weed monitoring record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a weed monitoring record by setting its state to inactive
   * @param id Weed monitoring ID
   * @returns Promise with operation result
   */
  async softDeleteWeedMonitoring(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.weedMonitoring.changeState(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': '1235',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting weed monitoring record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single weed monitoring record by ID
   * @param id Weed monitoring ID
   * @returns Promise with weed monitoring data
   */
  async findById(id: string | number): Promise<IWeedMonitoring> {
    try {
      const response = await fetch(ENDPOINTS.weedMonitoring.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching weed monitoring record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const weedMonitoringService = new WeedMonitoringService();

export default weedMonitoringService; 