import { ENDPOINTS } from '@/lib/constants';
import { ILeafAnalysisRecord } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing leaf analysis data
 */
class LeafAnalysisService {
  /**
   * Get all leaf analysis records
   * @returns Promise with all leaf analysis records
   */
  async findAll(): Promise<ILeafAnalysisRecord[]> {
    try {
      const response = await fetch(ENDPOINTS.leafAnalysis.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaf analysis records:', error);
      throw error;
    }
  }

  /**
   * Create a new leaf analysis record
   * @param leafAnalysis Leaf analysis data
   * @returns Promise with created leaf analysis
   */
  async createLeafAnalysis(leafAnalysis: Partial<ILeafAnalysisRecord>): Promise<ILeafAnalysisRecord> {
    try {
      const leafAnalysisData: Partial<ILeafAnalysisRecord> = {
        filterByClassification: leafAnalysis.filterByClassification,
        barracks: leafAnalysis.barracks,
        samplingDate: leafAnalysis.samplingDate,
        specie: leafAnalysis.specie,
        plantingYear: leafAnalysis.plantingYear,
        laboratory: leafAnalysis.laboratory,
        totalNumber: leafAnalysis.totalNumber,
        nitrogen: leafAnalysis.nitrogen,
        phosphorus: leafAnalysis.phosphorus,
        potassium: leafAnalysis.potassium,
        calcium: leafAnalysis.calcium,
        magnesium: leafAnalysis.magnesium,
        cooper: leafAnalysis.cooper,
        zinc: leafAnalysis.zinc,
        manganese: leafAnalysis.manganese,
        iron: leafAnalysis.iron,
        boro: leafAnalysis.boro,
        state: leafAnalysis.state !== undefined ? leafAnalysis.state : true
      };

      const response = await fetch(ENDPOINTS.leafAnalysis.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(leafAnalysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating leaf analysis:', error);
      throw error;
    }
  }

  /**
   * Update an existing leaf analysis
   * @param id Leaf analysis ID
   * @param leafAnalysis Updated leaf analysis data
   * @returns Promise with updated leaf analysis
   */
  async updateLeafAnalysis(id: string | number, leafAnalysis: Partial<ILeafAnalysisRecord>): Promise<ILeafAnalysisRecord> {
    try {
      const response = await fetch(ENDPOINTS.leafAnalysis.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(leafAnalysis),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating leaf analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a leaf analysis by setting its state to false
   * @param id Leaf analysis ID
   * @returns Promise with operation result
   */
  async softDeleteLeafAnalysis(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.leafAnalysis.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting leaf analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single leaf analysis by ID
   * @param id Leaf analysis ID
   * @returns Promise with leaf analysis data
   */
  async findById(id: string | number): Promise<ILeafAnalysisRecord> {
    try {
      const response = await fetch(ENDPOINTS.leafAnalysis.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching leaf analysis ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const leafAnalysisService = new LeafAnalysisService();

export default leafAnalysisService; 