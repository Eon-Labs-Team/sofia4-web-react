import { document } from './document';

export interface ILaborType extends document {
  id: string,
  orderNumber: string,
  creationDate: string,
  classification: string,
  barracks: string,
  species: string,
  totalHectares: string,
  totalHectaresApplied: string,
  coverage: string,
  jobStartDate: string,
  jobCompletionDate: string,
  jobStatus: string,
  targetState: string | null,
  observations: string,
  chore: string,
  laborType: string,
  products: ProductsType,
  responsible: ResponsibleType,
  documents: string,
  state: boolean
}

interface ProductsType {
  product: ProductType,
  unitOfMeasurement: string,
  quantityPerHectare: string,
  amount: string,
  machinery: MachineryType,
  totalValue: string
}

interface ProductType {
  id: string,
}

interface MachineryType {
  id: string,
}

interface ResponsibleType {
  responsible: string,
  administrative: string,
  technicalVerifier: string,
}
