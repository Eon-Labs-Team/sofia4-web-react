import { document } from './document';

export interface IDiscount extends document {
  discountName: string,
  discountType: string,
  percentValue: string,
  maxValue: number,
  permanentOrQuote: string,
  numberLinkedWorkers: number,
  linkedToWorked: Array<string>,
  numberUnlinkedWorkers: number,
  state: boolean
}
