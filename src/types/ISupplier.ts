import { document } from './document';

export interface ISupplier extends document {
  type: string,
  rutDniRuc: string,
  businessActivity: string,
  address: string,
  commune: string,
  city: string,
  country: string,
  suppliersState: boolean,

  contact:string,
  mail:string,
  secondMail:string,
  phone:string,
  secondPhone:string,
  username:string,
  state: boolean
}
