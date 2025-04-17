import { Document } from  'mongoose';

export interface ICropQuality extends document {
  idOrder: number,
  description: string,
  shortName?: string,
  state: boolean
}
