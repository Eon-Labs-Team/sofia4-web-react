import { document } from './document';

export interface IHygieneSanitation extends document {
  type: string,
  startPeriod: string,
  endPeriod: string,
  titleForField1: string,
  titleForField2: string,
  field3To20: Array<string>,
  user: string,
  state: boolean
}
