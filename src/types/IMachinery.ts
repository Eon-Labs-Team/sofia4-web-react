import { document } from './document';

export interface IMachinery extends document {
  equipment: string,
  classifyZone: string,
  machineryCode: string,
  oldMachineryCode: string,
  licensePlate: string,
  machineType: string,
  brand: string,
  machineryModel: string,
  madeYear: string,
  priceHour: string,
  onCharge: string,
  machineryState: boolean,
  objective: string,

  litersCapacity: number,
  improvementLiterHa: number,
  pressureBar: number,
  revolution: string,
  change: string,
  kmByHour: number,

  cleaningRecord: boolean,
  temperature: boolean,
  maintenanceRecord: boolean,
  temperatureEquipment: boolean,

  classifyCost: string,
  subClassifyCost: string,

  invoicePurchaseGuide: string,
  purchaseDate: string,
  supplier: string,
  observation: string,

  gpsCode: string,
  gpsSupplier: string,

  propertyLoans: Array<string>,
  loansDate: string,
  loansObservation: string,
  image: string,
  state: boolean
}
