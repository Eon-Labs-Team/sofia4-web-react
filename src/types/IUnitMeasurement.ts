import { Document } from  'mongoose';

export interface IUnitMeasurement extends document {
  idOrder: number,
  measurementType: string,
  optionalCode?: string,
  state: boolean
}
