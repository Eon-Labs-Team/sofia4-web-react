import { ENDPOINTS } from '@/lib/constants';
import { ISoilAnalysis } from '@eon-lib/eon-mongoose';

/**
 * Service for managing soil analysis data
 */
class SoilAnalysisService {
  /**
   * Get all soil analyses
   * @returns Promise with all soil analyses
   */
  async findAll(): Promise<ISoilAnalysis[]> {
    try {
      const response = await fetch(ENDPOINTS.soilAnalysis.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching soil analyses:', error);
      throw error;
    }
  }

  /**
   * Create a new soil analysis
   * @param soilAnalysis Soil analysis data
   * @returns Promise with created soil analysis
   */
  async createSoilAnalysis(soilAnalysis: Partial<ISoilAnalysis>): Promise<ISoilAnalysis> {
    try {
      const soilAnalysisData: Partial<ISoilAnalysis> = {
        classification: soilAnalysis.classification,
        barracks: soilAnalysis.barracks,
        reportNumber: soilAnalysis.reportNumber,
        sampleNumber: soilAnalysis.sampleNumber,
        dateReception: soilAnalysis.dateReception,
        dateSampling: soilAnalysis.dateSampling,
        crop: soilAnalysis.crop,
        variety: soilAnalysis.variety,
        depth: soilAnalysis.depth,
        texture: soilAnalysis.texture,
        laboratory: soilAnalysis.laboratory,
        nitrogen: soilAnalysis.nitrogen,
        phosphorus: soilAnalysis.phosphorus,
        potassium: soilAnalysis.potassium,
        copper: soilAnalysis.copper,
        iron: soilAnalysis.iron,
        manganese: soilAnalysis.manganese,
        zinc: soilAnalysis.zinc,
        boron: soilAnalysis.boron,
        sulfur: soilAnalysis.sulfur,
        magnesium: soilAnalysis.magnesium,
        calcium: soilAnalysis.calcium,
        cerium: soilAnalysis.cerium,
        ph: soilAnalysis.ph,
        cic: soilAnalysis.cic,
        state: soilAnalysis.state !== undefined ? soilAnalysis.state : true
      };

      const response = await fetch(ENDPOINTS.soilAnalysis.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilAnalysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating soil analysis:', error);
      throw error;
    }
  }

  /**
   * Update an existing soil analysis
   * @param id Soil analysis ID
   * @param soilAnalysis Updated soil analysis data
   * @returns Promise with updated soil analysis
   */
  async updateSoilAnalysis(id: string | number, soilAnalysis: Partial<ISoilAnalysis>): Promise<ISoilAnalysis> {
    try {
      const response = await fetch(ENDPOINTS.soilAnalysis.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilAnalysis),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating soil analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a soil analysis by setting its state to inactive
   * @param id Soil analysis ID
   * @returns Promise with operation result
   */
  async softDeleteSoilAnalysis(id: string | number): Promise<any> {
    try {
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.soilAnalysis.byId(id), {
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
      console.error(`Error soft deleting soil analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single soil analysis by ID
   * @param id Soil analysis ID
   * @returns Promise with soil analysis data
   */
  async findById(id: string | number): Promise<ISoilAnalysis> {
    try {
      const response = await fetch(ENDPOINTS.soilAnalysis.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching soil analysis ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const soilAnalysisService = new SoilAnalysisService();

export default soilAnalysisService; 