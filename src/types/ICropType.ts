import { document } from './document';

export interface ICropType extends document {
  idOrder: number,
  cropName: string,
  mapColor: string,
  variety: Array<string>,
  totalVariety: number,
  phenologicalState: Array<string>,
  totalPhenologicalState: number,
  cropListState: boolean,
  barracks: Array<string>,
  barracksNumber: number,
  updateColorBarracks: boolean,
  state: boolean
}
