import { Document } from  'mongoose';

export interface IFormReason extends document {
  idOrder: number,
  description: string,
  state: boolean
}
