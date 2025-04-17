import { document } from './document';

export interface ILeafAnalysisRecord extends document {
  filterByClassification: string,
  barracks: string,
  samplingDate: string,
  specie: string,
  plantingYear: string,
  laboratory: string,
  totalNumber: number,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  calcium: number,
  magnesium: number,
  cooper: number,
  zinc: number,
  manganese: number,
  iron: number,
  boro: number,
  state: boolean
}
