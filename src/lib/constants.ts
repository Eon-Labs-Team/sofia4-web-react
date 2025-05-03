// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API endpoints
export const ENDPOINTS = {
  productCategory: {
    base: `${API_BASE_URL}/wareHouse/productCategory`,
    byId: (id: string | number) => `${API_BASE_URL}/wareHouse/productCategory/${id}`,
    byEnterpriseId: `${API_BASE_URL}/wareHouse/productCategory/byEnterpriseId`,
    fullDelete: (id: string | number) => `${API_BASE_URL}/wareHouse/productCategory/fullDelete/${id}`,
  },
  workers: {
    base: `${API_BASE_URL}/harvest/workers`,
    byId: (id: string | number) => `${API_BASE_URL}/harvest/workers/${id}`,
  },
  cuarteles: {
    base: `${API_BASE_URL}/harvest/barracks`,
    byId: (id: string | number) => `${API_BASE_URL}/harvest/barracks/${id}`,
  },
  listaCuarteles: {
    base: `${API_BASE_URL}/agriculturalWork/barracksList`,
    byId: (id: string | number) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}/state/${state}`,
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
  fieldWorkApportionment: {
    base: `${API_BASE_URL}/agriculturalWork/fieldWorkApportionment`,
    byId: (id: string | number) => `${API_BASE_URL}/agriculturalWork/fieldWorkApportionment/${id}`,
    changeState: (id: string | number) => `${API_BASE_URL}/agriculturalWork/fieldWorkApportionment/${id}/state/false`,
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
}; 