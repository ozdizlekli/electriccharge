import React, { useState } from 'react';
import {
  X, Zap, TrendingUp, Activity, MapPin, Settings, BarChart2,
  DollarSign, Users, AlertTriangle,
  ChevronRight, Edit2, Check, RefreshCw, Bell, Download,
  Star, Info, CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface OwnedStation {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'operational' | 'maintenance' | 'offline';
  totalPoints: number;
  activePoints: number;
  todayRevenue: number;
  totalRevenue: number;
  activeSessions: number;
  rating: number;
  totalReviews: number;
  utilization: number;
  chargingPoints: {
    id: string;
    type: 'AC' | 'DC';
    power: number;
    connector: string;
    status: 'available' | 'occupied' | 'maintenance';
    price: number;
  }[];
}

interface StationOwnerDashboardProps {
  onClose: () => void;
}

const MOCK_OWNED_STATIONS: OwnedStation[] = [
  {
    id: 's1',
    name: 'Narlıdere Merkez Şarj İstasyonu',
    address: 'Mithatpaşa Cad. No:58, Narlıdere',
    city: 'İzmir',
    status: 'operational',
    totalPoints: 4,
    activePoints: 3,
    todayRevenue: 1240.50,
    totalRevenue: 48320.00,
    activeSessions: 2,
    rating: 4.7,
    totalReviews: 142,
    utilization: 75,
    chargingPoints: [
      { id: 'cp1', type: 'DC', power: 150, connector: 'CCS2', status: 'occupied', price: 9.0 },
      { id: 'cp2', type: 'DC', power: 150, connector: 'CHAdeMO', status: 'available', price: 9.0 },
      { id: 'cp3', type: 'AC', power: 22, connector: 'Type 2', status: 'occupied', price: 4.5 },
      { id: 'cp4', type: 'AC', power: 22, connector: 'Type 2', status: 'maintenance', price: 4.5 },
    ]
  },
  {
    id: 's2',
    name: 'Balçova AVM Şarj Noktaları',
    address: 'İzmir Cad. No:132, Balçova',
    city: 'İzmir',
    status: 'operational',
    totalPoints: 6,
    activePoints: 5,
    todayRevenue: 2105.80,
    totalRevenue: 72100.00,
    activeSessions: 4,
    rating: 4.5,
    totalReviews: 89,
    utilization: 83,
    chargingPoints: [
      { id: 'cp5', type: 'DC', power: 200, connector: 'CCS2', status: 'occupied', price: 10.0 },
      { id: 'cp6', type: 'DC', power: 200, connector: 'CCS2', status: 'occupied', price: 10.0 },
      { id: 'cp7', type: 'DC', power: 100, connector: 'CHAdeMO', status: 'available', price: 8.5 },
      { id: 'cp8', type: 'AC', power: 22, connector: 'Type 2', status: 'occupied', price: 4.0 },
      { id: 'cp9', type: 'AC', power: 22, connector: 'Type 2', status: 'occupied', price: 4.0 },
      { id: 'cp10', type: 'AC', power: 11, connector: 'Type 2', status: 'available', price: 3.0 },
    ]
  },
  {
    id: 's3',
    name: 'Gaziemir Sanayi Şarj Merkezi',
    address: 'OSB Cad. No:22, Gaziemir',
    city: 'İzmir',
    status: 'maintenance',
    totalPoints: 3,
    activePoints: 0,
    todayRevenue: 0,
    totalRevenue: 18500.00,
    activeSessions: 0,
    rating: 4.2,
    totalReviews: 34,
    utilization: 0,
    chargingPoints: [
      { id: 'cp11', type: 'DC', power: 120, connector: 'CCS2', status: 'maintenance', price: 8.0 },
      { id: 'cp12', type: 'DC', power: 120, connector: 'CHAdeMO', status: 'maintenance', price: 8.0 },
      { id: 'cp13', type: 'AC', power: 22, connector: 'Type 2', status: 'maintenance', price: 4.0 },
    ]
  }
];

type StatusConfigType = {
  [key: string]: { label: string; dotColor: string }
};

const statusConfig: StatusConfigType = {
  operational: { label: 'Aktif', dotColor: 'bg-emerald-400' },
  maintenance: { label: 'Bakımda', dotColor: 'bg-zinc-500' },
  offline: { label: 'Çevrimdışı', dotColor: 'bg-zinc-700' },
};

type CpStatusConfigType = {
  [key: string]: { label: string; dotColor: string; textColor: string }
};

const cpStatusConfig: CpStatusConfigType = {
  available: { label: 'Müsait', dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
  occupied: { label: 'Dolu', dotColor: 'bg-zinc-400', textColor: 'text-zinc-300' },
  maintenance: { label: 'Bakım', dotColor: 'bg-zinc-600', textColor: 'text-zinc-500' },
};

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  station?: string;
  time: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ALERTS: AlertItem[] = [
  {
    id: 'a1',
    type: 'error',
    title: 'Bakım Gerekiyor',
    description: 'Gaziemir Sanayi Şarj Merkezi — 3 şarj noktası bakım modunda. Servis ekibiyle iletişime geçin.',
    station: 'Gaziemir Sanayi Şarj Merkezi',
    time: '2 saat önce',
    actionLabel: 'Servis Talep Et',
  },
  {
    id: 'a2',
    type: 'warning',
    title: 'Yüksek Doluluk',
    description: 'Balçova AVM %83 doluluk oranıyla pik seviyede. Yeni şarj noktası eklemeyi düşünün.',
    station: 'Balçova AVM Şarj Noktaları',
    time: '4 saat önce',
  },
  {
    id: 'a3',
    type: 'success',
    title: 'Güçlü Performans',
    description: 'Narlıdere Merkez bu hafta %12 gelir artışı gösterdi. Mevcut strateji iyi çalışıyor.',
    station: 'Narlıdere Merkez Şarj İstasyonu',
    time: '1 gün önce',
  },
  {
    id: 'a4',
    type: 'info',
    title: 'Fiyat Güncellemesi Önerisi',
    description: 'DC şarj fiyatları bölge ortalamasının %8 altında. Fiyat optimizasyonu yapılabilir.',
    time: '2 gün önce',
  },
];

type AlertConfigType = {
  [key: string]: { icon: any; iconColor: string; iconBg: string; badge: string; label: string }
};

// Tüm uyarılar gri ve zarif yeşil tonlarında
const alertConfig: AlertConfigType = {
  error: {
    icon: AlertTriangle,
    iconColor: 'text-zinc-300',
    iconBg: 'bg-zinc-800/80',
    badge: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    label: 'Kritik',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-zinc-400',
    iconBg: 'bg-zinc-800/50',
    badge: 'bg-zinc-800/50 text-zinc-400 border border-zinc-700',
    label: 'Uyarı',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-zinc-400',
    iconBg: 'bg-zinc-800/50',
    badge: 'bg-zinc-800/50 text-zinc-400 border border-zinc-700',
    label: 'Başarı',
  },
  info: {
    icon: Info,
    iconColor: 'text-zinc-500',
    iconBg: 'bg-zinc-900',
    badge: 'bg-zinc-900 text-zinc-500 border border-zinc-800',
    label: 'Bilgi',
  },
};

interface Props { onClose: () => void; }

export function StationOwnerDashboard({ onClose }: Props) {
  const [stations, setStations] = useState<OwnedStation[]>(MOCK_OWNED_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [activeNav, setActiveNav] = useState<'overview' | 'stations' | 'analytics' | 'alerts'>('overview');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const totalRevenue = stations.reduce((sum, s) => sum + s.todayRevenue, 0);
  const totalSessions = stations.reduce((sum, s) => sum + s.activeSessions, 0);
  const totalPoints = stations.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalActivePoints = stations.reduce((sum, s) => sum + s.activePoints, 0);
  const avgUtilization = Math.round(stations.reduce((sum, s) => sum + s.utilization, 0) / stations.length);

  const activeAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  const toggleStationStatus = (stationId: string) => {
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      const next = s.status === 'operational' ? 'maintenance' : 'operational';
      toast.success(`${s.name} → ${statusConfig[next].label}`);
      return { ...s, status: next };
    }));
  };

  const updatePrice = (stationId: string, cpId: string) => {
    const key = `${stationId}_${cpId}`;
    const newPrice = parseFloat(editingPrices[key]);
    if (isNaN(newPrice) || newPrice <= 0) { toast.error('Geçerli bir fiyat girin'); return; }
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      return { ...s, chargingPoints: s.chargingPoints.map(cp => cp.id === cpId ? { ...cp, price: newPrice } : cp) };
    }));
    setEditingPrices(prev => { const next = { ...prev }; delete next[key]; return next; });
    toast.success('Fiyat güncellendi');
  };

  const navItems = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart2 },
    { id: 'stations', label: 'İstasyonlarım', icon: MapPin },
    { id: 'analytics', label: 'Analitik', icon: TrendingUp },
    { id: 'alerts', label: 'Uyarılar', icon: Bell },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end md:items-stretch justify-center">
      <div className="bg-zinc-900 w-full md:max-w-6xl md:m-4 md:rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-screen md:max-h-[calc(100vh-2rem)]">

        {/* Top Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-800/40 rounded-xl flex items-center justify-center border border-zinc-700">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-zinc-100 font-bold text-lg leading-tight">İstasyon Yönetimi</div>
              <div className="text-zinc-500 text-xs">Operatör Paneli</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-zinc-800/40" onClick={() => toast.info('Veriler güncelleniyor...')}>
              <RefreshCw className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline text-xs">Yenile</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-zinc-800/40">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-16 md:w-52 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 flex flex-col">
            <nav className="flex-1 p-2 space-y-1 pt-4">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveNav(id); setSelectedStationId(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeNav === id
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                  {id === 'alerts' && activeAlerts.filter(a => a.type === 'error').length > 0 && (
                    <span className="hidden md:flex ml-auto w-4 h-4 bg-zinc-700 rounded-full items-center justify-center text-zinc-300 text-[10px] font-bold">
                      {activeAlerts.filter(a => a.type === 'error').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="p-2 pb-4">
              <Separator className="mb-3 bg-zinc-800" />
              <button
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
              >
                <X className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-zinc-950">

            {/* ── OVERVIEW ── */}
            {activeNav === 'overview' && !selectedStationId && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Genel Bakış</h2>
                  <p className="text-sm text-zinc-400 mt-0.5">Bugünkü performans özeti</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span className="text-zinc-400 font-medium">Bugün Gelir</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">{totalRevenue.toFixed(0)} ₺</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                         <span className="text-zinc-400 font-medium">Aktif Oturum</span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-100">{totalSessions}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span className="text-zinc-400 font-medium">Doluluk Oranı</span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-100">%{avgUtilization}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                    <CardContent className="p-0 space-y-3">
                       <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span className="text-zinc-400 font-medium">Toplam İstasyon</span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-100">{stations.length}</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-100">İstasyonlarım</h3>
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => setActiveNav('stations')}>Tümünü Gör</Button>
                  </div>
                  <div className="space-y-4">
                     {stations.map(station => (
                        <Card key={station.id} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => { setSelectedStationId(station.id); setActiveNav('stations'); }}>
                        <CardContent className="p-0">
                           <div className="mb-4">
                            <h3 className="font-bold text-zinc-100 text-lg truncate">{station.name}</h3>
                          </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                      <span>Kullanım Oranı</span>
                                      <span>%{station.utilization}</span>
                                    </div>
                                    <Progress value={station.utilization} className="h-2.5 bg-zinc-950" />
                                </div>
                                <div className="flex justify-between text-sm items-center pt-2">
                                    <span className="text-zinc-400">Bugün Gelir</span>
                                    <span className="font-bold text-emerald-400">{station.todayRevenue.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-zinc-400">Aktif Oturum</span>
                                    <span className="font-bold text-zinc-100">{station.activeSessions}</span>
                                </div>
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STATIONS LIST ── */}
            {activeNav === 'stations' && !selectedStationId && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">İstasyonlarım</h2>
                    <p className="text-sm text-zinc-400 mt-0.5">{stations.length} istasyon yönetiyorsunuz</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stations.map(station => (
                    <Card key={station.id} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-zinc-100 text-lg truncate">{station.name}</h3>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${statusConfig[station.status].dotColor}`} />
                                <span className="text-xs text-zinc-400">{statusConfig[station.status].label}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{station.address}, {station.city}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              <Star className="w-3.5 h-3.5 fill-zinc-600 text-zinc-600" />
                              <span className="text-sm font-bold text-zinc-200">{station.rating}</span>
                              <span className="text-xs text-zinc-500">({station.totalReviews})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-zinc-500 hidden sm:block">
                              {station.status === 'operational' ? 'Aktif' : 'Bakım Modu'}
                            </span>
                            <Switch
                              checked={station.status === 'operational'}
                              onCheckedChange={() => toggleStationStatus(station.id)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-emerald-400">{station.todayRevenue.toFixed(0)} ₺</div>
                            <div className="text-xs text-zinc-500 mt-1">Bugün Gelir</div>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-zinc-100">{station.activePoints}/{station.totalPoints}</div>
                            <div className="text-xs text-zinc-500 mt-1">Aktif Nokta</div>
                          </div>
                          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-zinc-100">%{station.utilization}</div>
                            <div className="text-xs text-zinc-500 mt-1">Kullanım</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Şarj Noktaları & Fiyatlar</div>
                          <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl space-y-1">
                            {station.chargingPoints.map(cp => {
                              const key = `${station.id}_${cp.id}`;
                              const isEditing = key in editingPrices;
                              const cpStatus = cpStatusConfig[cp.status];
                              return (
                                <div key={cp.id} className="flex items-center gap-4 p-2 rounded-lg text-sm hover:bg-zinc-900 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-zinc-200">{cp.type} {cp.power}kW</span>
                                    <span className="text-zinc-500 ml-2 text-xs">{cp.connector}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 w-24">
                                    <div className={`w-1.5 h-1.5 rounded-full ${cpStatus.dotColor}`} />
                                    <span className={`text-xs font-medium ${cpStatus.textColor}`}>{cpStatus.label}</span>
                                  </div>
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        className="h-7 w-20 text-xs bg-zinc-950 border-zinc-700 text-zinc-100"
                                        value={editingPrices[key]}
                                        onChange={e => setEditingPrices(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder="₺/kWh"
                                      />
                                      <Button size="icon" className="h-7 w-7 bg-zinc-800 text-zinc-300 hover:bg-zinc-700" onClick={() => updatePrice(station.id, cp.id)}>
                                        <Check className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <button
                                      className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-colors"
                                      onClick={() => setEditingPrices(prev => ({ ...prev, [key]: cp.price.toString() }))}
                                    >
                                      {cp.price} ₺/kWh
                                      <Edit2 className="w-3 h-3 opacity-40" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => setSelectedStationId(station.id)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Detaylı Yönetim
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => toast.info('Rapor indiriliyor...')}>
                            <Download className="w-4 h-4 mr-2" />
                            Rapor Al
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ── STATION DETAIL ── */}
            {selectedStationId && selectedStation && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setSelectedStationId(null)}>← Geri Dön</Button>
                  <div>
                    <h2 className="font-bold text-zinc-100 text-xl">{selectedStation.name}</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">{selectedStation.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Toplam Gelir', value: `${selectedStation.totalRevenue.toLocaleString('tr-TR')} ₺`, color: 'text-zinc-100' },
                    { label: 'Bugün', value: `${selectedStation.todayRevenue.toLocaleString('tr-TR')} ₺`, color: 'text-emerald-400' },
                    { label: 'Aktif Oturum', value: selectedStation.activeSessions, color: 'text-zinc-100' },
                    { label: 'Değerlendirme', value: selectedStation.rating, color: 'text-zinc-100' },
                  ].map(stat => (
                    <Card key={stat.label} className="bg-zinc-900 border-zinc-800 p-5 rounded-2xl">
                      <CardContent className="p-0 text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-zinc-100 text-lg">İstasyon Durumu ve Fiyatlar</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-400">{selectedStation.status === 'operational' ? 'Aktif' : 'Bakım Modunda'}</span>
                        <Switch
                          checked={selectedStation.status === 'operational'}
                          onCheckedChange={() => toggleStationStatus(selectedStation.id)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedStation.chargingPoints.map(cp => {
                        const key = `${selectedStation.id}_${cp.id}`;
                        const isEditing = key in editingPrices;
                        const cpStatus = cpStatusConfig[cp.status];
                        return (
                          <div key={cp.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-zinc-500" />
                                <span className="font-bold text-base text-zinc-200">{cp.type} {cp.power} kW — {cp.connector}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${cpStatus.dotColor}`} />
                                <span className={`text-sm font-medium ${cpStatus.textColor}`}>{cpStatus.label}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-zinc-500">Birim Fiyatlandırma</span>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input className="h-8 w-24 text-sm bg-zinc-900 text-zinc-100 border-zinc-700" value={editingPrices[key]}
                                    onChange={e => setEditingPrices(prev => ({ ...prev, [key]: e.target.value }))} />
                                  <Button size="icon" className="h-8 w-8 bg-zinc-800 text-zinc-300 hover:bg-zinc-700" onClick={() => updatePrice(selectedStation.id, cp.id)}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" onClick={() => setEditingPrices(prev => { const n = {...prev}; delete n[key]; return n; })}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <button className="flex items-center gap-2 font-bold text-zinc-300 hover:text-zinc-100 transition-colors text-base"
                                  onClick={() => setEditingPrices(prev => ({ ...prev, [key]: cp.price.toString() }))}>
                                  {cp.price} ₺/kWh <Edit2 className="w-3 h-3 opacity-40" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeNav === 'analytics' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Analitik</h2>
                  <p className="text-sm text-zinc-400 mt-0.5">Son 30 günlük performans</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stations.map(station => (
                     <Card key={station.id} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                     <CardContent className="p-0 space-y-4">
                       <h3 className="font-bold text-zinc-100 text-lg">{station.name}</h3>

                       <div>
                         <div className="flex justify-between text-sm text-zinc-400 mb-2">
                           <span>Kullanım Oranı</span>
                           <span>%{station.utilization}</span>
                         </div>
                         <Progress value={station.utilization} className="h-2.5 bg-zinc-950" />
                       </div>

                       <div className="flex justify-between text-sm items-center pt-2">
                         <span className="text-zinc-400">Toplam Gelir</span>
                         <span className="font-bold text-zinc-100">{station.totalRevenue.toLocaleString('tr-TR')} ₺</span>
                       </div>

                       <div className="flex justify-between text-sm items-center">
                         <span className="text-zinc-400">Değerlendirme</span>
                         <div className="flex items-center gap-1.5">
                           <Star className="w-4 h-4 fill-zinc-600 text-zinc-600" />
                           <span className="font-bold text-zinc-200">{station.rating}</span>
                           <span className="text-zinc-500">({station.totalReviews})</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ── ALERTS ── */}
            {activeNav === 'alerts' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Uyarılar</h2>
                  <p className="text-sm text-zinc-400 mt-0.5">Dikkat gerektiren durumlar</p>
                </div>

                {activeAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-base font-bold text-zinc-300">Tüm sistemler normal</p>
                    <p className="text-sm text-zinc-500 mt-1">Aktif uyarı bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAlerts.map(alert => {
                      const cfg = alertConfig[alert.type];
                      const IconComp = cfg.icon;
                      return (
                        <Card key={alert.id} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                           <CardContent className="p-0">
                                <div className="flex gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                                    <IconComp className={`w-5 h-5 ${cfg.iconColor}`} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                      <span className="font-bold text-zinc-100 text-base">{alert.title}</span>
                                      <Badge className={`text-xs px-2 py-0.5 rounded-md font-medium ${cfg.badge}`}>{cfg.label}</Badge>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed mb-4 pr-6">{alert.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                      {alert.station && (
                                        <div className="flex items-center gap-1.5">
                                          <MapPin className="w-4 h-4" />
                                          <span>{alert.station}</span>
                                        </div>
                                      )}
                                      <span>{alert.time}</span>
                                    </div>

                                    {alert.actionLabel && (
                                      <div className="mt-5 pt-5 border-t border-zinc-800/50">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-sm bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-300"
                                          onClick={() => toast.info('Servis talebi oluşturuldu')}
                                        >
                                          {alert.actionLabel}
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <button
                                      onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                                      className="absolute top-6 right-6 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                      <X className="w-4 h-4" />
                                  </button>
                                </div>
                            </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}