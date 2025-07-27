import { ENDPOINTS } from '@/lib/constants';
import { BarracksList } from '@/types/barracksList';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing lista cuarteles (barracks list) data
 */
class ListaCuartelesService {
  /**
   * Get all barracks list
   * @returns Promise with all barracks list
   */
  async findAll(): Promise<BarracksList[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.listaCuarteles.base);
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
  async createBarracksList(barracksList: Partial<BarracksList>): Promise<BarracksList> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const barracksListData: Partial<BarracksList> = {
        isProductive: barracksList.isProductive !== undefined ? barracksList.isProductive : false,
        classificationZone: barracksList.classificationZone,
        barracksPaddockName: barracksList.barracksPaddockName,
        codeOptional: barracksList.codeOptional,
        observation: barracksList.observation || '',
        state: barracksList.state !== undefined ? barracksList.state : true,
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
          itsByHa: barracksList.itsByHa,
          irrigationZone: barracksList.irrigationZone !== undefined ? barracksList.irrigationZone : false,
          barracksLotObject: barracksList.barracksLotObject,
          investmentNumber: barracksList.investmentNumber,
          mapSectorColor: barracksList.mapSectorColor,
        });
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        barracksListData.propertyId = propertyId;
      }

      // Add createdBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        barracksListData.createdBy = user.id;
        barracksListData.updatedBy = user.id;
      }

      const response = await fetch(ENDPOINTS.listaCuarteles.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async updateBarracksList(id: string | number, barracksList: Partial<BarracksList>): Promise<BarracksList> {
    try {
      const { user } = useAuthStore.getState();
      
      const barracksListData: Partial<BarracksList> = {
        isProductive: barracksList.isProductive !== undefined ? barracksList.isProductive : false,
        classificationZone: barracksList.classificationZone,
        barracksPaddockName: barracksList.barracksPaddockName,
        codeOptional: barracksList.codeOptional,
        observation: barracksList.observation || '',
        state: barracksList.state !== undefined ? barracksList.state : true,
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
          itsByHa: barracksList.itsByHa,
          irrigationZone: barracksList.irrigationZone !== undefined ? barracksList.irrigationZone : false,
          barracksLotObject: barracksList.barracksLotObject,
          investmentNumber: barracksList.investmentNumber,
          mapSectorColor: barracksList.mapSectorColor,
        });
      }

      // Add updatedBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        barracksListData.updatedBy = user.id;
      }

      const response = await fetch(ENDPOINTS.listaCuarteles.byId(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
  async findById(id: string | number): Promise<BarracksList> {
    try {
      const response = await fetch(ENDPOINTS.listaCuarteles.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
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