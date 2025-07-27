import { document } from './document';

export interface IWaterConsumption extends document {
  zone: string,
  sectorOrBooth: string,
  date: string,
  time: string,
  meterNumber: string,
  privateQuantity: number,
  publicQuantity: number,
  totalQuantity: number,
  flowRate: number,
  observation: string,
  state: boolean
}
