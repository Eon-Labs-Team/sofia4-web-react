import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapLocation, mapConfig, getMarkerColor } from '@/lib/mockups/mapMockup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Crop, Target } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  locations: MapLocation[];
  height?: string;
  onMarkerClick?: (location: MapLocation) => void;
}

// Función para crear iconos personalizados según el estado
const createCustomIcon = (state: string) => {
  const color = getMarkerColor(state);
  
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <circle cx="12.5" cy="12.5" r="5" fill="${color}"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

// Función para obtener texto del estado en español
const getStateText = (state: string) => {
  const stateTexts = {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    blocked: 'Bloqueada',
    void: 'Nula'
  };
  return stateTexts[state as keyof typeof stateTexts] || state;
};

// Función para obtener variante del badge según el estado
const getStateBadgeVariant = (state: string) => {
  switch (state) {
    case 'confirmed':
      return 'default'; // Verde
    case 'pending':
      return 'secondary'; // Amarillo/ámbar
    case 'blocked':
      return 'destructive'; // Rojo
    case 'void':
      return 'outline'; // Gris
    default:
      return 'secondary';
  }
};

const MapView: React.FC<MapViewProps> = ({ 
  locations, 
  height = "400px", 
  onMarkerClick 
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Órdenes de Aplicación
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height }}>
          <MapContainer
            center={mapConfig.center}
            zoom={mapConfig.zoom}
            style={{ height: '100%', width: '100%' }}
            minZoom={mapConfig.minZoom}
            maxZoom={mapConfig.maxZoom}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={location.coordinates}
                icon={createCustomIcon(location.workState)}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) {
                      onMarkerClick(location);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[280px] p-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{location.orderNumber}</h3>
                      <Badge variant={getStateBadgeVariant(location.workState)}>
                        {getStateText(location.workState)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.cuartelName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Crop className="h-4 w-4 text-muted-foreground" />
                        <span>{location.species} - {location.variety}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{location.generalObjective}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(location.executionDate).toLocaleDateString('es-CL')}</span>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          <strong>{location.hectares} hectáreas</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Leyenda del mapa */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getMarkerColor('confirmed') }}
              />
              <span className="text-sm">Confirmadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getMarkerColor('pending') }}
              />
              <span className="text-sm">Pendientes</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getMarkerColor('blocked') }}
              />
              <span className="text-sm">Bloqueadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getMarkerColor('void') }}
              />
              <span className="text-sm">Nulas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView; 