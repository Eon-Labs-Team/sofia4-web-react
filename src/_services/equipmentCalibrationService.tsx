import { ENDPOINTS } from '@/lib/constants';
import { IEquipmentCalibration } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing equipment calibration data
 */
class EquipmentCalibrationService {
  /**
   * Get all equipment calibrations
   * @returns Promise with all equipment calibrations
   */
  async findAll(propertyId?: string | number | null): Promise<IEquipmentCalibration[]> {
    try {
      const response = await fetch(ENDPOINTS.equipmentCalibration.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment calibrations:', error);
      throw error;
    }
  }

  /**
   * Create a new equipment calibration
   * @param equipmentCalibration Equipment calibration data
   * @returns Promise with created equipment calibration
   */
  async createEquipmentCalibration(equipmentCalibration: Partial<IEquipmentCalibration>, propertyId?: string | number | null): Promise<IEquipmentCalibration> {
    try {
      const equipmentCalibrationData: Partial<IEquipmentCalibration> = {
        date: equipmentCalibration.date,
        measurementType: equipmentCalibration.measurementType,
        reference: equipmentCalibration.reference,
        capacity: equipmentCalibration.capacity,
        standardType: equipmentCalibration.standardType,
        standardWeight: equipmentCalibration.standardWeight,
        obtainedWeight: equipmentCalibration.obtainedWeight,
        result: equipmentCalibration.result,
        operator: equipmentCalibration.operator,
        correctiveAction: equipmentCalibration.correctiveAction,
        image1: equipmentCalibration.image1,
        image2: equipmentCalibration.image2,
        image3: equipmentCalibration.image3,
        timestamp: equipmentCalibration.timestamp,
        user: equipmentCalibration.user,
        state: equipmentCalibration.state !== undefined ? equipmentCalibration.state : true,
      };

      const response = await fetch(ENDPOINTS.equipmentCalibration.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(equipmentCalibrationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating equipment calibration:', error);
      throw error;
    }
  }

  /**
   * Update an existing equipment calibration
   * @param id Equipment calibration ID
   * @param equipmentCalibration Updated equipment calibration data
   * @returns Promise with updated equipment calibration
   */
  async updateEquipmentCalibration(id: string | number, equipmentCalibration: Partial<IEquipmentCalibration>): Promise<IEquipmentCalibration> {
    try {
      const response = await fetch(ENDPOINTS.equipmentCalibration.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(equipmentCalibration),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating equipment calibration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an equipment calibration by setting its state to inactive
   * @param id Equipment calibration ID
   * @returns Promise with operation result
   */
  async softDeleteEquipmentCalibration(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.equipmentCalibration.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting equipment calibration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single equipment calibration by ID
   * @param id Equipment calibration ID
   * @returns Promise with equipment calibration data
   */
  async findById(id: string | number): Promise<IEquipmentCalibration> {
    try {
      const response = await fetch(ENDPOINTS.equipmentCalibration.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching equipment calibration ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const equipmentCalibrationService = new EquipmentCalibrationService();

export default equipmentCalibrationService; 