import { ENDPOINTS } from '@/lib/constants';
import { IHandWashingRecord } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing hand washing records
 */
class HandWashingService {
  /**
   * Get all hand washing records
   * @returns Promise with all hand washing records
   */
  async findAll(): Promise<IHandWashingRecord[]> {
    try {
      const response = await fetch(`${ENDPOINTS.handWashing.base}`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching hand washing records:', error);
      throw error;
    }
  }

  /**
   * Create a new hand washing record
   * @param handWashingRecord Hand washing record data
   * @returns Promise with created hand washing record
   */
  async createHandWashingRecord(handWashingRecord: Partial<IHandWashingRecord>): Promise<IHandWashingRecord> {
    try {
      const handWashingRecordData: Partial<IHandWashingRecord> = {
        dniRut: handWashingRecord.dniRut,
        date: handWashingRecord.date,
        time: handWashingRecord.time,
        observation: handWashingRecord.observation,
        user: handWashingRecord.user,
        state: handWashingRecord.state !== undefined ? handWashingRecord.state : true,
      };

      const response = await fetch(`${ENDPOINTS.handWashing.base}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(handWashingRecordData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating hand washing record:', error);
      throw error;
    }
  }

  /**
   * Update an existing hand washing record
   * @param id Hand washing record ID
   * @param handWashingRecord Updated hand washing record data
   * @returns Promise with updated hand washing record
   */
  async updateHandWashingRecord(id: string | number, handWashingRecord: Partial<IHandWashingRecord>): Promise<IHandWashingRecord> {
    try {
      const response = await fetch(`${ENDPOINTS.handWashing.byId(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(handWashingRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating hand washing record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a hand washing record by setting its state to inactive
   * @param id Hand washing record ID
   * @returns Promise with operation result
   */
  async softDeleteHandWashingRecord(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.handWashing.changeState(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting hand washing record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single hand washing record by ID
   * @param id Hand washing record ID
   * @returns Promise with hand washing record data
   */
  async findById(id: string | number): Promise<IHandWashingRecord> {
    try {
      const response = await fetch(`${ENDPOINTS.handWashing.byId(id)}`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching hand washing record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const handWashingService = new HandWashingService();

export default handWashingService; 