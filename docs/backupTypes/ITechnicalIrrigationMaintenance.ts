import { document } from './document';

export interface ITechnicalIrrigationMaintenance extends document {
  barracks: string,
  supervisor: string,
  date: string,
  hallNumber: number,
  centerCost: string,
  workType: string,
  workDone: string,
  responsible: string,
  state: boolean
}
