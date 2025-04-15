import { ENDPOINTS } from '@/lib/constants';
import { Cuartel } from '@/types/cuartel';

/**
 * Service for managing cuartel (barracks) data
 */
class CuartelService {
  /**
   * Get all cuarteles
   * @returns Promise with all cuarteles
   */
  async findAll(): Promise<Cuartel[]> {
    try {
      const response = await fetch(ENDPOINTS.cuarteles.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cuarteles:', error);
      throw error;
    }
  }

  /**
   * Create a new cuartel
   * @param cuartel Cuartel data
   * @returns Promise with created cuartel
   */
  async createCuartel(cuartel: Partial<Cuartel>): Promise<Cuartel> {
    try {
      const cuartelData: Partial<Cuartel> = {
        barracks: cuartel.barracks,
        species: cuartel.species,
        variety: cuartel.variety,
        phenologicalState: cuartel.phenologicalState,
        state: cuartel.state !== undefined ? cuartel.state : false,
      };

      const response = await fetch(ENDPOINTS.cuarteles.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuartelData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating cuartel:', error);
      throw error;
    }
  }

  /**
   * Update an existing cuartel
   * @param id Cuartel ID
   * @param cuartel Updated cuartel data
   * @returns Promise with updated cuartel
   */
  async updateCuartel(id: string | number, cuartel: Partial<Cuartel>): Promise<Cuartel> {
    try {
      const response = await fetch(ENDPOINTS.cuarteles.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuartel),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating cuartel ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a cuartel by setting its state to inactive
   * @param id Cuartel ID
   * @returns Promise with operation result
   */
  async softDeleteCuartel(id: string | number): Promise<any> {
    try {
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.cuarteles.byId(id), {
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
      console.error(`Error soft deleting cuartel ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single cuartel by ID
   * @param id Cuartel ID
   * @returns Promise with cuartel data
   */
  async findById(id: string | number): Promise<Cuartel> {
    try {
      const response = await fetch(ENDPOINTS.cuarteles.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching cuartel ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const cuartelService = new CuartelService();

export default cuartelService; 