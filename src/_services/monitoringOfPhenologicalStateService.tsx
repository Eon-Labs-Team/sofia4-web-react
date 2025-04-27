import { ENDPOINTS } from '@/lib/constants';
import { IMonitoringOfPhenologicalState } from '@/types/IMonitoringOfPhenologicalState';

interface ApiResponse<T> {
  data: T[];
  status?: number;
  message?: string;
}

/**
 * Service for managing monitoring of phenological state data
 */
class MonitoringOfPhenologicalStateService {
  /**
   * Get all monitoring records
   * @returns Promise with all monitoring records or an ApiResponse containing the records
   */
  async findAll(): Promise<IMonitoringOfPhenologicalState[] | ApiResponse<IMonitoringOfPhenologicalState>> {
    try {
      const response = await fetch(ENDPOINTS.monitoringOfPhenologicalState.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
      throw error;
    }
  }

  /**
   * Create a new monitoring record
   * @param monitoring Monitoring data
   * @returns Promise with created monitoring record
   */
  async createMonitoring(monitoring: Partial<IMonitoringOfPhenologicalState>): Promise<IMonitoringOfPhenologicalState> {
    try {
      const monitoringData: Partial<IMonitoringOfPhenologicalState> = {
        date: monitoring.date,
        crop: monitoring.crop,
        barracks: monitoring.barracks,
        phenologicalState: monitoring.phenologicalState,
        observation: monitoring.observation,
        exist: monitoring.exist !== undefined ? monitoring.exist : false,
        image1: monitoring.image1,
        image2: monitoring.image2,
        image3: monitoring.image3,
        state: monitoring.state !== undefined ? monitoring.state : true,
        enterpriseId: monitoring.enterpriseId
      };

      const response = await fetch(ENDPOINTS.monitoringOfPhenologicalState.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitoringData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating monitoring record:', error);
      throw error;
    }
  }

  /**
   * Update an existing monitoring record
   * @param id Monitoring ID
   * @param monitoring Updated monitoring data
   * @returns Promise with updated monitoring record
   */
  async updateMonitoring(id: string | number, monitoring: Partial<IMonitoringOfPhenologicalState>): Promise<IMonitoringOfPhenologicalState> {
    try {
      const response = await fetch(ENDPOINTS.monitoringOfPhenologicalState.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitoring),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating monitoring record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a monitoring record by setting its state to inactive
   * @param id Monitoring ID
   * @returns Promise with operation result
   */
  async softDeleteMonitoring(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.monitoringOfPhenologicalState.changeState(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting monitoring record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single monitoring record by ID
   * @param id Monitoring ID
   * @returns Promise with monitoring data
   */
  async findById(id: string | number): Promise<IMonitoringOfPhenologicalState> {
    try {
      const response = await fetch(ENDPOINTS.monitoringOfPhenologicalState.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching monitoring record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const monitoringOfPhenologicalStateService = new MonitoringOfPhenologicalStateService();

export default monitoringOfPhenologicalStateService; 