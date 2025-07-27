import { document } from './document';

export interface IFieldWorkApportionment extends document {

  dateExecution: string,
  typeLabor: string,
  orderNumber: string,
  phenologicalState: string,
  totalHectare: number,
  coverage: string,
  generalObjective: string,
  observation: string,
  laborState: string,
  toDownLoadSofiaApp: boolean,
  userSofiaApp: string,

  crop: Array<string>,
  variety: Array<string>,
  classification: Array<string>,
  barracksPaddock: Array<string>,

  temperature: number,
  weatherCondition: string,
  windCondition: string,
  endLackDate: string,
  reEntryDate: string,
  reEntryHour: string,

  laborOrJob: string,
  work: string,
  typeWork: string,
  calibrationHa: number,
  optimalPerformance: number,
  initialBonusWorker: number,

  formPaymentToWorker: string,
  paymentType: string,
  range: number,
  priceLabor: number,
  secondRange: number,
  secondPriceLabor: number,
  thirdRange: number,
  thirdPriceLabor: number,
  fourthRange: number,
  fourthPriceLabor: number,
  fifthRange: number,
  fifthPriceLabor: number,
  state: boolean
}
