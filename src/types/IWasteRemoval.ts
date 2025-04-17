import { document } from './document';

export interface IWasteRemoval extends document {
  date: string,
  site: string,
  supervisor: string,
  residueType: string,
  classification: string,
  quantity: number,
  dispatchGuide: string,
  moveTo: string,
  responsible: string,
  state: boolean
}
