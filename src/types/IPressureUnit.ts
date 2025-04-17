import { Document } from  'mongoose';

export interface IPressureUnit extends document {
  code: string,
  description: string,
  state: boolean
}
