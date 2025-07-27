import { document } from './document';

export interface IAgriculturalWork extends document {
  barracksPaddock: string,
  barracksName: string,
  startDate: string,
  agriculturalWorkType: string,
  taskId: string,
  workId: string,
  optimalYield: number,
  rutDniRuc: number,
  contractValue: number,
  yield: number,
  dailyValue: number,
  workerBonus: number,
  workShift: number,
  teamId: number,
  systemDate: string,
  state: boolean
}
