// Datos mockup para ubicaciones geográficas de cuarteles y órdenes de aplicación
export interface MapLocation {
  id: string;
  orderId: string;
  orderNumber: string;
  cuartelName: string;
  coordinates: [number, number]; // [lat, lng]
  workState: 'confirmed' | 'pending' | 'void' | 'blocked';
  species: string;
  variety: string;
  hectares: number;
  generalObjective: string;
  executionDate: string;
}

// Coordenadas centradas en una región agrícola de Chile (ejemplo: Valle Central)
export const mapLocations: MapLocation[] = [
  {
    id: "1",
    orderId: "ord_001",
    orderNumber: "APL-2024-001",
    cuartelName: "Cuartel Norte A",
    coordinates: [-34.1730, -70.7400],
    workState: "confirmed",
    species: "Uva",
    variety: "Cabernet Sauvignon",
    hectares: 15.5,
    generalObjective: "Aplicación de fungicida preventivo",
    executionDate: "2024-01-15"
  },
  {
    id: "2",
    orderId: "ord_002",
    orderNumber: "APL-2024-002",
    cuartelName: "Cuartel Sur B",
    coordinates: [-34.1850, -70.7300],
    workState: "pending",
    species: "Palto",
    variety: "Hass",
    hectares: 8.2,
    generalObjective: "Control de plagas",
    executionDate: "2024-01-18"
  },
  {
    id: "3",
    orderId: "ord_003",
    orderNumber: "APL-2024-003",
    cuartelName: "Cuartel Este C",
    coordinates: [-34.1650, -70.7250],
    workState: "confirmed",
    species: "Cerezo",
    variety: "Bing",
    hectares: 12.0,
    generalObjective: "Fertilización foliar",
    executionDate: "2024-01-20"
  },
  {
    id: "4",
    orderId: "ord_004",
    orderNumber: "APL-2024-004",
    cuartelName: "Cuartel Oeste D",
    coordinates: [-34.1900, -70.7450],
    workState: "blocked",
    species: "Manzano",
    variety: "Gala",
    hectares: 20.3,
    generalObjective: "Aplicación herbicida",
    executionDate: "2024-01-22"
  },
  {
    id: "5",
    orderId: "ord_005",
    orderNumber: "APL-2024-005",
    cuartelName: "Cuartel Central E",
    coordinates: [-34.1780, -70.7350],
    workState: "pending",
    species: "Durazno",
    variety: "O'Henry",
    hectares: 6.8,
    generalObjective: "Tratamiento sanitario",
    executionDate: "2024-01-25"
  },
  {
    id: "6",
    orderId: "ord_006",
    orderNumber: "APL-2024-006",
    cuartelName: "Cuartel Nuevo F",
    coordinates: [-34.1600, -70.7500],
    workState: "void",
    species: "Nogal",
    variety: "Chandler",
    hectares: 18.7,
    generalObjective: "Aplicación de insecticida",
    executionDate: "2024-01-28"
  },
  {
    id: "7",
    orderId: "ord_007",
    orderNumber: "APL-2024-007",
    cuartelName: "Cuartel Viejo G",
    coordinates: [-34.1950, -70.7200],
    workState: "confirmed",
    species: "Olivo",
    variety: "Picual",
    hectares: 25.4,
    generalObjective: "Control malezas",
    executionDate: "2024-02-01"
  },
  {
    id: "8",
    orderId: "ord_008",
    orderNumber: "APL-2024-008",
    cuartelName: "Cuartel Alto H",
    coordinates: [-34.1550, -70.7380],
    workState: "pending",
    species: "Limón",
    variety: "Eureka",
    hectares: 11.2,
    generalObjective: "Nutrición foliar",
    executionDate: "2024-02-05"
  },
  {
    id: "9",
    orderId: "ord_009",
    orderNumber: "APL-2024-009",
    cuartelName: "Cuartel Bajo I",
    coordinates: [-34.2000, -70.7320],
    workState: "confirmed",
    species: "Kiwi",
    variety: "Hayward",
    hectares: 9.6,
    generalObjective: "Aplicación bioestimulante",
    executionDate: "2024-02-08"
  },
  {
    id: "10",
    orderId: "ord_010",
    orderNumber: "APL-2024-010",
    cuartelName: "Cuartel Colina J",
    coordinates: [-34.1700, -70.7180],
    workState: "blocked",
    species: "Arándano",
    variety: "Duke",
    hectares: 14.1,
    generalObjective: "Control de hongos",
    executionDate: "2024-02-12"
  }
];

// Centro del mapa (punto medio de todas las ubicaciones)
export const mapCenter: [number, number] = [-34.1750, -70.7340];

// Configuración del mapa
export const mapConfig = {
  center: mapCenter,
  zoom: 13,
  minZoom: 10,
  maxZoom: 18
};

// Colores para diferentes estados
export const stateColors = {
  confirmed: '#10b981', // green-500
  pending: '#f59e0b',   // amber-500
  blocked: '#ef4444',   // red-500
  void: '#6b7280'       // gray-500
};

// Función para obtener color según estado
export const getMarkerColor = (state: string): string => {
  return stateColors[state as keyof typeof stateColors] || stateColors.pending;
}; 