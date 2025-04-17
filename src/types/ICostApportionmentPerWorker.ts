import { Document } from  'mongoose';

export interface ICostApportionmentPerWorker extends document {
  barracksPaddock: string,
  adjustmentMethod: string,
  apportionmentMethod: string,
  observation: string,
  user: string,
  apportionmentChargeDate: string,
  userChargeDate: string,
  systemDate: string,
  state: boolean
}
