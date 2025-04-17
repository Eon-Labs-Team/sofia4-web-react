import { document } from './document';

export interface IEquipmentCalibration extends document {
  date: string,
  measurementType: string,
  reference: string,
  capacity: number,
  standardType: string,
  standardWeight: number,
  obtainedWeight: number,
  result: string,
  operator: string,
  correctiveAction: string,
  image1: string,
  image2: string,
  image3: string,
  timestamp: string,
  user: string,
  state: boolean
}
