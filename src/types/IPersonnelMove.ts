import { document } from './document';

export interface IPersonnelMove extends document {
  dniRut: string,
  name: string,
  moveType: string,
  subMove: string,
  receptionDate: string,
  fromDate: string,
  daysNumber: string,
  workingDaysNumberBeforeOfMove: number,
  observation: string,
  originRecord: string,
  state: boolean,
}
