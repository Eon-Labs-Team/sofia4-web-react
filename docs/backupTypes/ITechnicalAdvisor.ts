import { document } from './document';

export interface ITechnicalAdvisor extends document {
  nationalityAdvisor: string,
  nationalityRutDni: string,
  rutDniRuc: string,
  advisorName: string,
  enterpriseName: string,
  profession: string,
  advisorType: string,
  phone: string,
  mail: string,
  image: string,
  state: boolean
}
