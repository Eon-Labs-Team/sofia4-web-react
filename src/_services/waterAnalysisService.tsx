import { ENDPOINTS } from '@/lib/constants';
import { IWaterAnalysis } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing water analysis data
 */
class WaterAnalysisService {
  /**
   * Get all water analysis records
   * @returns Promise with all water analysis records
   */
  async findAll(): Promise<IWaterAnalysis[]> {
    try {
      const response = await fetch(ENDPOINTS.waterAnalysis.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching water analysis records:', error);
      throw error;
    }
  }

  /**
   * Create a new water analysis record
   * @param waterAnalysis Water analysis data
   * @returns Promise with created water analysis record
   */
  async createWaterAnalysis(waterAnalysis: Partial<IWaterAnalysis>): Promise<IWaterAnalysis> {
    try {
      const waterAnalysisData: Partial<IWaterAnalysis> = {
        date: waterAnalysis.date,
        requestedBy: waterAnalysis.requestedBy,
        samplingCode: waterAnalysis.samplingCode,
        samplingSite: waterAnalysis.samplingSite,
        samplingHour: waterAnalysis.samplingHour,
        waterType: waterAnalysis.waterType,
        weatherType: waterAnalysis.weatherType,
        sampleBy: waterAnalysis.sampleBy,
        totalColiforms: waterAnalysis.totalColiforms,
        escherichiaColi: waterAnalysis.escherichiaColi,
        temperature: waterAnalysis.temperature,
        chlorine: waterAnalysis.chlorine,
        turbidity: waterAnalysis.turbidity,
        nitrites: waterAnalysis.nitrites,
        chlorides: waterAnalysis.chlorides,
        waterHardness: waterAnalysis.waterHardness,
        conductivity: waterAnalysis.conductivity,
        ph: waterAnalysis.ph,
        residual: waterAnalysis.residual,
        iron: waterAnalysis.iron,
        aluminum: waterAnalysis.aluminum,
        sulphates: waterAnalysis.sulphates,
        state: waterAnalysis.state !== undefined ? waterAnalysis.state : true
      };

      const response = await fetch(ENDPOINTS.waterAnalysis.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(waterAnalysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating water analysis record:', error);
      throw error;
    }
  }

  /**
   * Update an existing water analysis record
   * @param id Water analysis ID
   * @param waterAnalysis Updated water analysis data
   * @returns Promise with updated water analysis record
   */
  async updateWaterAnalysis(id: string | number, waterAnalysis: Partial<IWaterAnalysis>): Promise<IWaterAnalysis> {
    try {
      const response = await fetch(ENDPOINTS.waterAnalysis.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(waterAnalysis),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating water analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a water analysis record by setting its state to inactive
   * @param id Water analysis ID
   * @returns Promise with operation result
   */
  async softDeleteWaterAnalysis(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.waterAnalysis.changeState(id), {
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
      console.error(`Error soft deleting water analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single water analysis record by ID
   * @param id Water analysis ID
   * @returns Promise with water analysis data
   */
  async findById(id: string | number): Promise<IWaterAnalysis> {
    try {
      const response = await fetch(ENDPOINTS.waterAnalysis.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching water analysis ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const waterAnalysisService = new WaterAnalysisService();

export default waterAnalysisService; 