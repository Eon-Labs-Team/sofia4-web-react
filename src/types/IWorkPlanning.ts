import { document } from './document';

export interface IWorkPlanning extends document {
  startDate: string,
  endDate: string,
  crop: Array<string>,
  variety: Array<string>,
  barracksLotType: Array<string>,
  barracksLot: Array<string>,
  totalHa: number
  realApplicationTotalHa: number,
  objective: string,
  workPlanningState: string,
  technicalAdvisor: string,
  unlockDate: string,
  user: string,
  state: boolean
}
