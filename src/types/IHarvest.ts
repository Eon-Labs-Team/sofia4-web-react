import { document } from './document';

export interface IHarvest extends document {
  id: string,
  orderNumber: string,
  executionDate: string,
  barracks: string,
  species: string,
  variety: string,
  phenologicalState: string,
  hectares: number,
  generalObjective: string,
  observation: string,
  choreState: string,
  syncApp: boolean,
  appUser: string,
  rowNumber: RowNumberType,
  choreOrWork: string,
  laborType: LaborType,
  quadrille: boolean,
  paymentMethod: string,
  paymentType: string,
  price: number,
  state: boolean,
  range: Array<RangeType>,
  category: CategoryType,
  workers: Array<WorkersType>,
  machinery: Array<ArrayMachineryType>,
  cellar: Array<CellarType>,
}

interface RowNumberType {
  id: string,
}

interface LaborType {
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

interface RangeType {
  value: string,
}

interface CategoryType {
  export: string,
  category: string,
}

interface WorkersType {
  classification: string,
  worker: WorkerType,
  quadrille: string,
  workingDay: string,
  paymentMethod: string,
  totalHectares: string
  overtime: string,
  bond: string,
  dayValue: string,
  totalDeal: string,
  bonuses: string,
  exportPerformance: string,
  juicePerformance: string,
  othersPerformance: string,
  dailyTotal: string,
  value: string,
  salary: string,
  date: string,
  contractor: string,
}

interface WorkerType {
  id: string,
}

interface ArrayMachineryType {
  classification: string,
  machinery: MachineryType,
  startTime: string,
  endTime: string,
  finalHours: string,
  timeValue: string,
  totalValue: string,
}

interface CellarType {
  category: string,
  product: string,
  unitOfMeasurement: string,
  amountPerHour: string,
  amount: string,
  netUnitValue: string,
  totalValue: string,
  return: string,
  machineryRelationship: MachineryRelationshipType,
  packagingCode: string,
  invoiceNumber: string,
}

interface MachineryRelationshipType {
  id: string,
}
