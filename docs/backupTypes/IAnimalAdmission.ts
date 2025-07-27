import { document } from './document';

export interface IAnimalAdmission extends document {
  date: string,
  quarterLot: string,
  code: string,
  area: string,
  reviser: string,
  supervisor: string,
  observation: string,
  supervisorSing: string,
  image1: string,
  image2: string,
  image3: string,
  state: boolean
}
