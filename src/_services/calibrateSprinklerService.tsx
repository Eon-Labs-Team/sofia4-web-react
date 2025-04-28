import { ENDPOINTS } from '@/lib/constants';
import { ICalibrateSprinkler } from '@/types/ICalibrateSprinkler';

/**
 * Service for managing calibrate sprinkler data
 */
class CalibrateSprinklerService {
  /**
   * Get all calibrate sprinkler records
   * @returns Promise with all calibrate sprinkler records
   */
  async findAll(): Promise<ICalibrateSprinkler[] | { data: ICalibrateSprinkler[] }> {
    try {
      const response = await fetch(ENDPOINTS.calibrateSprinkler.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibrate sprinkler records:', error);
      throw error;
    }
  }

  /**
   * Create a new calibrate sprinkler record
   * @param calibrateSprinkler Calibrate sprinkler data
   * @returns Promise with created calibrate sprinkler record
   */
  async createCalibrateSprinkler(calibrateSprinkler: Partial<ICalibrateSprinkler>): Promise<ICalibrateSprinkler> {
    try {
      const calibrateSprinklerData: Partial<ICalibrateSprinkler> = {
        barracks: calibrateSprinkler.barracks,
        date: calibrateSprinkler.date,
        equipment: calibrateSprinkler.equipment,
        dischargeShot1: calibrateSprinkler.dischargeShot1,
        dischargeShot2: calibrateSprinkler.dischargeShot2,
        dischargeShot3: calibrateSprinkler.dischargeShot3,
        averageDischarge: calibrateSprinkler.averageDischarge,
        nozzleReference: calibrateSprinkler.nozzleReference,
        dischargeData: calibrateSprinkler.dischargeData,
        dischargeRange: calibrateSprinkler.dischargeRange,
        nozzleState: calibrateSprinkler.nozzleState,
        operator: calibrateSprinkler.operator,
        observation: calibrateSprinkler.observation,
        state: calibrateSprinkler.state !== undefined ? calibrateSprinkler.state : true,
      };

      const response = await fetch(ENDPOINTS.calibrateSprinkler.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrateSprinklerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating calibrate sprinkler record:', error);
      throw error;
    }
  }

  /**
   * Update an existing calibrate sprinkler record
   * @param id Calibrate sprinkler ID
   * @param calibrateSprinkler Updated calibrate sprinkler data
   * @returns Promise with updated calibrate sprinkler record
   */
  async updateCalibrateSprinkler(id: string | number, calibrateSprinkler: Partial<ICalibrateSprinkler>): Promise<ICalibrateSprinkler> {
    try {
      const response = await fetch(ENDPOINTS.calibrateSprinkler.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrateSprinkler),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating calibrate sprinkler ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a calibrate sprinkler record by setting its state to inactive
   * @param id Calibrate sprinkler ID
   * @returns Promise with operation result
   */
  async softDeleteCalibrateSprinkler(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.calibrateSprinkler.changeState(id), {
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
      console.error(`Error soft deleting calibrate sprinkler ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single calibrate sprinkler record by ID
   * @param id Calibrate sprinkler ID
   * @returns Promise with calibrate sprinkler data
   */
  async findById(id: string | number): Promise<ICalibrateSprinkler> {
    try {
      const response = await fetch(ENDPOINTS.calibrateSprinkler.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching calibrate sprinkler ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const calibrateSprinklerService = new CalibrateSprinklerService();

export default calibrateSprinklerService; 