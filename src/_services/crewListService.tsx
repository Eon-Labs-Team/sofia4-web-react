import { ENDPOINTS } from '@/lib/constants';
import { ICrewList } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing crew list data
 */
class CrewListService {
  /**
   * Get all crew lists for a specific property
   * @param propertyId The ID of the property to get crew lists for
   * @returns Promise with crew lists for the property
   */
  async findAll(propertyId?: string | number | null): Promise<ICrewList[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.crewList.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.crewList.base}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching crew lists:', error);
      throw error;
    }
  }

  /**
   * Create a new crew list
   * @param crewList CrewList data
   * @param propertyId The ID of the property this crew list belongs to
   * @returns Promise with created crew list
   */
  async createCrew(crewList: Partial<ICrewList>, propertyId?: string | number | null): Promise<ICrewList> {
    try {
      const crewListData: Partial<ICrewList> = {
        ...crewList,
        // @ts-ignore
        propertyId, // Add propertyId to the crew list data
        state: crewList.state !== undefined ? crewList.state : true
      };

      const response = await fetch(ENDPOINTS.crewList.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(crewListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating crew list:', error);
      throw error;
    }
  }

  /**
   * Update an existing crew list
   * @param id CrewList ID
   * @param crewList Updated crew list data
   * @returns Promise with updated crew list
   */
  async updateCrew(id: string | number, crewList: Partial<ICrewList>): Promise<ICrewList> {
    try {
      const response = await fetch(ENDPOINTS.crewList.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(crewList),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating crew list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a crew list by setting its state to inactive
   * @param id CrewList ID
   * @returns Promise with operation result
   */
  async softDeleteCrew(id: string | number): Promise<any> {
    try {
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.crewList.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ state: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting crew list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single crew list by ID
   * @param id CrewList ID
   * @returns Promise with crew list data
   */
  async findById(id: string | number): Promise<ICrewList> {
    try {
      const response = await fetch(ENDPOINTS.crewList.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching crew list ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const crewListService = new CrewListService();

export default crewListService; 