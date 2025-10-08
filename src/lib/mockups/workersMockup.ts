import { IWorkerList } from "@eon-lib/eon-mongoose/types";

export const workersMockup: IWorkerList[] = [
  // @ts-ignore
  {
    // Document base properties
    _id: "worker_001",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),

    // Personal Information
    workerNationality: "Chilena",
    rutDniNationality: "CL",
    identificationDocumentType: "RUT",
    rut: "12.345.678-9",
    internalCod: "EMP001",
    names: "Juan Carlos",
    lastName: "González",
    secondLastName: "Pérez",
    birthDate: "1985-03-15",
    sex: "Masculino",
    civilState: "Casado",
    address: "Av. Principal 123",
    city: "Santiago",
    region: "Metropolitana",
    country: "Chile",
    phone: "+56912345678",
    email: "juan.gonzalez@empresa.cl",
    recordType: "Permanente",
    workerListId: "WL001",
    property: "Predio Central",

    // Certifications
    administrative: false,
    dispenser: true,
    dispenserResponsible: true,
    dispenserChecker: "Certificado",
    certificationNumber: "CERT001",
    applicator: "Autorizado",
    applicatorResponsible: true,
    applicatorChecker: true,
    institution: "Instituto Agrícola Nacional",
    expirationDate: "2025-03-15",

    // Contract Information
    classify: "Operario Especializado",
    contractType: "Indefinido",
    contractDocument: "CONT001.pdf",
    contractAnnexed: "ANEXO001.pdf",
    baseSalary: 450000,
    calculationType: "Mensual",
    startDate: "2024-01-15",
    endDate: "",
    contractFunction: "Operador de Maquinaria",
    workerListState: "Activo",
    stateCDate: "2024-01-15",
    stateCUser: "admin",
    observation: "Trabajador con experiencia en maquinaria pesada",

    // Attendance Control
    controlClockAttendance: "Sí",
    assignsAttendanceClassify: "Diario",
    operativeAreaAttendance: "Campo",
    laborWorkAttendance: "Operaciones",
    hitchContractorDepend: "Empresa",
    laborUpdate: false,
    laborUpdateDateSince: "",
    laborUpdateDateTill: "",

    // Payment
    rankDay: "Día completo",
    priceDayExtraHour: "15000",

    // Benefits
    youngWorkerBonus: false,
    provisionalRegime: true,
    workType: "Tiempo completo",

    // Social Security
    provision: "AFP Habitat",
    quote: "10%",
    savingVoluntary: "2%",
    sis: "1.5%",
    sn: "0.5%",
    valueQuote: "45000",
    valueVolumeSaving: 9000,
    valueSis: 6750,
    valueSn: 2250,

    // Health Insurance
    socialSecurity: "Fonasa",
    health: "Plan B",
    additional: "No",
    firstValue: "32000",
    secondValue: "0",
    ccaf: "La Araucana",
    funNumberOptional: "",
    funNumber: "12345678",
    valueHealth: 32000,
    valueAdditional: 0,
    thirdValue: "0",
    fourthValue: "0",

    // Banking Information
    paymentType: "Transferencia",
    bank: "Banco de Chile",
    workerEmail: "juan.gonzalez@personal.cl",
    accountNumber: 1234567890,
    accountType: "Cuenta Corriente",

    // Insurance - Particular
    particularInstitution: "Seguros Mapfre",
    particularContractNumber: "POL001",
    particularPaymentMethod: "Descuento directo",
    savingTo: "Cuenta personal",
    quoteAmount: 15000,

    // Insurance - Collective
    collectiveInstitution: "Mutual de Seguridad",
    collectiveContractNumber: "COL001",
    collectivePaymentMethod: "Empresa",
    savingWorker: "5%",
    workerAmount: "22500",
    inputCompany: "95%",
    amountInputCompany: 427500,
    state: true,
  },
  // @ts-ignore
  {
    // Document base properties
    _id: "worker_002",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),

    // Personal Information
    workerNationality: "Chilena",
    rutDniNationality: "CL",
    identificationDocumentType: "RUT",
    rut: "15.678.234-5",
    internalCod: "EMP002",
    names: "María Elena",
    lastName: "Rodríguez",
    secondLastName: "Silva",
    birthDate: "1990-07-22",
    sex: "Femenino",
    civilState: "Soltera",
    address: "Calle Los Aromos 456",
    city: "Rancagua",
    region: "O'Higgins",
    country: "Chile",
    phone: "+56987654321",
    email: "maria.rodriguez@empresa.cl",
    recordType: "Temporal",
    workerListId: "WL002",
    property: "Predio Norte",

    // Certifications
    administrative: true,
    dispenser: false,
    dispenserResponsible: false,
    dispenserChecker: "No aplica",
    certificationNumber: "",
    applicator: "No autorizado",
    applicatorResponsible: false,
    applicatorChecker: false,
    institution: "",
    expirationDate: "",

    // Contract Information
    classify: "Administrativo",
    contractType: "Plazo Fijo",
    contractDocument: "CONT002.pdf",
    contractAnnexed: "",
    baseSalary: 380000,
    calculationType: "Mensual",
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    contractFunction: "Asistente Administrativo",
    workerListState: "Activo",
    stateCDate: "2024-02-01",
    stateCUser: "admin",
    observation: "Encargada de documentación y archivos",

    // Attendance Control
    controlClockAttendance: "Sí",
    assignsAttendanceClassify: "Diario",
    operativeAreaAttendance: "Oficina",
    laborWorkAttendance: "Administración",
    hitchContractorDepend: "Empresa",
    laborUpdate: false,
    laborUpdateDateSince: "",
    laborUpdateDateTill: "",

    // Payment
    rankDay: "Día completo",
    priceDayExtraHour: "12000",

    // Benefits
    youngWorkerBonus: true,
    provisionalRegime: true,
    workType: "Tiempo completo",

    // Social Security
    provision: "AFP Capital",
    quote: "10%",
    savingVoluntary: "0%",
    sis: "1.5%",
    sn: "0.5%",
    valueQuote: "38000",
    valueVolumeSaving: 0,
    valueSis: 5700,
    valueSn: 1900,

    // Health Insurance
    socialSecurity: "Isapre",
    health: "Banmedica",
    additional: "Sí",
    firstValue: "45000",
    secondValue: "15000",
    ccaf: "Mutual",
    funNumberOptional: "OPT456",
    funNumber: "87654321",
    valueHealth: 45000,
    valueAdditional: 15000,
    thirdValue: "5000",
    fourthValue: "0",

    // Banking Information
    paymentType: "Transferencia",
    bank: "Banco Santander",
    workerEmail: "maria.rodriguez@personal.cl",
    accountNumber: 9876543210,
    accountType: "Cuenta Vista",

    // Insurance - Particular
    particularInstitution: "",
    particularContractNumber: "",
    particularPaymentMethod: "",
    savingTo: "",
    quoteAmount: 0,

    // Insurance - Collective
    collectiveInstitution: "Mutual de Seguridad",
    collectiveContractNumber: "COL002",
    collectivePaymentMethod: "Empresa",
    savingWorker: "3%",
    workerAmount: "11400",
    inputCompany: "97%",
    amountInputCompany: 368600,
    state: true,
  },
  // @ts-ignore
  {
    // Document base properties
    _id: "worker_003",
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),

    // Personal Information
    workerNationality: "Peruana",
    rutDniNationality: "PE",
    identificationDocumentType: "Cédula",
    rut: "87.654.321-2",
    internalCod: "EMP003",
    names: "Carlos Alberto",
    lastName: "Mendoza",
    secondLastName: "Torres",
    birthDate: "1982-11-08",
    sex: "Masculino",
    civilState: "Divorciado",
    address: "Pasaje Los Pinos 789",
    city: "Talca",
    region: "Maule",
    country: "Chile",
    phone: "+56923456789",
    email: "carlos.mendoza@empresa.cl",
    recordType: "Permanente",
    workerListId: "WL003",
    property: "Predio Sur",

    // Certifications
    administrative: false,
    dispenser: true,
    dispenserResponsible: false,
    dispenserChecker: "En proceso",
    certificationNumber: "CERT003",
    applicator: "Autorizado",
    applicatorResponsible: false,
    applicatorChecker: true,
    institution: "Centro de Capacitación Agrícola",
    expirationDate: "2024-11-08",

    // Contract Information
    classify: "Operario",
    contractType: "Indefinido",
    contractDocument: "CONT003.pdf",
    contractAnnexed: "ANEXO003.pdf",
    baseSalary: 420000,
    calculationType: "Mensual",
    startDate: "2024-01-10",
    endDate: "",
    contractFunction: "Aplicador de Pesticidas",
    workerListState: "Activo",
    stateCDate: "2024-01-10",
    stateCUser: "supervisor",
    observation: "Especialista en manejo de químicos agrícolas",

    // Attendance Control
    controlClockAttendance: "Sí",
    assignsAttendanceClassify: "Diario",
    operativeAreaAttendance: "Campo",
    laborWorkAttendance: "Aplicaciones",
    hitchContractorDepend: "Empresa",
    laborUpdate: true,
    laborUpdateDateSince: "2024-01-10",
    laborUpdateDateTill: "2024-12-31",

    // Payment
    rankDay: "Día completo",
    priceDayExtraHour: "14000",

    // Benefits
    youngWorkerBonus: false,
    provisionalRegime: true,
    workType: "Tiempo completo",

    // Social Security
    provision: "AFP Provida",
    quote: "10%",
    savingVoluntary: "1%",
    sis: "1.5%",
    sn: "0.5%",
    valueQuote: "42000",
    valueVolumeSaving: 4200,
    valueSis: 6300,
    valueSn: 2100,

    // Health Insurance
    socialSecurity: "Fonasa",
    health: "Plan A",
    additional: "No",
    firstValue: "28000",
    secondValue: "0",
    ccaf: "Mutual",
    funNumberOptional: "",
    funNumber: "11223344",
    valueHealth: 28000,
    valueAdditional: 0,
    thirdValue: "0",
    fourthValue: "0",

    // Banking Information
    paymentType: "Transferencia",
    bank: "Banco Estado",
    workerEmail: "carlos.mendoza@personal.cl",
    accountNumber: 5555666677,
    accountType: "Cuenta RUT",

    // Insurance - Particular
    particularInstitution: "Seguros Vida",
    particularContractNumber: "VID003",
    particularPaymentMethod: "Descuento directo",
    savingTo: "Cuenta ahorro",
    quoteAmount: 12000,

    // Insurance - Collective
    collectiveInstitution: "Mutual de Seguridad",
    collectiveContractNumber: "COL003",
    collectivePaymentMethod: "Empresa",
    savingWorker: "4%",
    workerAmount: "16800",
    inputCompany: "96%",
    amountInputCompany: 403200,
    state: true,
  }
];

export default workersMockup; 