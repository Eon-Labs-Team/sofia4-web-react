import { document } from './document';

export interface IWasteManagement extends document {
  deliveryDate: string,
  wasteOriginField: string,
  wasteOrigin: string,
  wasteType: string,
  quantity: number,
  weight: number,
  wasteHandling: string,
  wasteDestination: string,
  responsiblePerson: string,
  appliedPerson: string,
  recommendedBy: string,
  supervisor: string,
  deliveredTo: string,
  state: boolean
}
