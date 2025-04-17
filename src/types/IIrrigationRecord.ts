import { Document } from "mongoose";

export interface IIrrigationRecord extends document {
  classification: string,
  barracks: string,
  dateStart: string,
  dateEnd: string,
  millimeters: number,
  litersForHour: number,
  hours: string,
  caudal: number,
  inletPressure: number,
  outletPressure: number,
  voltageMachinery: number,
  kilowattsForHour:number,
  amperes: number,
  state: boolean
}
