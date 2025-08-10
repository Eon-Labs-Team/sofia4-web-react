import { ENDPOINTS } from '@/lib/constants';
import { IMachinery } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing machinery data
 */
class MachineryService {
  /**
   * Get all machinery
   * @returns Promise with all machinery
   */
  async findAll(): Promise<IMachinery[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.machinery.base);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching machinery:', error);
      throw error;
    }
  }

  /**
   * Create a new machinery record
   * @param machinery Machinery data
   * @returns Promise with created machinery
   */
  async createMachinery(machinery: Partial<IMachinery>): Promise<IMachinery> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const machineryData: Partial<IMachinery> = {
        workId: machinery.workId,
        machinery: machinery.machinery,
        startTime: machinery.startTime,
        endTime: machinery.endTime,
        finalHours: machinery.finalHours,
        timeValue: machinery.timeValue,
        totalValue: machinery.totalValue,
        createdBy: user?.id || null,
        updatedBy: user?.id || null,
      };

      console.log(machineryData);
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.machinery.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery:', error);
      throw error;
    }
  }

  /**
   * Update an existing machinery record
   * @param id Machinery ID
   * @param machinery Updated machinery data
   * @returns Promise with updated machinery
   */
  async updateMachinery(id: string | number, machinery: Partial<IMachinery>): Promise<IMachinery> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      const machineryData = { ...machinery };
      
      // Add updatedBy field
      machineryData.updatedBy = user?.id || null;
      
      // Remove version field if it exists
      if ('__v' in machineryData) {
        delete (machineryData as any).__v;
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.machinery.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a machinery record by setting its state to inactive
   * @param id Machinery ID
   * @returns Promise with operation result
   */
  async softDeleteMachinery(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const stateData: any = { state: false };
      
      // Add propertyId if available
      if (propertyId) {
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.machinery.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single machinery record by ID
   * @param id Machinery ID
   * @returns Promise with machinery data
   */
  async findById(id: string | number): Promise<IMachinery> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.machinery.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const machineryService = new MachineryService();

export default machineryService; 