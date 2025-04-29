import { ENDPOINTS } from '@/lib/constants';
import { ITrainingTalks } from '@/types/ITrainingTalks';

/**
 * Service for managing training talks data
 */
class TrainingTalksService {
  /**
   * Get all training talks
   * @returns Promise with all training talks
   */
  async findAll(): Promise<ITrainingTalks[]> {
    try {
      const response = await fetch(ENDPOINTS.trainingTalks.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching training talks:', error);
      throw error;
    }
  }

  /**
   * Create a new training talk
   * @param trainingTalk Training talk data
   * @returns Promise with created training talk
   */
  async createTrainingTalk(trainingTalk: Partial<ITrainingTalks>): Promise<ITrainingTalks> {
    try {
      const trainingTalkData: Partial<ITrainingTalks> = {
        talkType: trainingTalk.talkType,
        instructor: trainingTalk.instructor,
        date: trainingTalk.date,
        startTime: trainingTalk.startTime,
        endTime: trainingTalk.endTime,
        topicOrObjective: trainingTalk.topicOrObjective,
        materials: trainingTalk.materials,
        observations: trainingTalk.observations,
        sessionDuration: trainingTalk.sessionDuration,
        participants: trainingTalk.participants,
        state: trainingTalk.state !== undefined ? trainingTalk.state : true
      };

      const response = await fetch(ENDPOINTS.trainingTalks.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingTalkData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating training talk:', error);
      throw error;
    }
  }

  /**
   * Update an existing training talk
   * @param id Training talk ID
   * @param trainingTalk Updated training talk data
   * @returns Promise with updated training talk
   */
  async updateTrainingTalk(id: string | number, trainingTalk: Partial<ITrainingTalks>): Promise<ITrainingTalks> {
    try {
      const response = await fetch(ENDPOINTS.trainingTalks.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingTalk),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating training talk ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a training talk by setting its state to inactive
   * @param id Training talk ID
   * @returns Promise with operation result
   */
  async softDeleteTrainingTalk(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.trainingTalks.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting training talk ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single training talk by ID
   * @param id Training talk ID
   * @returns Promise with training talk data
   */
  async findById(id: string | number): Promise<ITrainingTalks> {
    try {
      const response = await fetch(ENDPOINTS.trainingTalks.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching training talk ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const trainingTalksService = new TrainingTalksService();

export default trainingTalksService; 