import { document } from './document';

export interface IUnitMeasurement extends document {
  idOrder: number,
  measurementType: string,
  optionalCode?: string,
  state: boolean
}
