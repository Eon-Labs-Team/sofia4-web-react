import { ENDPOINTS } from '@/lib/constants';
import authService from './authService';
import { IGenericTreatment } from '@eon-lib/eon-mongoose';

/**
 * Service for managing generic treatments
 */
class GenericTreatmentService {
  /**
   * Get all generic treatments by enterprise ID
   * @returns Promise with all generic treatments
   */
  async findByEnterpriseId(): Promise<IGenericTreatment[]> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.genericTreatment.base), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching generic treatments:', error);
      throw error;
    }
  }

  /**
   * Get all generic treatments (admin/global, not filtered by enterprise)
   * @returns Promise with all generic treatments
   */
  async findAll(): Promise<IGenericTreatment[]> {
    try {
      const response = await fetch(ENDPOINTS.genericTreatment.base, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const genericTreatmentData = await response.json();
      return genericTreatmentData.data || genericTreatmentData;
    } catch (error) {
      console.error('Error fetching all generic treatments:', error);
      throw error;
    }
  }

  /**
   * Create a new generic treatment
   * @param genericTreatment Generic treatment data
   * @returns Promise with created generic treatment
   */
  async create(genericTreatment: Partial<IGenericTreatment>): Promise<IGenericTreatment> {
    try {
      const genericTreatmentData: Partial<IGenericTreatment> = {
        ...genericTreatment,
        state: genericTreatment.state !== undefined ? genericTreatment.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.genericTreatment.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(genericTreatmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating generic treatment:', error);
      throw error;
    }
  }

  /**
   * Update an existing generic treatment
   * @param id Generic treatment ID
   * @param genericTreatment Updated generic treatment data
   * @returns Promise with updated generic treatment
   */
  async update(id: string | number, genericTreatment: Partial<IGenericTreatment>): Promise<IGenericTreatment> {
    try {
      const genericTreatmentData = {
        ...genericTreatment,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.genericTreatment.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(genericTreatmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating generic treatment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a generic treatment
   * @param id Generic treatment ID
   * @returns Promise with operation result
   */
  async softDelete(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.genericTreatment.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting generic treatment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single generic treatment by ID
   * @param id Generic treatment ID
   * @returns Promise with generic treatment data
   */
  async findById(id: string | number): Promise<IGenericTreatment> {
    try {
      const response = await fetch(ENDPOINTS.genericTreatment.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching generic treatment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a generic treatment
   * @param id Generic treatment ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.genericTreatment.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for generic treatment ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const genericTreatmentService = new GenericTreatmentService();

export default genericTreatmentService;