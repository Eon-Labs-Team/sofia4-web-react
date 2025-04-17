import { document } from './document';

export interface ICrewList extends document {
  endDate: string,
  groupNumber: number,
  searchBy: string,
  groupBoss: string,
  contractorRut: string,
  state: boolean
}
