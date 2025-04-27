import { ENDPOINTS } from '@/lib/constants';
import { IIrrigationRecord } from '@/types/IIrrigationRecord';

/**
 * Service for managing irrigation record data
 */
class IrrigationRecordService {
  /**
   * Get all irrigation records
   * @returns Promise with all irrigation records
   */
  async findAll(): Promise<IIrrigationRecord[]> {
    try {
      const response = await fetch(`${ENDPOINTS.irrigationRecord.base}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching irrigation records:', error);
      throw error;
    }
  }

  /**
   * Create a new irrigation record
   * @param irrigationRecord Irrigation record data
   * @returns Promise with created irrigation record
   */
  async createIrrigationRecord(irrigationRecord: Partial<IIrrigationRecord>): Promise<IIrrigationRecord> {
    try {
      const irrigationRecordData: Partial<IIrrigationRecord> = {
        classification: irrigationRecord.classification,
        barracks: irrigationRecord.barracks,
        dateStart: irrigationRecord.dateStart,
        dateEnd: irrigationRecord.dateEnd,
        millimeters: irrigationRecord.millimeters,
        litersForHour: irrigationRecord.litersForHour,
        hours: irrigationRecord.hours,
        caudal: irrigationRecord.caudal,
        inletPressure: irrigationRecord.inletPressure,
        outletPressure: irrigationRecord.outletPressure,
        voltageMachinery: irrigationRecord.voltageMachinery,
        kilowattsForHour: irrigationRecord.kilowattsForHour,
        amperes: irrigationRecord.amperes,
        state: irrigationRecord.state !== undefined ? irrigationRecord.state : true
      };

      const response = await fetch(ENDPOINTS.irrigationRecord.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(irrigationRecordData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating irrigation record:', error);
      throw error;
    }
  }

  /**
   * Update an existing irrigation record
   * @param id Irrigation record ID
   * @param irrigationRecord Updated irrigation record data
   * @returns Promise with updated irrigation record
   */
  async updateIrrigationRecord(id: string | number, irrigationRecord: Partial<IIrrigationRecord>): Promise<IIrrigationRecord> {
    try {
      const response = await fetch(ENDPOINTS.irrigationRecord.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(irrigationRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating irrigation record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an irrigation record by setting its state to inactive
   * @param id Irrigation record ID
   * @returns Promise with operation result
   */
  async softDeleteIrrigationRecord(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.irrigationRecord.setState(id, false), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting irrigation record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single irrigation record by ID
   * @param id Irrigation record ID
   * @returns Promise with irrigation record data
   */
  async findById(id: string | number): Promise<IIrrigationRecord> {
    try {
      const response = await fetch(ENDPOINTS.irrigationRecord.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching irrigation record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const irrigationRecordService = new IrrigationRecordService();

export default irrigationRecordService; 