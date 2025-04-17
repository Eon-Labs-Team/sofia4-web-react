import { document } from './document';

export interface ISoilFertilization extends document {
  property: string,
  dateFertilization: string,
  classification: string,
  barracks:string,
  depth: string,
  texture: string,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  calcium: number,
  manganese: number,
  phWater: number,
  copper: number, 
  zinc: number,
  boron: number,
  ce: number,
  cic: number,
  mo: number,
  observation: string,
  state:boolean
}
