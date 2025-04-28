import { ENDPOINTS } from '@/lib/constants';
import { ITechnicalIrrigationMaintenance } from '@/types/ITechnicalIrrigationMaintenance';

/**
 * Service for managing technical irrigation maintenance data
 */
class TechnicalIrrigationMaintenanceService {
  /**
   * Get all technical irrigation maintenances
   * @returns Promise with all technical irrigation maintenances
   */
  async findAll(): Promise<ITechnicalIrrigationMaintenance[]> {
    try {
      const response = await fetch(ENDPOINTS.technicalIrrigationMaintenance.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching technical irrigation maintenances:', error);
      throw error;
    }
  }

  /**
   * Create a new technical irrigation maintenance
   * @param maintenance Technical irrigation maintenance data
   * @returns Promise with created technical irrigation maintenance
   */
  async createTechnicalIrrigationMaintenance(maintenance: Partial<ITechnicalIrrigationMaintenance>): Promise<ITechnicalIrrigationMaintenance> {
    try {
      const maintenanceData: Partial<ITechnicalIrrigationMaintenance> = {
        barracks: maintenance.barracks,
        supervisor: maintenance.supervisor,
        date: maintenance.date,
        hallNumber: maintenance.hallNumber,
        centerCost: maintenance.centerCost,
        workType: maintenance.workType,
        workDone: maintenance.workDone,
        responsible: maintenance.responsible,
        state: maintenance.state !== undefined ? maintenance.state : true,
      };

      const response = await fetch(ENDPOINTS.technicalIrrigationMaintenance.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating technical irrigation maintenance:', error);
      throw error;
    }
  }

  /**
   * Update an existing technical irrigation maintenance
   * @param id Technical irrigation maintenance ID
   * @param maintenance Updated technical irrigation maintenance data
   * @returns Promise with updated technical irrigation maintenance
   */
  async updateTechnicalIrrigationMaintenance(id: string | number, maintenance: Partial<ITechnicalIrrigationMaintenance>): Promise<ITechnicalIrrigationMaintenance> {
    try {
      const response = await fetch(ENDPOINTS.technicalIrrigationMaintenance.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenance),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating technical irrigation maintenance ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a technical irrigation maintenance by setting its state to inactive
   * @param id Technical irrigation maintenance ID
   * @returns Promise with operation result
   */
  async softDeleteTechnicalIrrigationMaintenance(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.technicalIrrigationMaintenance.changeState(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting technical irrigation maintenance ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single technical irrigation maintenance by ID
   * @param id Technical irrigation maintenance ID
   * @returns Promise with technical irrigation maintenance data
   */
  async findById(id: string | number): Promise<ITechnicalIrrigationMaintenance> {
    try {
      const response = await fetch(ENDPOINTS.technicalIrrigationMaintenance.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching technical irrigation maintenance ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const technicalIrrigationMaintenanceService = new TechnicalIrrigationMaintenanceService();

export default technicalIrrigationMaintenanceService; 