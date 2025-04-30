import { ENDPOINTS } from '@/lib/constants';
import { IFieldWorkApportionment } from '@/types/IFieldWorkApportionment';

/**
 * Service for managing field work apportionment data
 */
class FieldWorkApportionmentService {
  /**
   * Get all field work apportionments
   * @returns Promise with all field work apportionments
   */
  async findAll(): Promise<IFieldWorkApportionment[]> {
    try {
      const response = await fetch(ENDPOINTS.fieldWorkApportionment.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching field work apportionments:', error);
      throw error;
    }
  }

  /**
   * Create a new field work apportionment
   * @param fieldWorkApportionment Field work apportionment data
   * @returns Promise with created field work apportionment
   */
  async createFieldWorkApportionment(fieldWorkApportionment: Partial<IFieldWorkApportionment>): Promise<IFieldWorkApportionment> {
    try {
      const fieldWorkApportionmentData: Partial<IFieldWorkApportionment> = {
        dateExecution: fieldWorkApportionment.dateExecution,
        typeLabor: fieldWorkApportionment.typeLabor,
        orderNumber: fieldWorkApportionment.orderNumber,
        phenologicalState: fieldWorkApportionment.phenologicalState,
        totalHectare: fieldWorkApportionment.totalHectare,
        coverage: fieldWorkApportionment.coverage,
        generalObjective: fieldWorkApportionment.generalObjective,
        observation: fieldWorkApportionment.observation,
        laborState: fieldWorkApportionment.laborState,
        toDownLoadSofiaApp: fieldWorkApportionment.toDownLoadSofiaApp,
        userSofiaApp: fieldWorkApportionment.userSofiaApp,
        crop: fieldWorkApportionment.crop,
        variety: fieldWorkApportionment.variety,
        classification: fieldWorkApportionment.classification,
        barracksPaddock: fieldWorkApportionment.barracksPaddock,
        temperature: fieldWorkApportionment.temperature,
        weatherCondition: fieldWorkApportionment.weatherCondition,
        windCondition: fieldWorkApportionment.windCondition,
        endLackDate: fieldWorkApportionment.endLackDate,
        reEntryDate: fieldWorkApportionment.reEntryDate,
        reEntryHour: fieldWorkApportionment.reEntryHour,
        laborOrJob: fieldWorkApportionment.laborOrJob,
        work: fieldWorkApportionment.work,
        typeWork: fieldWorkApportionment.typeWork,
        calibrationHa: fieldWorkApportionment.calibrationHa,
        optimalPerformance: fieldWorkApportionment.optimalPerformance,
        initialBonusWorker: fieldWorkApportionment.initialBonusWorker,
        formPaymentToWorker: fieldWorkApportionment.formPaymentToWorker,
        paymentType: fieldWorkApportionment.paymentType,
        range: fieldWorkApportionment.range,
        priceLabor: fieldWorkApportionment.priceLabor,
        secondRange: fieldWorkApportionment.secondRange,
        secondPriceLabor: fieldWorkApportionment.secondPriceLabor,
        thirdRange: fieldWorkApportionment.thirdRange,
        thirdPriceLabor: fieldWorkApportionment.thirdPriceLabor,
        fourthRange: fieldWorkApportionment.fourthRange,
        fourthPriceLabor: fieldWorkApportionment.fourthPriceLabor,
        fifthRange: fieldWorkApportionment.fifthRange,
        fifthPriceLabor: fieldWorkApportionment.fifthPriceLabor,
        state: fieldWorkApportionment.state !== undefined ? fieldWorkApportionment.state : true,
      };

      const response = await fetch(ENDPOINTS.fieldWorkApportionment.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldWorkApportionmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating field work apportionment:', error);
      throw error;
    }
  }

  /**
   * Update an existing field work apportionment
   * @param id Field work apportionment ID
   * @param fieldWorkApportionment Updated field work apportionment data
   * @returns Promise with updated field work apportionment
   */
  async updateFieldWorkApportionment(id: string | number, fieldWorkApportionment: Partial<IFieldWorkApportionment>): Promise<IFieldWorkApportionment> {
    try {
      const response = await fetch(ENDPOINTS.fieldWorkApportionment.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldWorkApportionment),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating field work apportionment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a field work apportionment by setting its state to inactive
   * @param id Field work apportionment ID
   * @returns Promise with operation result
   */
  async softDeleteFieldWorkApportionment(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.fieldWorkApportionment.changeState(id), {
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
      console.error(`Error soft deleting field work apportionment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single field work apportionment by ID
   * @param id Field work apportionment ID
   * @returns Promise with field work apportionment data
   */
  async findById(id: string | number): Promise<IFieldWorkApportionment> {
    try {
      const response = await fetch(ENDPOINTS.fieldWorkApportionment.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching field work apportionment ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const fieldWorkApportionmentService = new FieldWorkApportionmentService();

export default fieldWorkApportionmentService; 