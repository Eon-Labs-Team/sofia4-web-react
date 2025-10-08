import { ENDPOINTS } from '@/lib/constants';
import { ICalibrationMeasuringEquipment } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing calibration measuring equipment data
 */
class CalibrationMeasuringEquipmentService {
  /**
   * Get all calibration measuring equipment records
   * @returns Promise with all calibration records
   */
  async findAll(): Promise<ICalibrationMeasuringEquipment[]> {
    try {
      const response = await fetch(ENDPOINTS.calibrationMeasuringEquipment.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibration measuring equipment:', error);
      throw error;
    }
  }

  /**
   * Create a new calibration measuring equipment record
   * @param calibration Calibration data
   * @returns Promise with created calibration
   */
  async createCalibrationMeasuringEquipment(calibration: Partial<ICalibrationMeasuringEquipment>): Promise<ICalibrationMeasuringEquipment> {
    try {
      const calibrationData: Partial<ICalibrationMeasuringEquipment> = {
        date: calibration.date,
        measurementType: calibration.measurementType,
        reference: calibration.reference,
        capacity: calibration.capacity,
        patternType: calibration.patternType,
        weightPattern: calibration.weightPattern,
        weightObtained: calibration.weightObtained,
        result: calibration.result,
        operator: calibration.operator,
        correctiveAction: calibration.correctiveAction,
        image1: calibration.image1,
        image2: calibration.image2,
        image3: calibration.image3,
        user: calibration.user,
        state: calibration.state !== undefined ? calibration.state : true
      };

      const response = await fetch(ENDPOINTS.calibrationMeasuringEquipment.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(calibrationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating calibration measuring equipment:', error);
      throw error;
    }
  }

  /**
   * Update an existing calibration measuring equipment record
   * @param id Calibration ID
   * @param calibration Updated calibration data
   * @returns Promise with updated calibration
   */
  async updateCalibrationMeasuringEquipment(id: string | number, calibration: Partial<ICalibrationMeasuringEquipment>): Promise<ICalibrationMeasuringEquipment> {
    try {
      const response = await fetch(ENDPOINTS.calibrationMeasuringEquipment.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(calibration),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating calibration measuring equipment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a calibration by setting its state to inactive
   * @param id Calibration ID
   * @returns Promise with operation result
   */
  async softDeleteCalibrationMeasuringEquipment(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.calibrationMeasuringEquipment.changeState(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting calibration measuring equipment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single calibration measuring equipment record by ID
   * @param id Calibration ID
   * @returns Promise with calibration data
   */
  async findById(id: string | number): Promise<ICalibrationMeasuringEquipment> {
    try {
      const response = await fetch(ENDPOINTS.calibrationMeasuringEquipment.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching calibration measuring equipment ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const calibrationMeasuringEquipmentService = new CalibrationMeasuringEquipmentService();

export default calibrationMeasuringEquipmentService; 