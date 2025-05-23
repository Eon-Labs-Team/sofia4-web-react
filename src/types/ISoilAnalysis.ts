import { document } from './document';

export interface ISoilAnalysis extends document {
  classification: string,
  barracks: string,
  reportNumber: string,
  sampleNumber: string,
  dateReception: string,
  dateSampling: string,
  crop: string,
  variety: string,
  depth: string,
  texture: string,
  laboratory: string,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  copper: number,
  iron: number,
  manganese: number,
  zinc: number,
  boron: number,
  sulfur: number,
  magnesium: number,
  calcium: number,
  cerium: number,
  ph: number,
  cic: number,
  state:boolean
}
