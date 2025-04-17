import { document } from './document';

export interface IVisitorLog extends document {
  entryDate: string,
  entryTime: string,
  visitorName: string,
  temperature: number,
  origin: string,
  purpose: string,
  comments: string,
  vehiclePlate: string,
  exitDate: string,
  exitTime: string,
  visitorSignature: string,
  state: boolean
}
