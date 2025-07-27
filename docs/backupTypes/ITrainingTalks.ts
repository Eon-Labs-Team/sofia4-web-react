import { document } from './document';

export interface ITrainingTalks extends document {
  talkType: string,
  instructor: string,
  date: string,
  startTime: string,
  endTime: string,
  topicOrObjective: string,
  materials: string,
  observations: string,
  sessionDuration: string,
  participants: Array<IParticipant>,
  state: boolean
}

interface IParticipant {
  workerId: string
}
