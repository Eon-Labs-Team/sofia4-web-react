import { document } from './document';

export interface IMachineryCleaning extends document {
  equipmentType: string,
  machinery: string,
  date: string,
  hour: string,
  detergent: string,
  dose: string,
  dilution: string,
  volume: string,
  wastePlace: string,
  operator: string,
  supervisor: string,
  observation: string,
  state: boolean
}
