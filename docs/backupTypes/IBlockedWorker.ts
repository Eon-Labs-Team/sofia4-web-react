import { document } from './document';

/**
 * Interface representing a Blocked Worker record.
 */
export interface IBlockedWorker extends document {
  // Personal Information
  workerNationality?: string;
  rutDniNationality?: string;
  identificationDocType?: string;
  rut?: string;
  internalCod?: string;
  names?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string | Date; // YYYY-MM-DD or Date
  sex?: string;
  civilState?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  phone?: string;
  email?: string;
  recordType?: string;
  identificationId?: string;
  property?: string;

  // Function/Certification
  functionData?: string[]; // Assuming array of strings
  certificationNumber?: string;
  bpaInstitution?: string;
  expirationDate?: string | Date; // YYYY-MM-DD or Date

  // Contract
  classify?: string[]; // Assuming array of strings
  contractType?: string;
  contractDocument?: string;
  contractAnnexed?: string;
  baseSalary?: string; // Consider number if appropriate
  calculationType?: string;
  startDate?: string | Date; // YYYY-MM-DD or Date
  endDate?: string | Date; // YYYY-MM-DD or Date
  contractFunction?: string;
  laborInformationState?: string;
  stateCDate?: string | Date; // YYYY-MM-DD or Date
  stateCUser?: string;
  observation?: string;

  // Attendance
  attendanceClockControl?: string;
  assignAttendanceClass?: string;
  attendanceOperativeArea?: string;
  attendanceLaborWork?: string;
  dependOnContractorOrHitch?: string;
  updateLabor?: boolean;

  // Day Rank / Overtime
  dayRank?: string;
  dailyValueOvertime?: string; // Consider number if appropriate

  // Worker Type / Bonus
  youngWorkerBonus?: boolean;
  provisionalRegime?: boolean;
  workerType?: string;

  // Forecast / SIS / SN
  forecast?: boolean;
  quote?: string;
  voluntarySaving?: string;
  sis?: string;
  sN?: string;
  valueQuote?: number;
  valueVoluntarySaving?: number;
  valueSis?: number;
  valueSN?: number;

  // Social Security / Health
  socialSecurity?: string;
  health?: string;
  additional?: string;
  firstValue?: string;
  secondValue?: string;
  ccaf?: string;
  funNumber?: string;
  valueHealth?: number;
  valueAdditional?: number;
  thirdValue?: string;
  fourthValue?: string;

  // Payment
  paymentWith?: string;
  bank?: string;
  workerEmail?: string;
  accountNumber?: string;
  accountType?: string;

  // Particular Savings
  particularInstitution?: string;
  particularContractNumber?: string;
  particularPaymentMethod?: string;
  savingTo?: string;
  quoteAmount?: number;

  // Collective Savings
  collectiveInstitution?: string;
  collectiveContractNumber?: string;
  collectivePaymentMethod?: string;
  workerSavingTo?: string;
  workerAmount?: number;
  companyContribution?: string;
  companyAmount?: number;

  // Images
  firstImageDniUrl?: string;
  secondImageDniUrl?: string;

  // State
  state: boolean;
}
