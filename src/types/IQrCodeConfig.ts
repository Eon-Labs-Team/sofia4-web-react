import { Document } from  'mongoose';

export interface IQrCodeConfig extends document {

  description: string,
  codeType: string,
  sizeCode: number,
  sheetWidth: number,
  sheetLong: number,
  sheetOrientation: string,
  topMargin: number,
  downMargin: number,
  numberRowsCodePerPage: number,
  numberCodeColumnsWithCode: number,
  horizontalDistanceBetweenCode: number,
  verticalDistanceBetweenCode: number,
  letterSize: number,
  distanceCodeAndText: number,

  generatesCorrelative: boolean,
  startNumberCorrelative: number,
  copyNumber: number,
  text: string,

  textLocation: string,
  distanceBetweenTextAndCode: number,
  text1: string,
  text2: string,
  text3: string,
  text4: string,
  text5: string,
  distanceBetweenText: number,
  sizeLetter: number,
  state: boolean,
  }
