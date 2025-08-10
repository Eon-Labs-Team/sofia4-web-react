import { ENDPOINTS } from '@/lib/constants';
import { IIrrigationSectorCapacity } from '@eon-lib/eon-mongoose';

/**
 * Service for managing irrigation sector capacity data
 */
class IrrigationSectorCapacityService {
  /**
   * Get all irrigation sector capacities
   * @returns Promise with all irrigation sector capacities
   */
  async findAll(): Promise<IIrrigationSectorCapacity[]> {
    try {
      const response = await fetch(ENDPOINTS.irrigationSectorCapacity.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching irrigation sector capacities:', error);
      throw error;
    }
  }

  /**
   * Create a new irrigation sector capacity
   * @param irrigationSectorCapacity IrrigationSectorCapacity data
   * @returns Promise with created irrigation sector capacity
   */
  async createIrrigationSectorCapacity(irrigationSectorCapacity: Partial<IIrrigationSectorCapacity>): Promise<IIrrigationSectorCapacity> {
    try {
      const irrigationSectorCapacityData: Partial<IIrrigationSectorCapacity> = {
        date: irrigationSectorCapacity.date,
        variety: irrigationSectorCapacity.variety,
        sector: irrigationSectorCapacity.sector,
        centerCost: irrigationSectorCapacity.centerCost,
        ltsByMin: irrigationSectorCapacity.ltsByMin,
        pressure: irrigationSectorCapacity.pressure,
        pressureUnit: irrigationSectorCapacity.pressureUnit,
        inCharge: irrigationSectorCapacity.inCharge,
        createDate: irrigationSectorCapacity.createDate,
        state: irrigationSectorCapacity.state !== undefined ? irrigationSectorCapacity.state : true,
      };

      const response = await fetch(ENDPOINTS.irrigationSectorCapacity.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(irrigationSectorCapacityData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating irrigation sector capacity:', error);
      throw error;
    }
  }

  /**
   * Update an existing irrigation sector capacity
   * @param id IrrigationSectorCapacity ID
   * @param irrigationSectorCapacity Updated irrigation sector capacity data
   * @returns Promise with updated irrigation sector capacity
   */
  async updateIrrigationSectorCapacity(id: string | number, irrigationSectorCapacity: Partial<IIrrigationSectorCapacity>): Promise<IIrrigationSectorCapacity> {
    try {
      const response = await fetch(ENDPOINTS.irrigationSectorCapacity.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(irrigationSectorCapacity),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating irrigation sector capacity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an irrigation sector capacity by setting its state to inactive
   * @param id IrrigationSectorCapacity ID
   * @returns Promise with operation result
   */
  async softDeleteIrrigationSectorCapacity(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.irrigationSectorCapacity.changeState(id), {
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
      console.error(`Error soft deleting irrigation sector capacity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single irrigation sector capacity by ID
   * @param id IrrigationSectorCapacity ID
   * @returns Promise with irrigation sector capacity data
   */
  async findById(id: string | number): Promise<IIrrigationSectorCapacity> {
    try {
      const response = await fetch(ENDPOINTS.irrigationSectorCapacity.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching irrigation sector capacity ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const irrigationSectorCapacityService = new IrrigationSectorCapacityService();

export default irrigationSectorCapacityService; 