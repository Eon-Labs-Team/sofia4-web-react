import { Document} from "mongoose";

export interface IWorkDay extends document {
  description: string,
  workingDay: string,
  totalHours: string,

  hourEntry1: string,
  toleranceMinEntry1: number,
  hourExit1: string,
  toleranceMaxExit1: number,

  hourEntry2: string,
  toleranceMinEntry2: number,
  hourExit2: string,
  toleranceMaxExit2: number,

  startHour: string,
  endHour: string,
  hourToDiscount: string,
  state: boolean
}
