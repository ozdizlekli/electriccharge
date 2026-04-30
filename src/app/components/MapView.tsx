import React, { useState, useEffect } from 'react';
import { Locate, Zap } from 'lucide-react';
import { Station } from '../types/station';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapViewProps {
  stations: Station[];
  selectedStation: string | null;
  onStationSelect: (stationId: string) => void;
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ stations, selectedStation, onStationSelect }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const defaultCenter: [number, number] = [38.4237, 27.1428]; 
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
        },
        { enableHighAccuracy: false, maximumAge: 10000, timeout: 15000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleLocate = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(16);
      toast.success('Konumunuza odaklandı');
    } else {
      toast.error('Henüz konumunuz bulunamadı.');
    }
  };

  const createCustomIcon = (availablePoints: number, isSelected: boolean) => {
    const bgColor = availablePoints > 0 ? 'bg-green-500' : 'bg-red-500';
    const scaleClass = isSelected ? 'scale-125' : 'scale-100';
    const htmlString = `
      <div class="relative transition-transform duration-300 ${scaleClass}">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white ${bgColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        ${!isSelected ? `<div class="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-xs font-semibold text-black">${availablePoints}</div>` : ''}
      </div>
    `;
    return L.divIcon({ html: htmlString, className: 'custom-leaflet-icon', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
  };

  const userIcon = L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8"><div class="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div><div class="absolute w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div></div>`,
    className: 'user-location-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl={true}>
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {stations.map((station) => {
          const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;
          const isSelected = selectedStation === station.id;
          const stationLatLng: [number, number] = [station.location.lat, station.location.lng];

          return (
            <Marker 
              key={station.id} 
              position={stationLatLng}
              icon={createCustomIcon(availablePoints, isSelected)}
              eventHandlers={{
                click: () => {
                  onStationSelect(station.id);
                  setMapCenter(stationLatLng); 
                }
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong className="block mb-1">{station.name}</strong>
                  <span className="text-sm">{availablePoints} / {station.chargingPoints.length} müsait</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && <Marker position={userLocation} icon={userIcon} />}
      </MapContainer>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
        <Button size="icon" variant="secondary" className="shadow-lg bg-white hover:bg-gray-100" onClick={handleLocate}>
          <Locate className="w-4 h-4" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[400]">
        <div className="text-xs font-semibold mb-2">Durum</div>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Müsait</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Dolu</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>Konumunuz</span></div>
        </div>
      </div>
    </div>
  );
}