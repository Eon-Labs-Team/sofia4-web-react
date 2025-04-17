import {Document} from 'mongoose';

export interface IPhytosanitaryProgram extends document {
  startPeriod: string,
  endPeriod: string,
  crop: string,
  variety: string,
  barracksLotObject: string,
  participant: string,
  observation: string,
  state: boolean
}
