import { ENDPOINTS } from '@/lib/constants';
import { IMeasurementUnits } from '@/types/IMeasurementUnits';

/**
 * Service for managing measurement units data
 */
class MeasurementUnitsService {
  /**
   * Get all measurement units
   * @returns Promise with all measurement units
   */
  async findAll(): Promise<IMeasurementUnits[]> {
    try {
      const response = await fetch(ENDPOINTS.measurementUnits.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching measurement units:', error);
      throw error;
    }
  }

  /**
   * Create a new measurement unit
   * @param measurementUnit MeasurementUnit data
   * @returns Promise with created measurement unit
   */
  async createMeasurementUnit(measurementUnit: Partial<IMeasurementUnits>): Promise<IMeasurementUnits> {
    try {
      const measurementUnitData: Partial<IMeasurementUnits> = {
        type: measurementUnit.type,
        optionalCode: measurementUnit.optionalCode || ' ',
        state: measurementUnit.state !== undefined ? measurementUnit.state : true,
      };

      const response = await fetch(ENDPOINTS.measurementUnits.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurementUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating measurement unit:', error);
      throw error;
    }
  }

  /**
   * Update an existing measurement unit
   * @param id MeasurementUnit ID
   * @param measurementUnit Updated measurement unit data
   * @returns Promise with updated measurement unit
   */
  async updateMeasurementUnit(id: string | number, measurementUnit: Partial<IMeasurementUnits>): Promise<IMeasurementUnits> {
    try {
      const response = await fetch(ENDPOINTS.measurementUnits.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurementUnit),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating measurement unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a measurement unit by setting its state to inactive
   * @param id MeasurementUnit ID
   * @returns Promise with operation result
   */
  async softDeleteMeasurementUnit(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.measurementUnits.setState(id, false), {
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
      console.error(`Error soft deleting measurement unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single measurement unit by ID
   * @param id MeasurementUnit ID
   * @returns Promise with measurement unit data
   */
  async findById(id: string | number): Promise<IMeasurementUnits> {
    try {
      const response = await fetch(ENDPOINTS.measurementUnits.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching measurement unit ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const measurementUnitsService = new MeasurementUnitsService();

export default measurementUnitsService; 