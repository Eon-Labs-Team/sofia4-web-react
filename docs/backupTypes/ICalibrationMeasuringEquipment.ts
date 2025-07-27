import { document } from './document';

export interface ICalibrationMeasuringEquipment extends document {
  date: string,
  measurementType: string,
  reference: string,
  capacity: string,
  patternType: string,
  weightPattern: number,
  weightObtained: number,
  result: boolean,
  operator: string,
  correctiveAction: string,
  image1: string,
  image2: string,
  image3: string,
  user: string,
  state: boolean
}
