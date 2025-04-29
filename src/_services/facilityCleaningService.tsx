import { ENDPOINTS } from '@/lib/constants';
import { IFacilityCleaningRecord } from '@/types/IFacilityCleaningRecord';

/**
 * Service for managing facility cleaning records
 */
class FacilityCleaningService {
  /**
   * Get all facility cleaning records
   * @returns Promise with all facility cleaning records
   */
  async findAll(): Promise<IFacilityCleaningRecord[]> {
    try {
      const response = await fetch(ENDPOINTS.facilityCleaning.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching facility cleaning records:', error);
      throw error;
    }
  }

  /**
   * Create a new facility cleaning record
   * @param facilityCleaningRecord FacilityCleaningRecord data
   * @returns Promise with created facility cleaning record
   */
  async createFacilityCleaningRecord(facilityCleaningRecord: Partial<IFacilityCleaningRecord>): Promise<IFacilityCleaningRecord> {
    try {
      const facilityCleaningRecordData: Partial<IFacilityCleaningRecord> = {
        reviewDate: facilityCleaningRecord.reviewDate,
        reviewTime: facilityCleaningRecord.reviewTime,
        facility: facilityCleaningRecord.facility,
        identification: facilityCleaningRecord.identification,
        facilityType: facilityCleaningRecord.facilityType,
        location: facilityCleaningRecord.location,
        numberOfPeople: facilityCleaningRecord.numberOfPeople,
        status: facilityCleaningRecord.status,
        cleaningMethod: facilityCleaningRecord.cleaningMethod,
        responsiblePerson: facilityCleaningRecord.responsiblePerson,
        observations: facilityCleaningRecord.observations,
        image1: facilityCleaningRecord.image1,
        image2: facilityCleaningRecord.image2,
        image3: facilityCleaningRecord.image3,
        state: facilityCleaningRecord.state !== undefined ? facilityCleaningRecord.state : true,
      };

      const response = await fetch(ENDPOINTS.facilityCleaning.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facilityCleaningRecordData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating facility cleaning record:', error);
      throw error;
    }
  }

  /**
   * Update an existing facility cleaning record
   * @param id FacilityCleaningRecord ID
   * @param facilityCleaningRecord Updated facility cleaning record data
   * @returns Promise with updated facility cleaning record
   */
  async updateFacilityCleaningRecord(id: string | number, facilityCleaningRecord: Partial<IFacilityCleaningRecord>): Promise<IFacilityCleaningRecord> {
    try {
      const response = await fetch(ENDPOINTS.facilityCleaning.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facilityCleaningRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating facility cleaning record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a facility cleaning record by setting its state to inactive
   * @param id FacilityCleaningRecord ID
   * @returns Promise with operation result
   */
  async softDeleteFacilityCleaningRecord(id: string | number): Promise<any> {
    try {
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.facilityCleaning.changeState(id), {
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
      console.error(`Error soft deleting facility cleaning record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single facility cleaning record by ID
   * @param id FacilityCleaningRecord ID
   * @returns Promise with facility cleaning record data
   */
  async findById(id: string | number): Promise<IFacilityCleaningRecord> {
    try {
      const response = await fetch(ENDPOINTS.facilityCleaning.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching facility cleaning record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const facilityCleaningService = new FacilityCleaningService();

export default facilityCleaningService; 