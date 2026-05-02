import React, { useState, useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { Search, SlidersHorizontal, User, Map, List, Navigation, LogOut, Shield, Zap, Route } from 'lucide-react';
import { Station, ChargingPoint } from './types/station';
import { StationCard } from './components/StationCard';
import { MapView } from './components/MapView';
import { StationDetail } from './components/StationDetail';
import { FilterPanel } from './components/FilterPanel';
import { UserProfile } from './components/UserProfile';
import { AuthScreen } from './components/AuthScreen';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { StationOwnerDashboard } from './components/StationOwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TripPlanner } from './components/TripPlanner'; // <-- Akıllı Rota Planlayıcı eklendi

const API_KEY = '1957a548-ad93-4efb-9ce3-18dc075f91a6';

// Reliable, stable Unsplash photo IDs for EV / charging station imagery
const EV_PHOTO_IDS = [
  'photo-1593941707882-a5bba14938cb',
  'photo-1617704548623-340376564e68',
  'photo-1558618666-fcd25c85cd64',
  'photo-1560179707-f14e90ef3623',
  'photo-1585208798174-6cedd86e019a',
  'photo-1623126908029-58cb08a2b272',
  'photo-1621264448270-9ef00e88a935',
  'photo-1572120360610-d971b9d7767c',
  'photo-1494976388531-d1058494cdd8',
  'photo-1592198084033-aade902d1aae',
];

function getStationImage(id: number): string {
  const photoId = EV_PHOTO_IDS[id % EV_PHOTO_IDS.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
}

interface AuthUser {
  name: string;
  email: string;
  role: 'driver' | 'station_owner' | 'admin';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [showStationDetail, setShowStationDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showTripPlanner, setShowTripPlanner] = useState(false); // <-- Rota Planlayıcı State'i

  const [filters, setFilters] = useState({
    maxDistance: 50,
    onlyAvailable: false,
    brands: [] as string[],
    minPower: 0,
    connectorTypes: [] as string[]
  });

  useEffect(() => {
    if (!currentUser) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 38.4237, lng: 27.1428 });
          toast.error("Konum alınamadı, varsayılan konum kullanılıyor.");
        },
        { enableHighAccuracy: false, maximumAge: 10000, timeout: 15000 }
      );
    } else {
      setUserLocation({ lat: 38.4237, lng: 27.1428 });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!userLocation) return;

    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.openchargemap.io/v3/poi?key=${API_KEY}&latitude=${userLocation.lat}&longitude=${userLocation.lng}&distance=25&distanceunit=KM&maxresults=50&compact=true`
        );

        if (!response.ok) throw new Error('API Hatası');
        const rawData = await response.json();

        const localBrands = ['ZES', 'Eşarj', 'Voltrun', 'SharZ', 'Trugo', 'Aytemiz'];

        const formattedStations: Station[] = rawData.map((item: any) => {
          const brandFromApi = item.OperatorInfo?.Title;
          const randomBrand = localBrands[Math.floor(Math.random() * localBrands.length)];
          const finalBrand = (brandFromApi && brandFromApi !== "Unknown Operator" && brandFromApi !== "(Unknown Operator)")
            ? brandFromApi
            : randomBrand;

          const chargingPoints: ChargingPoint[] = (item.Connections || []).map((conn: any, cpIndex: number) => ({
            id: `cp_${item.ID}_${cpIndex}`,
            type: conn.PowerKW > 22 ? 'DC' : 'AC',
            power: conn.PowerKW || (conn.LevelID === 3 ? 50 : 22),
            connector: conn.ConnectionType?.Title || 'Bilinmiyor',
            status: Math.random() > 0.3 ? 'available' : 'occupied',
            price: conn.PowerKW > 22 ? 12.5 : 8.5
          }));

          if (chargingPoints.length === 0) {
            chargingPoints.push({
              id: `cp_${item.ID}_default`,
              type: 'AC',
              power: 22,
              connector: 'Type 2',
              status: Math.random() > 0.3 ? 'available' : 'occupied',
              price: 8.5
            });
          }

          const stationImage = getStationImage(item.ID);

          return {
            id: item.ID.toString(),
            name: item.AddressInfo?.Title || 'Şarj İstasyonu',
            brand: finalBrand,
            address: item.AddressInfo?.AddressLine1 || 'Adres bilgisi yok',
            city: item.AddressInfo?.Town || '',
            location: {
              lat: item.AddressInfo?.Latitude,
              lng: item.AddressInfo?.Longitude
            },
            distance: item.AddressInfo?.Distance ? parseFloat(item.AddressInfo.Distance.toFixed(1)) : 0,
            chargingPoints,
            amenities: ['WiFi', 'Park', 'Kahve'],
            rating: item.DataQualityLevel || 4,
            totalReviews: Math.floor(Math.random() * 50) + 10,
            images: [stationImage],
            isOpen24Hours: true,
          };
        });

        setStations(formattedStations);
      } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        toast.error("İstasyon verileri yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, [userLocation]);

  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          station.name.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query) ||
          station.brand.toLowerCase().includes(query) ||
          station.city.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (station.distance > filters.maxDistance) return false;
      if (filters.onlyAvailable) {
        const hasAvailable = station.chargingPoints.some(cp => cp.status === 'available');
        if (!hasAvailable) return false;
      }
      if (filters.brands.length > 0 && !filters.brands.includes(station.brand)) return false;
      if (filters.minPower > 0) {
        const maxPower = Math.max(...station.chargingPoints.map(cp => cp.power));
        if (maxPower < filters.minPower) return false;
      }
      if (filters.connectorTypes.length > 0) {
        const hasConnector = station.chargingPoints.some(cp =>
          filters.connectorTypes.includes(cp.connector)
        );
        if (!hasConnector) return false;
      }
      return true;
    });
  }, [stations, searchQuery, filters]);

  const handleStationSelect = (stationId: string) => setSelectedStation(stationId);

  const handleViewDetails = (stationId: string) => {
    setSelectedStation(stationId);
    setShowStationDetail(true);
  };

  const handleNavigate = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`, '_blank');
    }
  };

  const handleMarkerClick = (stationId: string) => {
    handleStationSelect(stationId);
    setTimeout(() => handleViewDetails(stationId), 300);
  };

  const selectedStationData = stations.find(s => s.id === selectedStation);
  const totalAvailable = filteredStations.reduce(
    (sum, station) => sum + station.chargingPoints.filter(cp => cp.status === 'available').length, 0
  );

  const activeFilterCount =
    (filters.onlyAvailable ? 1 : 0) +
    filters.brands.length +
    (filters.minPower > 0 ? 1 : 0) +
    filters.connectorTypes.length +
    (filters.maxDistance < 50 ? 1 : 0);

  const roleConfig = {
    driver: { label: 'Sürücü', color: 'bg-blue-100 text-blue-700' },
    station_owner: { label: 'İstasyon Sahibi', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700' }
  };

  if (!currentUser) {
    return (
      <>
        <Toaster />
        <AuthScreen onAuthenticated={setCurrentUser} />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster />
      <header className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl">eŞarj</h1>
                <p className="text-xs text-muted-foreground">Elektrikli Araç Şarj İstasyonları</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge className={`hidden sm:flex ${roleConfig[currentUser.role].color} border-0 text-xs`}>
                {currentUser.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                {roleConfig[currentUser.role].label}
              </Badge>

              {currentUser.role === 'station_owner' && (
                <Button variant="outline" size="sm" onClick={() => setShowOwnerDashboard(true)} className="ml-2 hidden md:flex">
                  İstasyon Paneli
                </Button>
              )}

              {currentUser.role === 'admin' && (
                <Button variant="default" size="sm" onClick={() => setShowAdminDashboard(true)} className="ml-2 hidden md:flex bg-red-600 hover:bg-red-700 text-white border-0">
                  Admin Paneli
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setCurrentUser(null); toast.success('Çıkış yapıldı'); }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="İstasyon, adres veya şehir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(true)} className="relative">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{totalAvailable} müsait nokta</span>
            </div>
            <div className="text-muted-foreground hidden sm:block">
              {isLoading ? "Aranıyor..." : `${filteredStations.length} istasyon bulundu`}
            </div>
            <div className="ml-auto flex gap-2">
              {/* Akıllı Rota Planlayıcı Butonu Eklendi */}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowTripPlanner(true)} 
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 hidden sm:flex"
              >
                <Route className="w-4 h-4 mr-2" />
                Rota Planla
              </Button>
              
              <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('map')}>
                <Map className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Harita</span>
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Liste</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <div className="h-full flex flex-col md:flex-row">
            <div className="flex-1 p-4 relative">
              {isLoading && (
                <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-medium text-blue-800 text-sm">Çevrenizdeki istasyonlar aranıyor...</p>
                  </div>
                </div>
              )}
              <MapView stations={filteredStations} selectedStation={selectedStation} onStationSelect={handleMarkerClick} />
            </div>

            <div className="w-full md:w-96 border-l bg-white overflow-y-auto p-4 space-y-3 relative">
              <div className="sticky top-0 bg-white pb-3 mb-3 border-b z-10">
                <h3 className="font-semibold">Yakındaki İstasyonlar</h3>
                <p className="text-sm text-muted-foreground">{filteredStations.length} sonuç</p>
              </div>
              {filteredStations.map((station) => (
                <StationCard key={station.id} station={station} onViewDetails={handleViewDetails} onNavigate={handleNavigate} />
              ))}
              {!isLoading && filteredStations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Bu bölgede istasyon bulunamadı</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilters({ maxDistance: 50, onlyAvailable: false, brands: [], minPower: 0, connectorTypes: [] })}>
                    Filtreleri Sıfırla
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="max-w-4xl mx-auto space-y-3">
              {filteredStations.map((station) => (
                <StationCard key={station.id} station={station} onViewDetails={handleViewDetails} onNavigate={handleNavigate} />
              ))}
              {!isLoading && filteredStations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4 text-sm">Filtrelerinize uygun istasyon bulunamadı</p>
                  <Button variant="outline" onClick={() => setFilters({ maxDistance: 50, onlyAvailable: false, brands: [], minPower: 0, connectorTypes: [] })}>
                    Filtreleri Sıfırla
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALLAR */}
      {showStationDetail && selectedStationData && (
        <StationDetail station={selectedStationData} onClose={() => setShowStationDetail(false)} />
      )}
      {showFilters && (
        <FilterPanel filters={filters} onFiltersChange={setFilters} onClose={() => setShowFilters(false)} />
      )}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      {showOwnerDashboard && <StationOwnerDashboard onClose={() => setShowOwnerDashboard(false)} />}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
      {showTripPlanner && <TripPlanner onClose={() => setShowTripPlanner(false)} stations={filteredStations} />}

      {/* MOBİL HIZLI İŞLEM BUTONLARI */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden z-50">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg bg-indigo-50 text-indigo-700 h-12 w-12"
          onClick={() => setShowTripPlanner(true)}
        >
          <Route className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
          onClick={() => {
            const nearestStation = filteredStations[0];
            if (nearestStation) handleViewDetails(nearestStation.id);
          }}
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}