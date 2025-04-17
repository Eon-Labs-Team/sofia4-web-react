import { Document } from  'mongoose';

export interface ITemperatureUnit extends document {
  code: string,
  description: string,
  state: boolean
}
