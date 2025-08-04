// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4900';
export const API_BASE_SOFIA = import.meta.env.VITE_API_CRUD_URL || 'http://localhost:4500'
// API endpoints
export const ENDPOINTS = {
  productCategory: {
    base: `${API_BASE_URL}/wareHouse/productCategory`,
    byId: (id: string | number) => `${API_BASE_URL}/wareHouse/productCategory/${id}`,
    byEnterpriseId: `${API_BASE_URL}/wareHouse/productCategory/byEnterpriseId`,
    fullDelete: (id: string | number) => `${API_BASE_URL}/wareHouse/productCategory/fullDelete/${id}`,
  },
  subcategoryProduct: {
    base: `${API_BASE_URL}/wareHouse/subcategoryProduct`,
    byId: (id: string | number) => `${API_BASE_URL}/wareHouse/subcategoryProduct/${id}`,
    setState: (id: string | number, state: boolean) => `${API_BASE_URL}/wareHouse/subcategoryProduct/${id}/state/${state}`,
  },
  workers: {
    base: `${API_BASE_URL}/work/workers`,
    byId: (id: string | number) => `${API_BASE_URL}/work/workers/${id}`,
  },
  machinery: {
    base: `${API_BASE_URL}/work/machinery`,
    byId: (id: string | number) => `${API_BASE_URL}/work/machinery/${id}`,
  },
  listaCuarteles: {
    base: `${API_BASE_URL}/config/operationalArea`,
    getProductive: `${API_BASE_URL}/config/operationalArea/productive/all`,
    byId: (id: string | number) => `${API_BASE_URL}/config/operationalArea/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/operationalArea/${id}/state/${state}`,
  },
  listaMaquinarias: {
    base: `${API_BASE_URL}/config/machineryList`,
    byId: (id: string | number) => `${API_BASE_URL}/config/machineryList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/machineryList/${id}/state/${state}`,
  },
  measurementUnits: {
    base: `${API_BASE_URL}/config/measurementUnits`,
    byId: (id: string | number) => `${API_BASE_URL}/config/measurementUnits/${id}`,
    setState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/measurementUnits/${id}/state/${state}`,
  },
  facilityCleaning: {
    base: `${API_BASE_URL}/controlRecord/facilityCleaningRecord`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/facilityCleaningRecord/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/facilityCleaningRecord/${id}/state/false`,
  },
  chlorination: {
    base: `${API_BASE_URL}/controlRecord/chlorination`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/chlorination/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/chlorination/${id}/state/false`,
  },
  chlorineRegistration: {
    base: `${API_BASE_URL}/controlRecord/chlorineRegistration`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/chlorineRegistration/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/chlorineRegistration/${id}/state/false`,
  },
  personnelProvision: {
    base: `${API_BASE_URL}/controlRecord/personnelProvision`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/personnelProvision/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/personnelProvision/${id}/state/false`,
  },
  crewList: {
    base: `${API_BASE_URL}/agriculturalWork/crewList`,
    byId: (id: string | number) => `${API_BASE_URL}/agriculturalWork/crewList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/agriculturalWork/crewList/${id}/state/${state}`,
  },
  workerList: {
    base: `${API_BASE_URL}/rrhh/workerList`,
    byId: (id: string | number) => `${API_BASE_URL}/rrhh/workerList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/rrhh/workerList/${id}/state/${state}`,
  },
  monitoringOfPhenologicalState: {
    base: `${API_BASE_URL}/fieldRecord/monitoringOfPhenologicalState`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/monitoringOfPhenologicalState/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/monitoringOfPhenologicalState/${id}/state/false`,
  },
  animalAdmission: {
    base: `${API_BASE_URL}/fieldRecord/animalAdmission`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/animalAdmission/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/animalAdmission/${id}/state/false`,
  },
  weedMonitoring: {
    base: `${API_BASE_URL}/fieldRecord/weedMonitoring`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/weedMonitoring/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/weedMonitoring/${id}/state/false`,
  },
  soilAnalysis: {
    base: `${API_BASE_URL}/fieldRecord/soilAnalysis`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/soilAnalysis/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/soilAnalysis/${id}/state/false`,
  },
  soilFertilization: {
    base: `${API_BASE_URL}/fieldRecord/soilFertilization`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/soilFertilization/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/soilFertilization/${id}/state/false`,
  },
  irrigationRecord: {
    base: `${API_BASE_URL}/fieldRecord/irrigationRecord`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/irrigationRecord/${id}`,
    setState: (id: string | number, state: boolean) => `${API_BASE_URL}/fieldRecord/irrigationRecord/${id}/state/${state}`,
  },
  leafAnalysis: {
    base: `${API_BASE_URL}/fieldRecord/leafAnalysisRecord`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/leafAnalysisRecord/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/leafAnalysisRecord/${id}/state/false`,
  },
  weatherEvent: {
    base: `${API_BASE_URL}/fieldRecord/weatherEvent`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/weatherEvent/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/weatherEvent/${id}/state/false`,
  },
  machineryCleaning: {
    base: `${API_BASE_URL}/fieldRecord/machineryCleaning`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/machineryCleaning/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/machineryCleaning/${id}/state/false`,
  },
  massBalance: {
    base: `${API_BASE_URL}/fieldRecord/massBalance`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/massBalance/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/massBalance/${id}/state/false`,
  },
  waterAnalysis: {
    base: `${API_BASE_URL}/fieldRecord/waterAnalysis`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/waterAnalysis/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/waterAnalysis/${id}/state/false`,
  },
  calibrateSprinkler: {
    base: `${API_BASE_URL}/fieldRecord/calibrateSprinkler`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/calibrateSprinkler/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/calibrateSprinkler/${id}/state/false`,
  },
  technicalIrrigationMaintenance: {
    base: `${API_BASE_URL}/fieldRecord/technicalIrrigationMaintenance`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/technicalIrrigationMaintenance/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/technicalIrrigationMaintenance/${id}/state/false`,
  },
  irrigationSectorCapacity: {
    base: `${API_BASE_URL}/fieldRecord/irrigationSectorCapacity`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/irrigationSectorCapacity/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/irrigationSectorCapacity/${id}/state/false`,
  },
  wasteRemoval: {
    base: `${API_BASE_URL}/fieldRecord/WasteRemoval`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/WasteRemoval/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/WasteRemoval/${id}/state/false`,
  },
  wasteManagement: {
    base: `${API_BASE_URL}/controlRecord/wasteManagement`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/wasteManagement/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/wasteManagement/${id}/state/false`,
  },
  equipmentCalibration: {
    base: `${API_BASE_URL}/controlRecord/equipmentCalibration`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/equipmentCalibration/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/equipmentCalibration/${id}/state/false`,
  },
  visitorLog: {
    base: `${API_BASE_URL}/controlRecord/visitorLog`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/visitorLog/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/visitorLog/${id}/state/false`,
  },
  calibrationMeasuringEquipment: {
    base: `${API_BASE_URL}/fieldRecord/calibrationMeasuringEquipment`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/calibrationMeasuringEquipment/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/calibrationMeasuringEquipment/${id}/state/false`,
  },
  backPumpCalculation: {
    base: `${API_BASE_URL}/fieldRecord/backPumpCalculation`,
    byId: (id: string | number) => `${API_BASE_URL}/fieldRecord/backPumpCalculation/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/fieldRecord/backPumpCalculation/${id}/state/false`,
  },
  trainingTalks: {
    base: `${API_BASE_URL}/controlRecord/trainingTalks`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/trainingTalks/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/trainingTalks/${id}/state/false`,
  },
  handWashing: {
    base: `${API_BASE_URL}/controlRecord/handWashingRecord`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/handWashingRecord/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/handWashingRecord/${id}/state/false`,
  },
  electricityConsumption: {
    base: `${API_BASE_URL}/controlRecord/electricityConsumption`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/electricityConsumption/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/electricityConsumption/${id}/state/false`,
  },
  waterConsumption: {
    base: `${API_BASE_URL}/controlRecord/waterConsumption`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/waterConsumption/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/waterConsumption/${id}/state/false`,
  },
  hygieneSanitation: {
    base: `${API_BASE_URL}/controlRecord/hygieneSanitation`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/hygieneSanitation/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/hygieneSanitation/${id}/state/false`,
  },
  calicata: {
    base: `${API_BASE_URL}/controlRecord/calicata`,
    byId: (id: string | number) => `${API_BASE_URL}/controlRecord/calicata/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/controlRecord/calicata/${id}/state/false`,
  },
  cropType: {
    base: `${API_BASE_URL}/config/cropType`,
    byId: (id: string | number) => `${API_BASE_URL}/config/cropType/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/cropType/${id}/state/${state}`,
  },
  varietyType: {
    base: `${API_BASE_URL}/config/varietyType`,
    byId: (id: string | number) => `${API_BASE_URL}/config/varietyType/${id}`,
    setState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/varietyType/${id}/state/${state}`,
  },
  soilType: {
    base: `${API_BASE_URL}/config/soilType`,
    byId: (id: string | number) => `${API_BASE_URL}/config/soilType/${id}`,
    setState: (id: string | number, state: boolean) => `${API_BASE_URL}/config/soilType/${id}/state/${state}`,
  },
  work: {
    base: `${API_BASE_URL}/work/work`,
    byId: (id: string | number) => `${API_BASE_URL}/work/work/${id}`,
    changeState: (id: string | number, state: string) => `${API_BASE_URL}/work/work/${id}/state/${state}`,
  },
  properties: {
    base: `${API_BASE_URL}/property`,
    byId: (id: string | number) => `${API_BASE_URL}/property/${id}`,
    byName: (name: string) => `${API_BASE_URL}/property/byName/${name}`,
  },
  faenas: {
    base: `${API_BASE_URL}/task/taskType`,
    byId: (id: string | number) => `${API_BASE_URL}/task/taskType/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/task/taskType/${id}/state/${state}`,
  },
  labores: {
    base: `${API_BASE_URL}/task/task`,
    byId: (id: string | number) => `${API_BASE_URL}/task/task/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/task/task/${id}/state/${state}`,
  },
  products: {
    base: `${API_BASE_URL}/products/products`,
    byId: (id: string | number) => `${API_BASE_URL}/products/products/${id}`,
  },
  warehouse: {
    base: `${API_BASE_SOFIA}/warehouse`,
    byId: (id: string | number) => `${API_BASE_SOFIA}/warehouse/${id}`,
    byName: (name: string) => `${API_BASE_SOFIA}/warehouse/byName/${name}`,
    findAll: `${API_BASE_SOFIA}/warehouse/findAll`,
  },
  warehouseProducts: {
    base: `${API_BASE_SOFIA}/product`,
    byId: (id: string | number) => `${API_BASE_SOFIA}/product/${id}`,
    byName: (name: string) => `${API_BASE_SOFIA}/product/byName/${name}`,
    findAll: `${API_BASE_SOFIA}/product/`,
  },
  warehouseLots: {
    base: `${API_BASE_SOFIA}/lot`,
    byId: (id: string | number) => `${API_BASE_SOFIA}/lot/${id}`,
    byName: (name: string) => `${API_BASE_SOFIA}/lot/byName/${name}`,
    findAll: `${API_BASE_SOFIA}/lot/findAll`,
  },
  inventoryMovement: {
    base: `${API_BASE_SOFIA}/inventoryMovement`,
    byId: (id: string | number) => `${API_BASE_SOFIA}/inventoryMovement/${id}`,
    byName: (name: string) => `${API_BASE_SOFIA}/inventoryMovement/byName/${name}`,
    findAll: `${API_BASE_SOFIA}/inventoryMovement/findAll`,
  },
}; 

// UI/UX Design Constants
export const DESIGN_TOKENS = {
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
  },
  
  // Typography
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Colors (siguiendo el tema de la aplicación)
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fecaca',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

// Layout Constants for OrdenAplicacion
export const LAYOUT_CONSTANTS = {
  container: {
    maxWidth: '100%',
    padding: DESIGN_TOKENS.spacing.lg,
    gap: DESIGN_TOKENS.spacing.lg,
  },
  
  header: {
    minHeight: '4rem',
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  
  indicators: {
    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  
  gantt: {
    minHeight: '24rem', // 384px
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  
  bottomSection: {
    gridCols: 'grid-cols-1 lg:grid-cols-2',
    gap: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  
  map: {
    minHeight: '20rem', // 320px
  },
  
  grid: {
    minHeight: '24rem', // 384px
  },
} as const; 