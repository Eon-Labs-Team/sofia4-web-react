import { document } from './document';

export interface IChlorineRegistration extends document {
  code: string,
  area: string,
  plotLot: string,
  frequency: string,
  supervisor: string,
  observations: string,
  reviewer: string,
  state: boolean
}
