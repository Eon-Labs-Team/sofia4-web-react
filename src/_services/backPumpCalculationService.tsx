import { ENDPOINTS } from '@/lib/constants';
import { IBackPumpCalculation } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing back pump calculation data
 */
class BackPumpCalculationService {
  /**
   * Get all back pump calculations
   * @returns Promise with all back pump calculations
   */
  async findAll(): Promise<IBackPumpCalculation[]> {
    try {
      const response = await fetch(ENDPOINTS.backPumpCalculation.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching back pump calculations:', error);
      throw error;
    }
  }

  /**
   * Create a new back pump calculation
   * @param backPumpCalculation Back pump calculation data
   * @returns Promise with created back pump calculation
   */
  async createBackPumpCalculation(backPumpCalculation: Partial<IBackPumpCalculation>): Promise<IBackPumpCalculation> {
    try {
      const backPumpCalculationData: Partial<IBackPumpCalculation> = {
        date: backPumpCalculation.date,
        pumpNumber: backPumpCalculation.pumpNumber,
        diameterByMeters: backPumpCalculation.diameterByMeters,
        meters: backPumpCalculation.meters,
        walkMeters: backPumpCalculation.walkMeters,
        liters1: backPumpCalculation.liters1,
        liters2: backPumpCalculation.liters2,
        liters3: backPumpCalculation.liters3,
        litersByHa: backPumpCalculation.litersByHa,
        user: backPumpCalculation.user,
        state: backPumpCalculation.state !== undefined ? backPumpCalculation.state : true,
      };

      const response = await fetch(ENDPOINTS.backPumpCalculation.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(backPumpCalculationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating back pump calculation:', error);
      throw error;
    }
  }

  /**
   * Update an existing back pump calculation
   * @param id Back pump calculation ID
   * @param backPumpCalculation Updated back pump calculation data
   * @returns Promise with updated back pump calculation
   */
  async updateBackPumpCalculation(id: string | number, backPumpCalculation: Partial<IBackPumpCalculation>): Promise<IBackPumpCalculation> {
    try {
      const response = await fetch(ENDPOINTS.backPumpCalculation.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(backPumpCalculation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating back pump calculation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a back pump calculation by setting its state to inactive
   * @param id Back pump calculation ID
   * @returns Promise with operation result
   */
  async softDeleteBackPumpCalculation(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.backPumpCalculation.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting back pump calculation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single back pump calculation by ID
   * @param id Back pump calculation ID
   * @returns Promise with back pump calculation data
   */
  async findById(id: string | number): Promise<IBackPumpCalculation> {
    try {
      const response = await fetch(ENDPOINTS.backPumpCalculation.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching back pump calculation ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const backPumpCalculationService = new BackPumpCalculationService();

export default backPumpCalculationService; 