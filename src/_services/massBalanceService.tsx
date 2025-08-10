import { ENDPOINTS } from '@/lib/constants';
import { IMassBalance } from '@eon-lib/eon-mongoose';

/**
 * Service for managing mass balance data
 */
class MassBalanceService {
  /**
   * Get all mass balance records
   * @returns Promise with all mass balance records
   */
  async findAll(): Promise<IMassBalance[]> {
    try {
      const response = await fetch(ENDPOINTS.massBalance.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching mass balance records:', error);
      throw error;
    }
  }

  /**
   * Create a new mass balance record
   * @param massBalance Mass balance data
   * @returns Promise with created mass balance record
   */
  async createMassBalance(massBalance: Partial<IMassBalance>): Promise<IMassBalance> {
    try {
      const massBalanceData: Partial<IMassBalance> = {
        period: massBalance.period,
        harvestFormat: massBalance.harvestFormat,
        packagingFormat: massBalance.packagingFormat,
        plants: massBalance.plants,
        hectares: massBalance.hectares,
        state: massBalance.state !== undefined ? massBalance.state : true
      };

      const response = await fetch(ENDPOINTS.massBalance.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(massBalanceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating mass balance record:', error);
      throw error;
    }
  }

  /**
   * Update an existing mass balance record
   * @param id Mass balance ID
   * @param massBalance Updated mass balance data
   * @returns Promise with updated mass balance record
   */
  async updateMassBalance(id: string | number, massBalance: Partial<IMassBalance>): Promise<IMassBalance> {
    try {
      const response = await fetch(ENDPOINTS.massBalance.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(massBalance),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating mass balance record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a mass balance record by setting its state to inactive
   * @param id Mass balance ID
   * @returns Promise with operation result
   */
  async softDeleteMassBalance(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.massBalance.changeState(id), {
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
      console.error(`Error soft deleting mass balance record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single mass balance record by ID
   * @param id Mass balance ID
   * @returns Promise with mass balance data
   */
  async findById(id: string | number): Promise<IMassBalance> {
    try {
      const response = await fetch(ENDPOINTS.massBalance.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching mass balance record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const massBalanceService = new MassBalanceService();

export default massBalanceService; 