import { document } from './document';

export interface IPersonnelProvision extends document {
  deliveryDate: string,
  dniRut: string,
  workerName: string,
  category: string,
  product: string,
  quantity: number,
  observation: string,
  user: string,
  state: boolean
}
