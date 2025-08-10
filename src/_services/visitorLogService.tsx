import { ENDPOINTS } from '@/lib/constants';
import { IVisitorLog } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing visitor logs
 */
class VisitorLogService {
  /**
   * Get all visitor logs for a specific property
   * @param propertyId The ID of the property to get visitor logs for
   * @returns Promise with visitor logs for the property
   */
  async findAll(propertyId?: string | number | null): Promise<IVisitorLog[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.visitorLog.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.visitorLog.base}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
      throw error;
    }
  }

  /**
   * Create a new visitor log
   * @param visitorLog Visitor log data
   * @param propertyId The ID of the property this visitor log belongs to
   * @returns Promise with created visitor log
   */
  async createVisitorLog(visitorLog: Partial<IVisitorLog>, propertyId?: string | number | null): Promise<IVisitorLog> {
    try {
      const visitorLogData: Partial<IVisitorLog> = {
        ...visitorLog,
        // @ts-ignore
        propertyId, // Add propertyId to the visitor log data
        state: visitorLog.state !== undefined ? visitorLog.state : true
      };

      const response = await fetch(`${ENDPOINTS.visitorLog.base}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorLogData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating visitor log:', error);
      throw error;
    }
  }

  /**
   * Update an existing visitor log
   * @param id Visitor log ID
   * @param visitorLog Updated visitor log data
   * @returns Promise with updated visitor log
   */
  async updateVisitorLog(id: string | number, visitorLog: Partial<IVisitorLog>): Promise<IVisitorLog> {
    try {
      const response = await fetch(`${ENDPOINTS.visitorLog.byId(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorLog),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating visitor log ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a visitor log by setting its state to inactive
   * @param id Visitor log ID
   * @returns Promise with operation result
   */
  async softDeleteVisitorLog(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.visitorLog.changeState(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting visitor log ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single visitor log by ID
   * @param id Visitor log ID
   * @returns Promise with visitor log data
   */
  async findById(id: string | number): Promise<IVisitorLog> {
    try {
      const response = await fetch(`${ENDPOINTS.visitorLog.byId(id)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching visitor log ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const visitorLogService = new VisitorLogService();

export default visitorLogService; 