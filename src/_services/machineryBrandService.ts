import { ENDPOINTS } from '@/lib/constants';
import { IMachineryBrand } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

class MachineryBrandService {
  async findAll(): Promise<IMachineryBrand[]> {
    try {
      const response = await fetch(ENDPOINTS.machineryBrand.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const machineryBrandData = await response.json();
      return machineryBrandData.data || machineryBrandData;
    } catch (error) {
      console.error('Error fetching machinery brands:', error);
      throw error;
    }
  }

  async createMachineryBrand(machineryBrand: Partial<IMachineryBrand>): Promise<IMachineryBrand> {
    try {
      const machineryBrandData: Partial<IMachineryBrand> = {
        order: (machineryBrand as any).idOrder || (machineryBrand as any).order,
        brandName: machineryBrand.brandName,
        state: machineryBrand.state !== undefined ? machineryBrand.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.machineryBrand.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryBrandData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery brand:', error);
      throw error;
    }
  }

  async updateMachineryBrand(id: string | number, machineryBrand: Partial<IMachineryBrand>): Promise<IMachineryBrand> {
    try {
      const machineryBrandData = {
        ...machineryBrand,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.machineryBrand.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryBrandData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery brand ${id}:`, error);
      throw error;
    }
  }

  async softDeleteMachineryBrand(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.machineryBrand.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery brand ${id}:`, error);
      throw error;
    }
  }

  async findById(id: string | number): Promise<IMachineryBrand> {
    try {
      const response = await fetch(ENDPOINTS.machineryBrand.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery brand ${id}:`, error);
      throw error;
    }
  }
}

const machineryBrandService = new MachineryBrandService();

export default machineryBrandService;