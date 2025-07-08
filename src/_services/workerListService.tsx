import { ENDPOINTS } from '@/lib/constants';
import { IWorkerList } from '@/types/IWorkerList';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing worker list data
 */
class WorkerListService {
  /**
   * Get all worker list
   * @returns Promise with all worker list
   */
  async findAll(): Promise<IWorkerList[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.workerList.base);
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
      
      const workerData = await response.json();
      return workerData.data || workerData;
    } catch (error) {
      console.error('Error fetching worker list:', error);
      throw error;
    }
  }

  /**
   * Create a new worker list entry
   * @param workerList IWorkerList data
   * @returns Promise with created worker list
   */
  async createWorkerList(workerList: Partial<IWorkerList>): Promise<IWorkerList> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const workerListData: Partial<IWorkerList> = {
        // Campos obligatorios según el schema con fallbacks
        rutDniNationality: workerList.rutDniNationality || 'CL', // Default nationality Chile
        rut: workerList.rut || '00000000-0', // Placeholder RUT format
        names: workerList.names || 'No especificado',
        lastName: workerList.lastName || 'No especificado',
        secondLastName: workerList.secondLastName || 'No especificado',
        sex: workerList.sex || 'No especificado', // Could be 'M', 'F', or 'No especificado'
        property: workerList.property || propertyId?.toString() || '1', // Use current propertyId or default
        provisionalRegime: workerList.provisionalRegime !== undefined ? workerList.provisionalRegime : true,
        startDate: workerList.startDate || new Date().toISOString().split('T')[0], // Current date as YYYY-MM-DD
        provision: workerList.provision || 'No especificado',
        socialSecurity: workerList.socialSecurity || 'No especificado',
        
        // Campos opcionales con valores por defecto vacíos
        workerNationality: workerList.workerNationality || '',
        identificationDocumentType: workerList.identificationDocumentType || '',
        internalCod: workerList.internalCod || '',
        birthDate: workerList.birthDate || '',
        civilState: workerList.civilState || '',
        address: workerList.address || '',
        city: workerList.city || '',
        region: workerList.region || '',
        country: workerList.country || '',
        phone: workerList.phone || '',
        email: workerList.email || '',
        recordType: workerList.recordType || '',
        workerListId: workerList.workerListId || '',
        
        // Campos de certificación con valores por defecto
        administrative: workerList.administrative || false,
        dispenser: workerList.dispenser || false,
        dispenserResponsible: workerList.dispenserResponsible || false,
        dispenserChecker: workerList.dispenserChecker || '',
        certificationNumber: workerList.certificationNumber || '',
        applicator: workerList.applicator || '',
        applicatorResponsible: workerList.applicatorResponsible || false,
        applicatorChecker: workerList.applicatorChecker || false,
        institution: workerList.institution || '',
        expirationDate: workerList.expirationDate || '',
        
        // Campos de contrato con valores por defecto
        classify: workerList.classify || '',
        contractType: workerList.contractType || '',
        contractDocument: workerList.contractDocument || '',
        contractAnnexed: workerList.contractAnnexed || '',
        baseSalary: workerList.baseSalary || 0,
        calculationType: workerList.calculationType || '',
        endDate: workerList.endDate || '',
        contractFunction: workerList.contractFunction || '',
        workerListState: workerList.workerListState || '',
        stateCDate: workerList.stateCDate || '',
        stateCUser: workerList.stateCUser || '',
        observation: workerList.observation || '',
        
        // Campos de asistencia con valores por defecto
        controlClockAttendance: workerList.controlClockAttendance || '',
        assignsAttendanceClassify: workerList.assignsAttendanceClassify || '',
        operativeAreaAttendance: workerList.operativeAreaAttendance || '',
        laborWorkAttendance: workerList.laborWorkAttendance || '',
        hitchContractorDepend: workerList.hitchContractorDepend || '',
        laborUpdate: workerList.laborUpdate || false,
        laborUpdateDateSince: workerList.laborUpdateDateSince || '',
        laborUpdateDateTill: workerList.laborUpdateDateTill || '',
        
        // Campos de salario con valores por defecto
        rankDay: workerList.rankDay || '',
        priceDayExtraHour: workerList.priceDayExtraHour || '',
        
        // Campos de beneficios con valores por defecto
        youngWorkerBonus: workerList.youngWorkerBonus || false,
        workType: workerList.workType || '',
        
        // Campos de previsión con valores por defecto
        quote: workerList.quote || '',
        savingVoluntary: workerList.savingVoluntary || '',
        sis: workerList.sis || '',
        sn: workerList.sn || '',
        valueQuote: workerList.valueQuote || '',
        valueVolumeSaving: workerList.valueVolumeSaving || 0,
        valueSis: workerList.valueSis || 0,
        valueSn: workerList.valueSn || 0,
        
        // Campos de salud con valores por defecto
        health: workerList.health || '',
        additional: workerList.additional || '',
        firstValue: workerList.firstValue || '',
        secondValue: workerList.secondValue || '',
        ccaf: workerList.ccaf || '',
        funNumberOptional: workerList.funNumberOptional || '',
        funNumber: workerList.funNumber || '',
        valueHealth: workerList.valueHealth || 0,
        valueAdditional: workerList.valueAdditional || 0,
        thirdValue: workerList.thirdValue || '',
        fourthValue: workerList.fourthValue || '',
        
        // Campos de pago con valores por defecto
        paymentType: workerList.paymentType || '',
        bank: workerList.bank || '',
        workerEmail: workerList.workerEmail || '',
        accountNumber: workerList.accountNumber || 0,
        accountType: workerList.accountType || '',
        
        // Campos de seguros particulares con valores por defecto
        particularInstitution: workerList.particularInstitution || '',
        particularContractNumber: workerList.particularContractNumber || '',
        particularPaymentMethod: workerList.particularPaymentMethod || '',
        savingTo: workerList.savingTo || '',
        quoteAmount: workerList.quoteAmount || 0,
        
        // Campos de seguros colectivos con valores por defecto
        collectiveInstitution: workerList.collectiveInstitution || '',
        collectiveContractNumber: workerList.collectiveContractNumber || '',
        collectivePaymentMethod: workerList.collectivePaymentMethod || '',
        savingWorker: workerList.savingWorker || '',
        workerAmount: workerList.workerAmount || '',
        inputCompany: workerList.inputCompany || '',
        amountInputCompany: workerList.amountInputCompany || 0,
        
        // Estado por defecto
        state: workerList.state !== undefined ? workerList.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerListData.propertyId = propertyId;
      }

      // Add createdBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerListData.createdBy = user.id;
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerListData.updatedBy = user.id;
      }

      console.log("workerlistData to insert in service", workerListData);

      const response = await fetch(ENDPOINTS.workerList.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating worker list:', error);
      throw error;
    }
  }

  /**
   * Update an existing worker list entry
   * @param id WorkerList ID
   * @param workerList Updated worker list data
   * @returns Promise with updated worker list
   */
  async updateWorkerList(id: string | number, workerList: Partial<IWorkerList>): Promise<IWorkerList> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      // Apply fallbacks for required fields if they are being updated
      const updateData: Partial<IWorkerList> = {
        ...workerList,
        // Apply fallbacks only if the fields are present in the update
        ...(workerList.rutDniNationality !== undefined && { rutDniNationality: workerList.rutDniNationality || 'CL' }),
        ...(workerList.rut !== undefined && { rut: workerList.rut || '00000000-0' }),
        ...(workerList.names !== undefined && { names: workerList.names || 'No especificado' }),
        ...(workerList.lastName !== undefined && { lastName: workerList.lastName || 'No especificado' }),
        ...(workerList.secondLastName !== undefined && { secondLastName: workerList.secondLastName || 'No especificado' }),
        ...(workerList.sex !== undefined && { sex: workerList.sex || 'No especificado' }),
        ...(workerList.property !== undefined && { property: workerList.property || propertyId?.toString() || '1' }),
        ...(workerList.startDate !== undefined && { startDate: workerList.startDate || new Date().toISOString().split('T')[0] }),
        ...(workerList.provision !== undefined && { provision: workerList.provision || 'No especificado' }),
        ...(workerList.socialSecurity !== undefined && { socialSecurity: workerList.socialSecurity || 'No especificado' }),
        // Handle provisionalRegime separately as it's boolean
        ...(workerList.provisionalRegime !== undefined && { provisionalRegime: workerList.provisionalRegime })
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        updateData.propertyId = propertyId;
      }

      // Add updatedBy field with current user ID
      if (user?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        updateData.updatedBy = user.id;
      }
      
      const response = await fetch(ENDPOINTS.workerList.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating worker list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a worker list entry
   * @param id WorkerList ID
   * @returns Promise with deleted worker list
   */
  async softDeleteWorkerList(id: string | number): Promise<IWorkerList> {
    try {
      const response = await fetch(ENDPOINTS.workerList.changeState(id, false), {
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
      console.error(`Error deleting worker list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single worker list entry by ID
   * @param id WorkerList ID
   * @returns Promise with worker list data
   */
  async findById(id: string | number): Promise<IWorkerList> {
    try {
      const response = await fetch(ENDPOINTS.workerList.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching worker list ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const workerListService = new WorkerListService();

export default workerListService; 