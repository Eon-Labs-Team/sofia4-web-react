import { ENDPOINTS } from '@/lib/constants';
import { ISoilFertilization } from '@/types/ISoilFertilization';

/**
 * Service for managing soil fertilization data
 */
class SoilFertilizationService {
  /**
   * Get all soil fertilizations
   * @returns Promise with all soil fertilizations
   */
  async findAll(): Promise<ISoilFertilization[]> {
    try {
      const response = await fetch(`${ENDPOINTS.soilFertilization.base}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching soil fertilizations:', error);
      throw error;
    }
  }

  /**
   * Create a new soil fertilization record
   * @param soilFertilization SoilFertilization data
   * @returns Promise with created soil fertilization
   */
  async createSoilFertilization(soilFertilization: Partial<ISoilFertilization>): Promise<ISoilFertilization> {
    try {
      const soilFertilizationData: Partial<ISoilFertilization> = {
        property: soilFertilization.property,
        dateFertilization: soilFertilization.dateFertilization,
        classification: soilFertilization.classification,
        barracks: soilFertilization.barracks,
        depth: soilFertilization.depth,
        texture: soilFertilization.texture,
        nitrogen: soilFertilization.nitrogen,
        phosphorus: soilFertilization.phosphorus,
        potassium: soilFertilization.potassium,
        calcium: soilFertilization.calcium,
        manganese: soilFertilization.manganese,
        phWater: soilFertilization.phWater,
        copper: soilFertilization.copper,
        zinc: soilFertilization.zinc,
        boron: soilFertilization.boron,
        ce: soilFertilization.ce,
        cic: soilFertilization.cic,
        mo: soilFertilization.mo,
        observation: soilFertilization.observation,
        state: soilFertilization.state !== undefined ? soilFertilization.state : true
      };

      const response = await fetch(`${ENDPOINTS.soilFertilization.base}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilFertilizationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating soil fertilization:', error);
      throw error;
    }
  }

  /**
   * Update an existing soil fertilization
   * @param id Soil Fertilization ID
   * @param soilFertilization Updated soil fertilization data
   * @returns Promise with updated soil fertilization
   */
  async updateSoilFertilization(id: string | number, soilFertilization: Partial<ISoilFertilization>): Promise<ISoilFertilization> {
    try {
      const response = await fetch(`${ENDPOINTS.soilFertilization.byId(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilFertilization),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating soil fertilization ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a soil fertilization by setting its state to inactive
   * @param id Soil Fertilization ID
   * @returns Promise with operation result
   */
  async softDeleteSoilFertilization(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.soilFertilization.changeState(id)}`, {
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
      console.error(`Error soft deleting soil fertilization ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single soil fertilization by ID
   * @param id Soil Fertilization ID
   * @returns Promise with soil fertilization data
   */
  async findById(id: string | number): Promise<ISoilFertilization> {
    try {
      const response = await fetch(`${ENDPOINTS.soilFertilization.byId(id)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching soil fertilization ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const soilFertilizationService = new SoilFertilizationService();

export default soilFertilizationService; 