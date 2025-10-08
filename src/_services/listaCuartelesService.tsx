import { ENDPOINTS } from '@/lib/constants';
import { IOperationalArea } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing lista cuarteles (barracks list) data
 */
class ListaCuartelesService {
  /**
   * Get all barracks list
   * @returns Promise with all barracks list
   */
  async findAll(): Promise<IOperationalArea[]> {
    try {
      const url = authService.buildUrlWithParams(ENDPOINTS.listaCuarteles.base);
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const barracksData = await response.json();
      return barracksData.data || barracksData;
    } catch (error) {
      console.error('Error fetching barracks list:', error);
      throw error;
    }
  }

  /**
   * Get all productive areas
   * @returns Promise with all productive areas
   */
  async findProductiveAreas(): Promise<IOperationalArea[]> {
    try {
      // Create a URL with query parameters
      const url = authService.buildUrlWithParams(ENDPOINTS.listaCuarteles.getProductive);
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const barracksData = await response.json();
      return barracksData.data || barracksData;
    } catch (error) {
      console.error('Error fetching barracks list:', error);
      throw error;
    }
  }

  /**
   * Create a new barracks list
   * @param barracksList BarracksList data
   * @returns Promise with created barracks list
   */
  async createBarracksList(barracksList: Partial<IOperationalArea>): Promise<IOperationalArea> {
    try {
      const barracksListData: Partial<IOperationalArea> = {
        ...barracksList,
        state: barracksList.state !== undefined ? barracksList.state : true
      };

      // Solo incluir campos productivos si el cuartel es productivo
      if (barracksList.isProductive) {
        Object.assign(barracksListData, {
          organic: barracksList.organic !== undefined ? barracksList.organic : false,
          varietySpecies: barracksList.varietySpecies,
          variety: barracksList.variety,
          qualityType: barracksList.qualityType,
          totalHa: barracksList.totalHa,
          totalPlants: barracksList.totalPlants,
          percentToRepresent: barracksList.percentToRepresent,
          availableRecord: barracksList.availableRecord,
          active: barracksList.active !== undefined ? barracksList.active : true,
          useProration: barracksList.useProration !== undefined ? barracksList.useProration : true,
          firstHarvestDate: barracksList.firstHarvestDate,
          firstHarvestDay: barracksList.firstHarvestDay,
          secondHarvestDate: barracksList.secondHarvestDate,
          secondHarvestDay: barracksList.secondHarvestDay,
          thirdHarvestDate: barracksList.thirdHarvestDate,
          thirdHarvestDay: barracksList.thirdHarvestDay,
          soilType: barracksList.soilType,
          texture: barracksList.texture,
          depth: barracksList.depth,
          soilPh: barracksList.soilPh,
          percentPending: barracksList.percentPending,
          pattern: barracksList.pattern,
          plantationYear: barracksList.plantationYear,
          plantNumber: barracksList.plantNumber,
          rowsList: barracksList.rowsList,
          plantForRow: barracksList.plantForRow,
          distanceBetweenRowsMts: barracksList.distanceBetweenRowsMts,
          rowsTotal: barracksList.rowsTotal,
          area: barracksList.area,
          irrigationType: barracksList.irrigationType,
          ltsByHa: barracksList.ltsByHa,
          irrigationZone: barracksList.irrigationZone !== undefined ? barracksList.irrigationZone : false,
          barracksLotObject: barracksList.barracksLotObject,
          investmentNumber: barracksList.investmentNumber,
          mapSectorColor: barracksList.mapSectorColor,
        });
      }
      
      // Add createdBy field with current user ID
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        barracksListData.createdBy = currentUser.id;
        barracksListData.updatedBy = currentUser.id;
      }

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.listaCuarteles.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(barracksListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating barracks list:', error);
      throw error;
    }
  }

  /**
   * Update an existing barracks list
   * @param id BarracksList ID
   * @param barracksList Updated BarracksList data
   * @returns Promise with updated barracks list
   */
  async updateBarracksList(id: string | number, barracksList: Partial<IOperationalArea>): Promise<IOperationalArea> {
    try {
      const barracksListData: Partial<IOperationalArea> = {
        isProductive: barracksList.isProductive !== undefined ? barracksList.isProductive : false,
        classificationZone: barracksList.classificationZone,
        areaName: barracksList.areaName,
        codeOptional: barracksList.codeOptional,
        observation: barracksList.observation || '',
        state: barracksList.state !== undefined ? barracksList.state : true,
        availableRecord: barracksList.availableRecord,
        active: barracksList.active !== undefined ? barracksList.active : true,


      };

      // Solo incluir campos productivos si el cuartel es productivo
      if (barracksList.isProductive) {
        Object.assign(barracksListData, {
          organic: barracksList.organic !== undefined ? barracksList.organic : false,
          varietySpecies: barracksList.varietySpecies,
          variety: barracksList.variety,
          qualityType: barracksList.qualityType,
          totalHa: barracksList.totalHa,
          totalPlants: barracksList.totalPlants,
          percentToRepresent: barracksList.percentToRepresent,
          availableRecord: barracksList.availableRecord,
          active: barracksList.active !== undefined ? barracksList.active : true,
          useProration: barracksList.useProration !== undefined ? barracksList.useProration : true,
          firstHarvestDate: barracksList.firstHarvestDate,
          firstHarvestDay: barracksList.firstHarvestDay,
          secondHarvestDate: barracksList.secondHarvestDate,
          secondHarvestDay: barracksList.secondHarvestDay,
          thirdHarvestDate: barracksList.thirdHarvestDate,
          thirdHarvestDay: barracksList.thirdHarvestDay,
          soilType: barracksList.soilType,
          texture: barracksList.texture,
          depth: barracksList.depth,
          soilPh: barracksList.soilPh,
          percentPending: barracksList.percentPending,
          pattern: barracksList.pattern,
          plantationYear: barracksList.plantationYear,
          plantNumber: barracksList.plantNumber,
          rowsList: barracksList.rowsList,
          plantForRow: barracksList.plantForRow,
          distanceBetweenRowsMts: barracksList.distanceBetweenRowsMts,
          rowsTotal: barracksList.rowsTotal,
          area: barracksList.area,
          irrigationType: barracksList.irrigationType,
          ltsByHa: barracksList.ltsByHa,
          irrigationZone: barracksList.irrigationZone !== undefined ? barracksList.irrigationZone : false,
          barracksLotObject: barracksList.barracksLotObject,
          investmentNumber: barracksList.investmentNumber,
          mapSectorColor: barracksList.mapSectorColor,
        });
      }

      // Add updatedBy field with current user ID
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        barracksListData.updatedBy = currentUser.id;
      }

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.listaCuarteles.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(barracksListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating barracks list:', error);
      throw error;
    }
  }

  /**
   * Soft delete a barracks list (sets state to false)
   * @param id BarracksList ID
   * @returns Promise with result
   */
  async softDeleteBarracksList(id: string | number): Promise<void> {
    try {
      const response = await fetch(ENDPOINTS.listaCuarteles.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error soft deleting barracks list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single barracks list by ID
   * @param id BarracksList ID
   * @returns Promise with barracks list data
   */
  async findById(id: string | number): Promise<IOperationalArea> {
    try {
      const response = await fetch(ENDPOINTS.listaCuarteles.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching barracks list ${id}:`, error);
      throw error;
    }
  }
}

const listaCuartelesService = new ListaCuartelesService();
export default listaCuartelesService; 