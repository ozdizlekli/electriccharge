import React, { useState, useEffect } from 'react';
import { Locate, Zap } from 'lucide-react';
import { Station } from '../types/station';
import { Button } from './ui/button';
import { toast } from 'sonner';

// Yeni Harita Kütüphanelerimizi import ediyoruz
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// Leaflet'in çekirdek kütüphanesini custom ikon yapmak için alıyoruz
import L from 'leaflet';

interface MapViewProps {
  stations: Station[];
  selectedStation: string | null;
  onStationSelect: (stationId: string) => void;
}

// Haritanın merkezini dışarıdan değiştirebilmek için küçük bir yardımcı bileşen oluşturuyoruz.
// react-leaflet'te harita nesnesine doğrudan erişmek için "useMap" hook'unu bir alt bileşende kullanmalıyız.
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    // flyTo fonksiyonu, haritayı pürüzsüz bir animasyonla yeni konuma kaydırır (Pan işlemi)
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ stations, selectedStation, onStationSelect }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Haritanın başlangıç noktası (Örneğin İzmir koordinatları veya Türkiye'nin ortası)
  const defaultCenter: [number, number] = [38.4237, 27.1428]; // İzmir
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  // Kullanıcı konumunu gerçek zamanlı izle
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      toast.info('Konum aranıyor...', { duration: 2000 });
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          // İsteğe bağlı: Konum ilk bulunduğunda haritayı oraya kaydır
          // setMapCenter(newLocation); 
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          toast.error('Konum alınamadı. Haritada serbestçe gezinebilirsiniz.');
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
      setMapZoom(16); // Konuma odaklandığında daha da yakınlaştır
      toast.success('Konumunuza odaklandı');
    } else {
      toast.error('Henüz konumunuz bulunamadı.');
    }
  };

  // SVG veya Lucide ikonlarımızı Leaflet haritasında pin olarak kullanabilmek için
  // L.divIcon metodunu kullanarak özel HTML ikonları üretiyoruz.
  const createCustomIcon = (availablePoints: number, isSelected: boolean) => {
    const bgColor = availablePoints > 0 ? 'bg-green-500' : 'bg-red-500';
    const scaleClass = isSelected ? 'scale-110' : 'scale-100';
    
    // HTML string olarak kendi tasarımımızı veriyoruz
    const htmlString = `
      <div class="relative transition-transform duration-300 ${scaleClass}">
        <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md text-white ${bgColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        ${!isSelected ? `<div class="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow flex items-center justify-center text-[10px] leading-none font-semibold text-black">${availablePoints}</div>` : ''}
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-icon', // Varsayılan css'i ezmek için
      iconSize: [28, 28],
      iconAnchor: [14, 28], // İkonun tam ucu koordinata denk gelsin diye
      popupAnchor: [0, -28] // Tıklanınca açılan baloncuğun nerede çıkacağı
    });
  };

  const userIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
        <div class="absolute w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
      </div>
    `,
    className: 'user-location-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      
      {/* Artık manuel div'ler yerine doğrudan MapContainer kullanıyoruz. 
        zoomControl={false} ile kendi artı/eksi butonlarımız yerine Leaflet'in varsayılan butonlarını kapattık.
      */}
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true} // True yaparak şimdilik Leaflet'in kendi + - butonlarını kullanalım, çok daha pürüzsüzdür.
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Gerçek sokak görsellerini çeken Katman (TileLayer) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* İstasyonları haritaya basıyoruz */}
        {stations.map((station) => {
          const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;
          const isSelected = selectedStation === station.id;
          
          // DİKKAT: Mock datandaki station objesinde lat ve lng özellikleri olmalı.
          // Eğer yoksa harita hata verir. Mock verini kontrol edip gerçek enlem/boylamlar vermelisin.
          const stationLatLng: [number, number] = [station.location.lat, station.location.lng];

          return (
            <Marker 
              key={station.id} 
              position={stationLatLng}
              icon={createCustomIcon(availablePoints, isSelected)}
              eventHandlers={{
                click: () => {
                  onStationSelect(station.id);
                  setMapCenter(stationLatLng); // Tıklanınca haritayı o istasyona kaydır
                }
              }}
            >
              {/* Marker'a tıklanınca açılan bilgi baloncuğu (Opsiyonel) */}
              <Popup>
                <div className="text-center">
                  <strong className="block mb-1">{station.name}</strong>
                  <span className="text-sm">{availablePoints} / {station.chargingPoints.length} müsait</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Kullanıcı Konumu */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}
      </MapContainer>

      {/* Map Controls (Sadece Konum Bul butonu kaldı, Zoom işlemi Leaflet'e devredildi) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
        <Button 
          size="icon" 
          variant="secondary" 
          className="shadow-lg bg-white hover:bg-gray-100"
          onClick={handleLocate}
        >
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Legend (Bilgilendirme Kutusu) */}
      <div className="absolute bottom-4 left-4 bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-lg shadow-lg p-3 z-[400]">
        <div className="text-xs font-semibold mb-2 text-zinc-100">Durum</div>
        <div className="flex flex-col gap-1.5 text-xs text-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Müsait</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Dolu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Konumunuz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
