import { ENDPOINTS } from '@/lib/constants';
import { IAnimalAdmission } from '@eon-lib/eon-mongoose';

/**
 * Service for managing animal admission data
 */
class AnimalAdmissionService {
  /**
   * Get all animal admissions
   * @returns Promise with all animal admissions
   */
  async findAll(): Promise<IAnimalAdmission[]> {

    console.log("findall")
    try {
      const response = await fetch(`${ENDPOINTS.animalAdmission.base}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching animal admissions:', error);
      throw error;
    }
  }

  /**
   * Create a new animal admission
   * @param animalAdmission Animal admission data
   * @returns Promise with created animal admission
   */
  async createAnimalAdmission(animalAdmission: Partial<IAnimalAdmission>): Promise<IAnimalAdmission> {
    try {
      const animalAdmissionData: Partial<IAnimalAdmission> = {
        date: animalAdmission.date,
        quarterLot: animalAdmission.quarterLot,
        code: animalAdmission.code,
        area: animalAdmission.area,
        reviser: animalAdmission.reviser,
        supervisor: animalAdmission.supervisor,
        observation: animalAdmission.observation,
        supervisorSing: animalAdmission.supervisorSing,
        image1: animalAdmission.image1,
        image2: animalAdmission.image2,
        image3: animalAdmission.image3,
        state: animalAdmission.state !== undefined ? animalAdmission.state : true
      };

      const response = await fetch(`${ENDPOINTS.animalAdmission.base}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalAdmissionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating animal admission:', error);
      throw error;
    }
  }

  /**
   * Update an existing animal admission
   * @param id Animal admission ID
   * @param animalAdmission Updated animal admission data
   * @returns Promise with updated animal admission
   */
  async updateAnimalAdmission(id: string | number, animalAdmission: Partial<IAnimalAdmission>): Promise<IAnimalAdmission> {
    try {
      const response = await fetch(`${ENDPOINTS.animalAdmission.byId(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalAdmission),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating animal admission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an animal admission by setting its state to inactive
   * @param id Animal admission ID
   * @returns Promise with operation result
   */
  async softDeleteAnimalAdmission(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.animalAdmission.changeState(id)}`, {
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
      console.error(`Error soft deleting animal admission ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const animalAdmissionService = new AnimalAdmissionService();

export default animalAdmissionService; 