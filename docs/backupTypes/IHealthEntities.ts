import { document } from './document';

export interface IHealthEntities extends Document{
  idOrder: number,
  healthEntity: string,
  optionalCode?: string,
  percentValueHeath: string,
  health: number,
  percentValueAdditional: string,
  additional: number,
  percentValueOne: string,
  one: number,
  percentValueTwo: string,
  two: number,
  isActive: boolean,
  rutDniEntity: string,
  state:boolean
  }
  