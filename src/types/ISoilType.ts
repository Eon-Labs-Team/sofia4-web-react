import { Document } from  'mongoose';

export interface ISoilType extends document {
  idOrder: number,
  description: string,
  state: boolean
}
