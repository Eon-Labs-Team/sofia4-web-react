import { document } from './document';

export interface IBackPumpCalculation extends document {
  date: string,
  pumpNumber: string,
  diameterByMeters: number,
  meters: number,
  walkMeters: number,
  liters1: number,
  liters2: number,
  liters3: number,
  litersByHa: number,
  user: string,
  state: boolean
}
