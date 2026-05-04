import React, { useState } from 'react';
import {
  X, Zap, TrendingUp, Activity, MapPin, Settings, BarChart2,
  ToggleLeft, ToggleRight, DollarSign, Users, AlertTriangle,
  ChevronRight, Edit2, Check, RefreshCw, Bell, Download,
  Wifi, Clock, Battery, Star
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
  utilization: number; // %
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

const statusConfig = {
  operational: { label: 'Aktif', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  maintenance: { label: 'Bakımda', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  offline: { label: 'Çevrimdışı', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const cpStatusConfig = {
  available: { label: 'Müsait', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  occupied: { label: 'Dolu', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  maintenance: { label: 'Bakım', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

export function StationOwnerDashboard({ onClose }: StationOwnerDashboardProps) {
  const [stations, setStations] = useState<OwnedStation[]>(MOCK_OWNED_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [activeNav, setActiveNav] = useState<'overview' | 'stations' | 'analytics' | 'alerts'>('overview');

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const totalRevenue = stations.reduce((sum, s) => sum + s.todayRevenue, 0);
  const totalSessions = stations.reduce((sum, s) => sum + s.activeSessions, 0);
  const totalPoints = stations.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalActivePoints = stations.reduce((sum, s) => sum + s.activePoints, 0);
  const avgUtilization = Math.round(stations.reduce((sum, s) => sum + s.utilization, 0) / stations.length);

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
      return {
        ...s,
        chargingPoints: s.chargingPoints.map(cp =>
          cp.id === cpId ? { ...cp, price: newPrice } : cp
        )
      };
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
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-800/40 rounded-xl flex items-center justify-center border border-zinc-700">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">İstasyon Yönetimi</div>
              <div className="text-blue-300/70 text-xs">Operatör Paneli</div>
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
          <div className="w-16 md:w-52 bg-slate-50 border-r flex-shrink-0 flex flex-col">
            <nav className="flex-1 p-2 space-y-1 pt-4">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveNav(id); setSelectedStationId(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeNav === id
                      ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-2 pb-4">
              <Separator className="mb-3" />
              <button
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <X className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── OVERVIEW ── */}
            {activeNav === 'overview' && !selectedStationId && (
              <div className="p-5 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Genel Bakış</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Bugünkü performans özeti</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Bugün Gelir</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{totalRevenue.toFixed(0)} ₺</div>
                      <div className="text-xs text-green-600 mt-1">↑ %12 dün'e göre</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-zinc-900 to-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-zinc-800/40 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Aktif Oturum</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{totalSessions}</div>
                      <div className="text-xs text-emerald-400 mt-1">{totalActivePoints}/{totalPoints} nokta aktif</div>
                    </CardContent>
                  </Card>

                  <Card className="border border-zinc-800 bg-zinc-900">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-500/15 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Doluluk Oranı</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">%{avgUtilization}</div>
                      <Progress value={avgUtilization} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">İstasyonlar</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-700">{stations.length}</div>
                      <div className="text-xs text-orange-600 mt-1">{stations.filter(s => s.status === 'operational').length} aktif</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Station Quick List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">İstasyonlarım</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveNav('stations')}>Tümünü Gör</Button>
                  </div>
                  <div className="space-y-3">
                    {stations.map(station => (
                      <Card key={station.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedStationId(station.id); setActiveNav('stations'); }}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusConfig[station.status].dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{station.name}</div>
                              <div className="text-xs text-slate-500">{station.address}</div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-green-600">{station.todayRevenue.toFixed(0)} ₺</div>
                                <div className="text-xs text-slate-400">Bugün</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-emerald-400">{station.activeSessions}</div>
                                <div className="text-xs text-slate-400">Oturum</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-purple-600">%{station.utilization}</div>
                                <div className="text-xs text-slate-400">Doluluk</div>
                              </div>
                            </div>
                            <Badge className={`text-xs border ${statusConfig[station.status].color} hidden sm:flex`}>
                              {statusConfig[station.status].label}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
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
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">İstasyonlarım</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{stations.length} istasyon yönetiyorsunuz</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {stations.map(station => (
                    <Card key={station.id} className="overflow-hidden">
                      <div className={`h-1 ${station.status === 'operational' ? 'bg-green-500' : station.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'}`} />
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-800 truncate">{station.name}</h3>
                              <Badge className={`text-xs border flex-shrink-0 ${statusConfig[station.status].color}`}>
                                {statusConfig[station.status].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="w-3 h-3" />
                              <span>{station.address}, {station.city}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{station.rating}</span>
                              <span className="text-xs text-slate-400">({station.totalReviews})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-500 hidden sm:block">
                              {station.status === 'operational' ? 'Aktif' : 'Bakım Modu'}
                            </span>
                            <Switch
                              checked={station.status === 'operational'}
                              onCheckedChange={() => toggleStationStatus(station.id)}
                            />
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-green-600">{station.todayRevenue.toFixed(0)} ₺</div>
                            <div className="text-xs text-slate-500">Bugün Gelir</div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-emerald-400">{station.activePoints}/{station.totalPoints}</div>
                            <div className="text-xs text-slate-500">Aktif Nokta</div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-purple-600">%{station.utilization}</div>
                            <div className="text-xs text-slate-500">Kullanım</div>
                          </div>
                        </div>

                        {/* Charging points */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Şarj Noktaları & Fiyatlar</div>
                          {station.chargingPoints.map(cp => {
                            const key = `${station.id}_${cp.id}`;
                            const isEditing = key in editingPrices;
                            return (
                              <div key={cp.id} className={`flex items-center gap-3 p-2 rounded-lg border text-sm ${cpStatusConfig[cp.status].bg}`}>
                                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${cp.status === 'available' ? 'bg-green-500' : cp.status === 'occupied' ? 'bg-orange-500' : 'bg-red-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">{cp.type} {cp.power}kW</span>
                                  <span className="text-slate-400 ml-2 text-xs">{cp.connector}</span>
                                </div>
                                <Badge variant="outline" className={`text-xs ${cpStatusConfig[cp.status].color} border-current`}>
                                  {cpStatusConfig[cp.status].label}
                                </Badge>
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      className="h-7 w-20 text-xs"
                                      value={editingPrices[key]}
                                      onChange={e => setEditingPrices(prev => ({ ...prev, [key]: e.target.value }))}
                                      placeholder="₺/kWh"
                                    />
                                    <Button size="icon" className="h-7 w-7" onClick={() => updatePrice(station.id, cp.id)}>
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-emerald-400 transition-colors"
                                    onClick={() => setEditingPrices(prev => ({ ...prev, [key]: cp.price.toString() }))}
                                  >
                                    {cp.price} ₺/kWh
                                    <Edit2 className="w-3 h-3 opacity-50" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedStationId(station.id)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Detay
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info('Rapor indiriliyor...')}>
                            <Download className="w-3 h-3 mr-1" />
                            Rapor
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
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStationId(null)}>← Geri</Button>
                  <div>
                    <h2 className="font-bold text-slate-800">{selectedStation.name}</h2>
                    <p className="text-xs text-slate-500">{selectedStation.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Toplam Gelir', value: `${selectedStation.totalRevenue.toFixed(0)} ₺`, color: 'text-green-600' },
                    { label: 'Bugün', value: `${selectedStation.todayRevenue.toFixed(0)} ₺`, color: 'text-emerald-400' },
                    { label: 'Aktif Oturum', value: selectedStation.activeSessions, color: 'text-purple-600' },
                    { label: 'Değerlendirme', value: selectedStation.rating, color: 'text-amber-600' },
                  ].map(stat => (
                    <Card key={stat.label} className="border-0 bg-slate-50">
                      <CardContent className="p-3 text-center">
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">İstasyon Durumu</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">{selectedStation.status === 'operational' ? 'Aktif' : 'Bakım'}</span>
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
                        return (
                          <div key={cp.id} className={`p-3 rounded-xl border ${cpStatusConfig[cp.status].bg}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Zap className={`w-4 h-4 ${cpStatusConfig[cp.status].color}`} />
                                <span className="font-semibold text-sm">{cp.type} {cp.power} kW — {cp.connector}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${cpStatusConfig[cp.status].color} border-current`}>
                                {cpStatusConfig[cp.status].label}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Birim Fiyat</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input className="h-7 w-24 text-xs bg-zinc-950 text-zinc-100 border-zinc-800" value={editingPrices[key]}
                                    onChange={e => setEditingPrices(prev => ({ ...prev, [key]: e.target.value }))} />
                                  <Button size="icon" className="h-7 w-7" onClick={() => updatePrice(selectedStation.id, cp.id)}>
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingPrices(prev => { const n = {...prev}; delete n[key]; return n; })}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button className="flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-400 transition-colors text-sm"
                                  onClick={() => setEditingPrices(prev => ({ ...prev, [key]: cp.price.toString() }))}>
                                  {cp.price} ₺/kWh <Edit2 className="w-3 h-3 opacity-50" />
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
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Analitik</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Son 30 günlük performans</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stations.map(station => (
                    <Card key={station.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 truncate">{station.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Kullanım Oranı</span><span>%{station.utilization}</span>
                          </div>
                          <Progress value={station.utilization} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Toplam Gelir</span>
                          <span className="font-bold text-green-600">{station.totalRevenue.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Değerlendirme</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{station.rating}</span>
                            <span className="text-slate-400 text-xs">({station.totalReviews})</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card className="bg-zinc-800/40 border-blue-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-700 font-medium">📊 Detaylı raporlar yakında kullanıma sunulacak.</p>
                    <p className="text-xs text-blue-500 mt-1">Günlük, haftalık ve aylık grafik raporları geliştiriliyor.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── ALERTS ── */}
            {activeNav === 'alerts' && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Uyarılar</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Dikkat gerektiren durumlar</p>
                </div>
                <div className="space-y-3">
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-orange-800">Bakım Gerekiyor</div>
                        <div className="text-xs text-orange-700 mt-1">Gaziemir Sanayi Şarj Merkezi — 3 şarj noktası bakım modunda. Servis ekibiyle iletişime geçin.</div>
                        <Button size="sm" variant="outline" className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => toast.info('Servis talebi oluşturuldu')}>
                          Servis Talep Et
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-zinc-800/40">
                    <CardContent className="p-4 flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-blue-800">Yüksek Doluluk</div>
                        <div className="text-xs text-blue-700 mt-1">Balçova AVM %83 doluluk oranıyla pik seviyede. Yeni şarj noktası eklemeyi düşünün.</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-green-800">Güçlü Performans</div>
                        <div className="text-xs text-green-700 mt-1">Narlıdere Merkez bu hafta %12 gelir artışı gösterdi. Mevcut strateji iyi çalışıyor.</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
