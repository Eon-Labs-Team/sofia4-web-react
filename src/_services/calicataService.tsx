import { ENDPOINTS } from '@/lib/constants';
import { ICalicata } from '@eon-lib/eon-mongoose';

/**
 * Service for managing calicata (soil pit) data
 */
class CalicataService {
  /**
   * Get all calicatas
   * @returns Promise with all calicatas
   */
  async findAll(): Promise<ICalicata[]> {
    try {
      const response = await fetch(ENDPOINTS.calicata.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calicatas:', error);
      throw error;
    }
  }

  /**
   * Create a new calicata
   * @param calicata Calicata data
   * @returns Promise with created calicata
   */
  async createCalicata(calicata: Partial<ICalicata>): Promise<ICalicata> {
    try {
      const calicataData: Partial<ICalicata> = {
        date: calicata.date,
        fieldOrPlot: calicata.fieldOrPlot,
        depth: calicata.depth,
        observations: calicata.observations,
        responsible: calicata.responsible,
        image1: calicata.image1,
        image2: calicata.image2,
        image3: calicata.image3,
        signature: calicata.signature,
        state: calicata.state !== undefined ? calicata.state : true,
      };

      const response = await fetch(ENDPOINTS.calicata.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calicataData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating calicata:', error);
      throw error;
    }
  }

  /**
   * Update an existing calicata
   * @param id Calicata ID
   * @param calicata Updated calicata data
   * @returns Promise with updated calicata
   */
  async updateCalicata(id: string | number, calicata: Partial<ICalicata>): Promise<ICalicata> {
    try {
      const response = await fetch(ENDPOINTS.calicata.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calicata),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating calicata ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a calicata by setting its state to inactive
   * @param id Calicata ID
   * @returns Promise with operation result
   */
  async softDeleteCalicata(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.calicata.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting calicata ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single calicata by ID
   * @param id Calicata ID
   * @returns Promise with calicata data
   */
  async findById(id: string | number): Promise<ICalicata> {
    try {
      const response = await fetch(ENDPOINTS.calicata.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching calicata ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const calicataService = new CalicataService();

export default calicataService; 