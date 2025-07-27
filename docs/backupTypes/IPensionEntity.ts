import { document } from './document';

export interface IPensionEntity extends Document{
  idOrder: number,
  pensionEntity: string,
  type: string,
  optionalCode?: string,
  percentValueRetirementContribution: string,
  retirementContribution: number,
  percentValueVoluntarySaving: string,
  voluntarySaving: number,
  percentValueSis: string,
  sis: number,
  percentValueSn: string,
  sn: number,
  isActive: boolean,
  state:boolean
  }
