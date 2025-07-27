import { document } from './document';

export interface IClaims extends document {
  source: string,
  detector: string,
  detectionDate: string,
  description: string,
  responsiblePerson: string,
  responsibleSignature: string,
  image1: string,
  image2: string,
  image3: string,
  actionId: string,
  actionDescription: string,
  actionType: string,
  evaluatorResponsible: string,
  evaluatorSignature: string,
  evaluationConcept: string,
  evaluationDate: string,
  observations: string,
  state: boolean
}
