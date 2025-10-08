import { ENDPOINTS } from '@/lib/constants';
import { IMachineryType } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

class MachineryTypeService {
  async findAll(): Promise<IMachineryType[]> {
    try {
      const response = await fetch(ENDPOINTS.machineryType.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const machineryTypeData = await response.json();
      return machineryTypeData.data || machineryTypeData;
    } catch (error) {
      console.error('Error fetching machinery types:', error);
      throw error;
    }
  }

  async createMachineryType(machineryType: Partial<IMachineryType>): Promise<IMachineryType> {
    try {
      const machineryTypeData: Partial<IMachineryType> = {
        order: (machineryType as any).idOrder || (machineryType as any).order,
        machineryTypeName: machineryType.machineryTypeName,
        state: machineryType.state !== undefined ? machineryType.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.machineryType.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery type:', error);
      throw error;
    }
  }

  async updateMachineryType(id: string | number, machineryType: Partial<IMachineryType>): Promise<IMachineryType> {
    try {
      const machineryTypeData = {
        ...machineryType,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.machineryType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryTypeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery type ${id}:`, error);
      throw error;
    }
  }

  async softDeleteMachineryType(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.machineryType.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery type ${id}:`, error);
      throw error;
    }
  }

  async findById(id: string | number): Promise<IMachineryType> {
    try {
      const response = await fetch(ENDPOINTS.machineryType.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery type ${id}:`, error);
      throw error;
    }
  }
}

const machineryTypeService = new MachineryTypeService();

export default machineryTypeService;