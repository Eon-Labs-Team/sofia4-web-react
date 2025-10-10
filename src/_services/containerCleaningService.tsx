import { ENDPOINTS } from '@/lib/constants';
import { IContainerCleaning } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing container cleaning data
 */
class ContainerCleaningService {
  /**
   * Get all container cleaning records
   * @returns Promise with all container cleaning records
   */
  async findAll(): Promise<IContainerCleaning[] | { data: IContainerCleaning[] }> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.containerCleaning.base), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching container cleaning records:', error);
      throw error;
    }
  }

  /**
   * Create a new container cleaning record
   * @param containerCleaning Container cleaning data
   * @returns Promise with created container cleaning record
   */
  async createContainerCleaning(containerCleaning: Partial<IContainerCleaning>): Promise<IContainerCleaning> {
    try {
      const containerCleaningData: Partial<IContainerCleaning> = {
        date: containerCleaning.date,
        location: containerCleaning.location,
        supervisor: containerCleaning.supervisor,
        container: containerCleaning.container,
        containerNumber: containerCleaning.containerNumber,
        washed: containerCleaning.washed,
        rinsed: containerCleaning.rinsed,
        hung: containerCleaning.hung,
        harvestedVariety: containerCleaning.harvestedVariety,
        crew: containerCleaning.crew,
        responsiblePerson: containerCleaning.responsiblePerson,
        photo1: containerCleaning.photo1,
        photo2: containerCleaning.photo2,
        photo3: containerCleaning.photo3,
        state: containerCleaning.state !== undefined ? containerCleaning.state : true,
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.containerCleaning.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(containerCleaningData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating container cleaning record:', error);
      throw error;
    }
  }

  /**
   * Update an existing container cleaning record
   * @param id Container cleaning ID
   * @param containerCleaning Updated container cleaning data
   * @returns Promise with updated container cleaning record
   */
  async updateContainerCleaning(id: string | number, containerCleaning: Partial<IContainerCleaning>): Promise<IContainerCleaning> {
    try {
      const response = await fetch(ENDPOINTS.containerCleaning.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(containerCleaning),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating container cleaning ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a container cleaning record by setting its state to inactive
   * @param id Container cleaning ID
   * @returns Promise with operation result
   */
  async softDeleteContainerCleaning(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.containerCleaning.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting container cleaning ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single container cleaning record by ID
   * @param id Container cleaning ID
   * @returns Promise with container cleaning data
   */
  async findById(id: string | number): Promise<IContainerCleaning> {
    try {
      const response = await fetch(ENDPOINTS.containerCleaning.byId(id), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching container cleaning ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const containerCleaningService = new ContainerCleaningService();

export default containerCleaningService;
