import { ENDPOINTS } from '@/lib/constants';
import { IMachineryCleaning } from '@/types/IMachineryCleaning';

/**
 * Service for managing machinery cleaning data
 */
class MachineryCleaningService {
  /**
   * Get all machinery cleaning records
   * @returns Promise with all machinery cleaning records
   */
  async findAll(): Promise<IMachineryCleaning[]> {
    try {
      const response = await fetch(ENDPOINTS.machineryCleaning.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching machinery cleaning records:', error);
      throw error;
    }
  }

  /**
   * Create a new machinery cleaning record
   * @param machineryCleaning Machinery cleaning data
   * @returns Promise with created machinery cleaning record
   */
  async createMachineryCleaning(machineryCleaning: Partial<IMachineryCleaning>): Promise<IMachineryCleaning> {
    try {
      const machineryCleaningData: Partial<IMachineryCleaning> = {
        equipmentType: machineryCleaning.equipmentType,
        machinery: machineryCleaning.machinery,
        date: machineryCleaning.date,
        hour: machineryCleaning.hour,
        detergent: machineryCleaning.detergent,
        dose: machineryCleaning.dose,
        dilution: machineryCleaning.dilution,
        volume: machineryCleaning.volume,
        wastePlace: machineryCleaning.wastePlace,
        operator: machineryCleaning.operator,
        supervisor: machineryCleaning.supervisor,
        observation: machineryCleaning.observation,
        state: machineryCleaning.state !== undefined ? machineryCleaning.state : true
      };

      const response = await fetch(ENDPOINTS.machineryCleaning.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryCleaningData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery cleaning record:', error);
      throw error;
    }
  }

  /**
   * Update an existing machinery cleaning record
   * @param id Machinery cleaning ID
   * @param machineryCleaning Updated machinery cleaning data
   * @returns Promise with updated machinery cleaning record
   */
  async updateMachineryCleaning(id: string | number, machineryCleaning: Partial<IMachineryCleaning>): Promise<IMachineryCleaning> {
    try {
      const response = await fetch(ENDPOINTS.machineryCleaning.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryCleaning),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery cleaning record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a machinery cleaning record by setting its state to inactive
   * @param id Machinery cleaning ID
   * @returns Promise with operation result
   */
  async softDeleteMachineryCleaning(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.machineryCleaning.changeState(id), {
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
      console.error(`Error soft deleting machinery cleaning record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single machinery cleaning record by ID
   * @param id Machinery cleaning ID
   * @returns Promise with machinery cleaning data
   */
  async findById(id: string | number): Promise<IMachineryCleaning> {
    try {
      const response = await fetch(ENDPOINTS.machineryCleaning.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery cleaning record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const machineryCleaningService = new MachineryCleaningService();

export default machineryCleaningService; 