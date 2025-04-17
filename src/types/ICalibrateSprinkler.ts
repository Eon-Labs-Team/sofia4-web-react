import { document } from './document';

export interface ICalibrateSprinkler extends document {
  barracks: string,
  date: string,
  equipment: string,
  dischargeShot1: number,
  dischargeShot2: number,
  dischargeShot3: number,
  averageDischarge: number,
  nozzleReference: string,
  dischargeData: string,
  dischargeRange: string,
  nozzleState: string,
  operator: string,
  observation: string,
  state: boolean
}
