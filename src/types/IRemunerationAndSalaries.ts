import { document } from './document';

export interface IRemunerationAndSalaries extends document {
  assetsName: string,
  assetType: string,
  percentPrice: string,
  taxable: boolean,
  maxValue: number,
  permanentOrQuota: string,
  applyDate: string,
  linkedToWorked: string,
  date: string,
  user: string,
  state: boolean
}
