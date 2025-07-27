import { document } from './document';

export interface IBackpackSprayerCalculation extends document {
  date: string,
  sprayerNumber: string,
  step2Diameter: number,
  step4DistanceWalked: number,
  step5Liters1: number,
  step5Liters2: number,
  state: boolean
}
