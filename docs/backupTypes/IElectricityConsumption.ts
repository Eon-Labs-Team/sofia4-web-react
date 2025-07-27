import { document } from './document';

export interface IElectricityConsumption extends document {
  meterNumber: string,
  date: string,
  quantity: number,
  unit: string,
  state: boolean
}
