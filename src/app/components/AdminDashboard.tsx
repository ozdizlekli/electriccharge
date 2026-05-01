import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Users, Building2, DollarSign, TrendingUp, Shield, CheckCircle,
  XCircle, AlertTriangle, Search, RefreshCw,
  ChevronDown, Ban, UserCheck, UserX, Zap, Activity, Wrench, Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import type { AIDamageReport } from './AIDamageSimulation';

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRole = 'driver' | 'station_owner' | 'admin';
type UserStatus = 'active' | 'suspended' | 'pending';
type StationStatus = 'active' | 'pending_approval' | 'suspended';

interface AdminUser {
  id: string; name: string; email: string; role: UserRole;
  status: UserStatus; joinDate: string; totalSessions: number;
  totalSpent: number; initials: string;
}

interface AdminStation {
  id: string; name: string; owner: string; city: string; brand: string;
  status: StationStatus; totalPoints: number; monthlyRevenue: number;
  submittedDate: string; rating: number;
}

// ── localStorage ──────────────────────────────────────────────────────────────

const LS_USERS     = 'esarj_admin_users';
const LS_STATIONS  = 'esarj_admin_stations';
const LS_AI_DAMAGE = 'ai_damage_reports';

const DEFAULT_USERS: AdminUser[] = [
  { id: 'u1', name: 'Hatice Çevik',   email: 'hatice@gmail.com',   role: 'driver',         status: 'active',    joinDate: '2024-03-15', totalSessions: 47,  totalSpent: 1240, initials: 'HÇ' },
  { id: 'u2', name: 'Ahmet Yılmaz',   email: 'ahmet@mail.com',     role: 'station_owner',  status: 'active',    joinDate: '2024-01-08', totalSessions: 12,  totalSpent: 320,  initials: 'AY' },
  { id: 'u3', name: 'Zeynep Kaya',    email: 'zeynep@gmail.com',   role: 'driver',         status: 'suspended', joinDate: '2024-05-20', totalSessions: 3,   totalSpent: 85,   initials: 'ZK' },
  { id: 'u4', name: 'Mehmet Arslan',  email: 'mehmet@hotmail.com', role: 'driver',         status: 'active',    joinDate: '2024-02-11', totalSessions: 89,  totalSpent: 2650, initials: 'MA' },
  { id: 'u5', name: 'Fatma Demir',    email: 'fatma@gmail.com',    role: 'station_owner',  status: 'pending',   joinDate: '2025-04-28', totalSessions: 0,   totalSpent: 0,    initials: 'FD' },
  { id: 'u6', name: 'Can Öztürk',     email: 'can@yandex.com',     role: 'driver',         status: 'active',    joinDate: '2023-11-30', totalSessions: 134, totalSpent: 4100, initials: 'CÖ' },
];

const DEFAULT_STATIONS: AdminStation[] = [
  { id: 's1', name: 'İzmir Konak Pier Şarj',   owner: 'Ahmet Yılmaz',  city: 'İzmir', brand: 'Eşarj',   status: 'active',           totalPoints: 6, monthlyRevenue: 18400, submittedDate: '2024-01-08', rating: 4.7 },
  { id: 's2', name: 'Bornova Forum Şarj',       owner: 'Eşarj A.Ş.',   city: 'İzmir', brand: 'Eşarj',   status: 'active',           totalPoints: 4, monthlyRevenue: 12100, submittedDate: '2024-02-14', rating: 4.5 },
  { id: 's3', name: 'Karşıyaka Marina Şarj',    owner: 'Fatma Demir',   city: 'İzmir', brand: 'ZES',     status: 'pending_approval', totalPoints: 8, monthlyRevenue: 0,     submittedDate: '2025-04-28', rating: 0   },
  { id: 's4', name: 'Balçova AVM Şarj',         owner: 'Voltrun Ltd.',  city: 'İzmir', brand: 'Voltrun', status: 'active',           totalPoints: 3, monthlyRevenue: 7800,  submittedDate: '2024-03-22', rating: 4.3 },
  { id: 's5', name: 'Alsancak Kordon Şarj',     owner: 'Hasan Kurt',    city: 'İzmir', brand: 'ZES',     status: 'suspended',        totalPoints: 2, monthlyRevenue: 0,     submittedDate: '2023-12-05', rating: 3.1 },
];

function loadLS<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function saveLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Label / colour maps ───────────────────────────────────────────────────────

const roleLabels: Record<UserRole, string> = { driver: 'Sürücü', station_owner: 'İstasyon Sahibi', admin: 'Admin' };
const roleColors: Record<UserRole, string> = {
  driver: 'bg-blue-100 text-blue-700',
  station_owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};
const userStatusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};
const stationStatusColors: Record<StationStatus, string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  pending_approval: 'bg-orange-100 text-orange-700',
};
const stationStatusLabels: Record<StationStatus, string> = {
  active: 'Aktif', suspended: 'Askıya Alındı', pending_approval: 'Onay Bekliyor',
};

const damageSeverityColors: Record<string, string> = {
  low:      'bg-blue-100 text-blue-700',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};
const damageSeverityLabels: Record<string, string> = {
  low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik',
};

const kpis = [
  { label: 'Toplam Kullanıcı',        value: '12,847', change: '+8.2%',    trend: 'up',      icon: Users,     bg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
  { label: 'Platform Geliri (Bu Ay)', value: '₺284,600', change: '+14.5%', trend: 'up',      icon: DollarSign,bg: 'bg-green-50',  iconColor: 'text-green-600'  },
  { label: 'Kayıtlı İstasyonlar',     value: '342',    change: '+3 bekliyor', trend: 'neutral', icon: Building2, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { label: 'Aktif Şarj Oturumu',      value: '1,204',  change: 'Anlık',   trend: 'live',    icon: Activity,  bg: 'bg-orange-50', iconColor: 'text-orange-600' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { onClose: () => void; }

export function AdminDashboard({ onClose }: Props) {
  const [users,    setUsers]    = useState<AdminUser[]>   (() => loadLS(LS_USERS,    DEFAULT_USERS));
  const [stations, setStations] = useState<AdminStation[]>(() => loadLS(LS_STATIONS, DEFAULT_STATIONS));
  const [aiReports, setAiReports] = useState<AIDamageReport[]>(() => loadLS(LS_AI_DAMAGE, []));

  const [userSearch,    setUserSearch]    = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [userActionMenu, setUserActionMenu] = useState<string | null>(null);

  useEffect(() => { saveLS(LS_USERS,    users);    }, [users]);
  useEffect(() => { saveLS(LS_STATIONS, stations); }, [stations]);

  const pendingStations  = stations.filter(s => s.status === 'pending_approval').length;
  const openAiReports    = aiReports.filter(r => r.status === 'open').length;
  const criticalAiReports = aiReports.filter(r => r.severity === 'critical' && r.status === 'open').length;

  const filteredUsers    = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
    s.owner.toLowerCase().includes(stationSearch.toLowerCase()));

  // ── User actions ──────────────────────────────────────────────────────────

  const changeUserRole = useCallback((id: string, role: UserRole) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
    toast.success(`Kullanıcı rolü "${roleLabels[role]}" olarak güncellendi`);
    setUserActionMenu(null);
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(p => p.map(u => {
      if (u.id !== id) return u;
      const next: UserStatus = u.status === 'active' ? 'suspended' : 'active';
      toast.success(`Kullanıcı ${next === 'active' ? 'aktif edildi' : 'askıya alındı'}`);
      return { ...u, status: next };
    }));
    setUserActionMenu(null);
  }, []);

  // ── Station actions ───────────────────────────────────────────────────────

  const approveStation   = (id: string) => { setStations(p => p.map(s => s.id === id ? { ...s, status: 'active' as StationStatus } : s)); toast.success('İstasyon onaylandı'); };
  const suspendStation   = (id: string) => { setStations(p => p.map(s => s.id === id ? { ...s, status: 'suspended' as StationStatus } : s)); toast.success('İstasyon askıya alındı'); };
  const reactivateStation = (id: string) => { setStations(p => p.map(s => s.id === id ? { ...s, status: 'active' as StationStatus } : s)); toast.success('İstasyon aktif edildi'); };

  // ── AI report actions ─────────────────────────────────────────────────────

  const markReportInProgress = (id: string) => {
    const updated = aiReports.map(r => r.id === id ? { ...r, status: 'in_progress' as const } : r);
    setAiReports(updated);
    saveLS(LS_AI_DAMAGE, updated);
    toast.success('Rapor "İşlemde" olarak işaretlendi');
  };

  const markReportResolved = (id: string) => {
    const updated = aiReports.map(r => r.id === id ? { ...r, status: 'resolved' as const } : r);
    setAiReports(updated);
    saveLS(LS_AI_DAMAGE, updated);
    toast.success('Rapor çözüldü olarak kapatıldı');
  };

  const refreshAiReports = () => {
    setAiReports(loadLS(LS_AI_DAMAGE, []));
    toast.info('AI raporları yenilendi');
  };

  const resetAll = () => {
    setUsers(DEFAULT_USERS);
    setStations(DEFAULT_STATIONS);
    toast.info('Kullanıcı ve istasyon verileri sıfırlandı');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-5xl md:rounded-2xl max-h-[96vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Admin Paneli</h2>
              <p className="text-slate-400 text-xs">Platform Yönetim Merkezi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingStations > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg px-3 py-1.5 text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {pendingStations} istasyon onay bekliyor
              </div>
            )}
            {criticalAiReports > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-3 py-1.5 text-xs font-medium">
                <Wrench className="w-3.5 h-3.5" />
                {criticalAiReports} kritik arıza
              </div>
            )}
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10" onClick={resetAll}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline text-xs">Sıfırla</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map(kpi => (
              <Card key={kpi.label} className="border-0 shadow-sm">
                <CardContent className={`p-4 ${kpi.bg} rounded-xl`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                    </div>
                    {kpi.trend === 'live' && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-medium">Canlı</span>
                      </div>
                    )}
                    {kpi.trend === 'up' && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />{kpi.change}
                      </span>
                    )}
                    {kpi.trend === 'neutral' && (
                      <span className="text-xs text-orange-600 font-semibold">{kpi.change}</span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="users" className="flex-1">
                <Users className="w-4 h-4 mr-1.5" />
                Kullanıcılar ({users.length})
              </TabsTrigger>
              <TabsTrigger value="stations" className="flex-1">
                <Building2 className="w-4 h-4 mr-1.5" />
                İstasyonlar ({stations.length})
                {pendingStations > 0 && (
                  <span className="ml-1.5 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingStations}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex-1">
                <Wrench className="w-4 h-4 mr-1.5" />
                Bakım
                {openAiReports > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {openAiReports}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── USERS ── */}
            <TabsContent value="users">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Ad veya e-posta ara..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <Card key={user.id} className={`transition-all ${user.status === 'suspended' ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className={`text-sm font-semibold ${roleColors[user.role]}`}>
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{user.name}</span>
                            <Badge className={`text-xs border-0 ${roleColors[user.role]}`}>{roleLabels[user.role]}</Badge>
                            <Badge className={`text-xs border-0 ${userStatusColors[user.status]}`}>
                              {user.status === 'active' ? 'Aktif' : user.status === 'suspended' ? 'Askıya Alındı' : 'Beklemede'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{user.totalSessions} oturum</span>
                            <span>₺{user.totalSpent.toLocaleString('tr-TR')} harcama</span>
                          </div>
                        </div>

                        <div className="relative flex-shrink-0">
                          <Button variant="ghost" size="sm" className="gap-1"
                            onClick={() => setUserActionMenu(p => p === user.id ? null : user.id)}>
                            İşlem <ChevronDown className="w-3 h-3" />
                          </Button>

                          {userActionMenu === user.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-20 py-1 min-w-[190px]">
                              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rol Değiştir</div>
                              {(['driver', 'station_owner', 'admin'] as UserRole[]).map(role => (
                                <button key={role} onClick={() => changeUserRole(user.id, role)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${user.role === role ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                                  {user.role === role && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                                  {user.role !== role && <div className="w-3.5 h-3.5" />}
                                  {roleLabels[role]}
                                </button>
                              ))}
                              <Separator className="my-1" />
                              <button onClick={() => toggleUserStatus(user.id)}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${user.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>
                                {user.status === 'active'
                                  ? <><UserX className="w-3.5 h-3.5" /> Askıya Al</>
                                  : <><UserCheck className="w-3.5 h-3.5" /> Aktif Et</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Kullanıcı bulunamadı</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── STATIONS ── */}
            <TabsContent value="stations">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="İstasyon, sahip veya şehir ara..." value={stationSearch} onChange={e => setStationSearch(e.target.value)} className="pl-9" />
                </div>
              </div>

              {pendingStations > 0 && (
                <Card className="bg-orange-50 border-orange-200 mb-4">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <p className="text-sm text-orange-800">
                      <strong>{pendingStations} yeni istasyon</strong> onay bekliyor.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {filteredStations.map(station => (
                  <Card key={station.id} className={`transition-all ${station.status === 'pending_approval' ? 'border-orange-300 bg-orange-50/30' : station.status === 'suspended' ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${station.status === 'pending_approval' ? 'bg-orange-100' : station.status === 'suspended' ? 'bg-red-100' : 'bg-green-100'}`}>
                          <Zap className={`w-5 h-5 ${station.status === 'pending_approval' ? 'text-orange-600' : station.status === 'suspended' ? 'text-red-600' : 'text-green-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">{station.name}</span>
                            <Badge className={`text-xs border-0 ${stationStatusColors[station.status]}`}>{stationStatusLabels[station.status]}</Badge>
                            <Badge variant="outline" className="text-xs">{station.brand}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sahip: {station.owner} · {station.city} · {station.totalPoints} şarj noktası
                          </div>
                          {station.status === 'active' && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ₺{station.monthlyRevenue.toLocaleString('tr-TR')}/ay
                              {station.rating > 0 && <span className="ml-2">⭐ {station.rating}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {station.status === 'pending_approval' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8" onClick={() => approveStation(station.id)}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8" onClick={() => suspendStation(station.id)}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reddet
                              </Button>
                            </>
                          )}
                          {station.status === 'active' && (
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8" onClick={() => suspendStation(station.id)}>
                              <Ban className="w-3.5 h-3.5 mr-1" /> Askıya Al
                            </Button>
                          )}
                          {station.status === 'suspended' && (
                            <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 text-xs h-8" onClick={() => reactivateStation(station.id)}>
                              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Aktif Et
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredStations.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">İstasyon bulunamadı</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── MAINTENANCE (AI Damage Reports) ── */}
            <TabsContent value="maintenance">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">AI Hasar Raporları</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sürücüler tarafından bildirilen ve AI tarafından analiz edilen arızalar
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshAiReports}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Yenile
                </Button>
              </div>

              {/* Summary chips */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-700 font-medium">{aiReports.filter(r => r.status === 'open').length} Açık</span>
                </div>
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-yellow-700 font-medium">{aiReports.filter(r => r.status === 'in_progress').length} İşlemde</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-700 font-medium">{aiReports.filter(r => r.status === 'resolved').length} Çözüldü</span>
                </div>
              </div>

              {aiReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Henüz AI hasar raporu yok</p>
                  <p className="text-xs mt-1">Sürücüler istasyon detay sayfasından hasar bildirebilir.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiReports.map(report => (
                    <Card
                      key={report.id}
                      className={`transition-all ${
                        report.severity === 'critical' ? 'border-red-300 bg-red-50/20' :
                        report.severity === 'high'     ? 'border-orange-200' : ''
                      } ${report.status === 'resolved' ? 'opacity-60' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            report.severity === 'critical' ? 'bg-red-100' :
                            report.severity === 'high'     ? 'bg-orange-100' :
                            report.severity === 'medium'   ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              report.severity === 'critical' ? 'text-red-600' :
                              report.severity === 'high'     ? 'text-orange-600' :
                              report.severity === 'medium'   ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-sm">{report.damageType}</span>
                              <Badge className={`text-xs border-0 ${damageSeverityColors[report.severity] ?? ''}`}>
                                {damageSeverityLabels[report.severity] ?? report.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono">{report.priorityCode}</Badge>
                              {report.status === 'open' && <Badge className="text-xs bg-red-100 text-red-700 border-0">Açık</Badge>}
                              {report.status === 'in_progress' && <Badge className="text-xs bg-yellow-100 text-yellow-700 border-0">İşlemde</Badge>}
                              {report.status === 'resolved' && <Badge className="text-xs bg-green-100 text-green-700 border-0">Çözüldü</Badge>}
                            </div>

                            <p className="text-xs text-muted-foreground mb-1">
                              📍 {report.stationName}
                            </p>
                            <p className="text-xs text-gray-700 mb-1 line-clamp-2">{report.description}</p>
                            <p className="text-xs text-blue-700 italic mb-2 line-clamp-1">{report.recommendation}</p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(report.timestamp).toLocaleString('tr-TR')}
                              </span>
                              <span>Model güveni: %{report.confidence}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {report.status !== 'resolved' && (
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              {report.status === 'open' && (
                                <Button size="sm" variant="outline" className="text-xs h-7 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                  onClick={() => markReportInProgress(report.id)}>
                                  İşleme Al
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() => markReportResolved(report.id)}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Çözüldü
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 bg-gray-50 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <span>eŞarj Admin · Değişiklikler otomatik kaydediliyor</span>
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => { setUsers(loadLS(LS_USERS, DEFAULT_USERS)); setStations(loadLS(LS_STATIONS, DEFAULT_STATIONS)); toast.info('Veriler yenilendi'); }}>
            <RefreshCw className="w-3 h-3" /> Yenile
          </Button>
        </div>
      </div>

      {/* Close action menu on outside click */}
      {userActionMenu && <div className="fixed inset-0 z-[1999]" onClick={() => setUserActionMenu(null)} />}
    </div>
  );
}