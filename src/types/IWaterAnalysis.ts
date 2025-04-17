import { document } from './document';

export interface IWaterAnalysis extends document {
  date: string,
  requestedBy: string,
  samplingCode: string,
  samplingSite: string,
  samplingHour: string,
  waterType: string,
  weatherType: string,
  sampleBy:string,
  totalColiforms: number,
  escherichiaColi: number,
  temperature: number,
  chlorine: number,
  turbidity: number,
  nitrites: number,
  chlorides: number,
  waterHardness: number,
  conductivity: number,
  ph: number,
  residual: number,
  iron: number,
  aluminum: number,
  sulphates: number,
  state: boolean
}
