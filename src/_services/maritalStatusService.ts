import { ENDPOINTS } from '@/lib/constants';
import { IMaritalStatus } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

class MaritalStatusService {
  async findAll(): Promise<IMaritalStatus[]> {
    try {
      const response = await fetch(ENDPOINTS.maritalStatus.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const maritalStatusData = await response.json();
      return maritalStatusData.data || maritalStatusData;
    } catch (error) {
      console.error('Error fetching marital statuses:', error);
      throw error;
    }
  }

  async createMaritalStatus(maritalStatus: Partial<IMaritalStatus>): Promise<IMaritalStatus> {
    try {
      const maritalStatusData: Partial<IMaritalStatus> = {
        order: (maritalStatus as any).idOrder || (maritalStatus as any).order,
        description: maritalStatus.description,
        state: maritalStatus.state !== undefined ? maritalStatus.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.maritalStatus.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(maritalStatusData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating marital status:', error);
      throw error;
    }
  }

  async updateMaritalStatus(id: string | number, maritalStatus: Partial<IMaritalStatus>): Promise<IMaritalStatus> {
    try {
      const maritalStatusData = {
        ...maritalStatus,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.maritalStatus.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(maritalStatusData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating marital status ${id}:`, error);
      throw error;
    }
  }

  async softDeleteMaritalStatus(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.maritalStatus.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting marital status ${id}:`, error);
      throw error;
    }
  }

  async findById(id: string | number): Promise<IMaritalStatus> {
    try {
      const response = await fetch(ENDPOINTS.maritalStatus.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching marital status ${id}:`, error);
      throw error;
    }
  }
}

const maritalStatusService = new MaritalStatusService();

export default maritalStatusService;