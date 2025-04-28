// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API endpoints
export const ENDPOINTS = {
  cuarteles: {
    base: `${API_BASE_URL}/harvest/barracks`,
    byId: (id: string | number) => `${API_BASE_URL}/harvest/barracks/${id}`,
  },
  listaCuarteles: {
    base: `${API_BASE_URL}/agriculturalWork/barracksList`,
    byId: (id: string | number) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}`,
    changeState: (id: string | number, state: boolean) => `${API_BASE_URL}/agriculturalWork/barracksList/${id}/state/${state}`,
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
  }
}; 