import { document } from './document';

//Registro de trabajos realizados.

export interface IWorkers extends document {
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
  state: boolean
}

interface WorkerType {
  id: string,
}
