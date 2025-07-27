import { document } from './document';

export interface IFacilityCleaningRecord extends document {
  reviewDate: string,
  reviewTime: string,
  facility: string,
  identification: string,
  facilityType: string,
  location: string,
  numberOfPeople: number,
  status: string,
  cleaningMethod: string,
  responsiblePerson: string,
  observations: string,
  image1: string,
  image2: string,
  image3: string,
  state: boolean
}
