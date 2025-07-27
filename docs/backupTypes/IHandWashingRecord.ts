import { document } from './document';

export interface IHandWashingRecord extends document {
  dniRut: string,
  date: string,
  time: string,
  observation: string,
  user: string,
  state: boolean
}
