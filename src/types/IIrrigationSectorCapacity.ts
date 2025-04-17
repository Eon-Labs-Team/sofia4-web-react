import { Document } from "mongoose";

export interface IIrrigationSectorCapacity extends document {
  date: string,
  variety: string,
  sector: string,
  centerCost: string,
  ltsByMin: number,
  pressure: number,
  pressureUnit: string,
  inCharge: string,
  createDate: string,
  state:boolean
}
