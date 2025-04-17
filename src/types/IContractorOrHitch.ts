import { document } from './document';

export interface IContractorOrHitch extends document {
  dniRutCod: string,
  companyName: string,
  contractName: string,
  commercialLine: string,
  address: string,
  commune: string,
  city: string,
  vehicleLicensePlate: string,
  entryDate: string,

  contact: string,
  email: string,
  secondEmail: string,
  phone: string,
  secondPhone: string,
  contactState: string,

  state: boolean,
}
