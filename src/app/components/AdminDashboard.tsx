import React, { useState } from 'react';
import {
  X, Users, Building2, DollarSign, TrendingUp, Shield, CheckCircle,
  XCircle, AlertTriangle, MoreHorizontal, Search, Filter, RefreshCw,
  ChevronDown, Eye, Ban, UserCheck, UserX, Zap, Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onClose: () => void;
}

type UserRole = 'driver' | 'station_owner' | 'admin';
type UserStatus = 'active' | 'suspended' | 'pending';
type StationStatus = 'active' | 'pending_approval' | 'suspended';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  totalSessions: number;
  totalSpent: number;
  initials: string;
}

interface AdminStation {
  id: string;
  name: string;
  owner: string;
  city: string;
  brand: string;
  status: StationStatus;
  totalPoints: number;
  monthlyRevenue: number;
  submittedDate: string;
  rating: number;
}

const mockUsers: AdminUser[] = [
  { id: 'u1', name: 'Hatice Çevik', email: 'hatice@gmail.com', role: 'driver', status: 'active', joinDate: '2024-03-15', totalSessions: 47, totalSpent: 1240, initials: 'HÇ' },
  { id: 'u2', name: 'Ahmet Yılmaz', email: 'ahmet@mail.com', role: 'station_owner', status: 'active', joinDate: '2024-01-08', totalSessions: 12, totalSpent: 320, initials: 'AY' },
  { id: 'u3', name: 'Zeynep Kaya', email: 'zeynep@gmail.com', role: 'driver', status: 'suspended', joinDate: '2024-05-20', totalSessions: 3, totalSpent: 85, initials: 'ZK' },
  { id: 'u4', name: 'Mehmet Arslan', email: 'mehmet@hotmail.com', role: 'driver', status: 'active', joinDate: '2024-02-11', totalSessions: 89, totalSpent: 2650, initials: 'MA' },
  { id: 'u5', name: 'Fatma Demir', email: 'fatma@gmail.com', role: 'station_owner', status: 'pending', joinDate: '2025-04-28', totalSessions: 0, totalSpent: 0, initials: 'FD' },
  { id: 'u6', name: 'Can Öztürk', email: 'can@yandex.com', role: 'driver', status: 'active', joinDate: '2023-11-30', totalSessions: 134, totalSpent: 4100, initials: 'CÖ' },
  { id: 'u7', name: 'Selin Aydın', email: 'selin@gmail.com', role: 'driver', status: 'active', joinDate: '2024-07-01', totalSessions: 22, totalSpent: 610, initials: 'SA' },
];

const mockStations: AdminStation[] = [
  { id: 's1', name: 'İzmir Konak Pier Şarj', owner: 'Ahmet Yılmaz', city: 'İzmir', brand: 'Eşarj', status: 'active', totalPoints: 6, monthlyRevenue: 18400, submittedDate: '2024-01-08', rating: 4.7 },
  { id: 's2', name: 'Bornova Forum Şarj', owner: 'Eşarj A.Ş.', city: 'İzmir', brand: 'Eşarj', status: 'active', totalPoints: 4, monthlyRevenue: 12100, submittedDate: '2024-02-14', rating: 4.5 },
  { id: 's3', name: 'Karşıyaka Marina Şarj', owner: 'Fatma Demir', city: 'İzmir', brand: 'ZES', status: 'pending_approval', totalPoints: 8, monthlyRevenue: 0, submittedDate: '2025-04-28', rating: 0 },
  { id: 's4', name: 'Balçova AVM Şarj', owner: 'Voltrun Ltd.', city: 'İzmir', brand: 'Voltrun', status: 'active', totalPoints: 3, monthlyRevenue: 7800, submittedDate: '2024-03-22', rating: 4.3 },
  { id: 's5', name: 'Alsancak Kordon Şarj', owner: 'Hasan Kurt', city: 'İzmir', brand: 'ZES', status: 'suspended', totalPoints: 2, monthlyRevenue: 0, submittedDate: '2023-12-05', rating: 3.1 },
  { id: 's6', name: 'Narlıdere Çarşı Şarj', owner: 'Trugo A.Ş.', city: 'İzmir', brand: 'Trugo', status: 'pending_approval', totalPoints: 5, monthlyRevenue: 0, submittedDate: '2025-04-30', rating: 0 },
];

const kpis = [
  { label: 'Toplam Kullanıcı', value: '12,847', change: '+8.2%', trend: 'up', icon: Users, color: 'blue', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Platform Geliri (Bu Ay)', value: '₺284,600', change: '+14.5%', trend: 'up', icon: DollarSign, color: 'green', bg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Kayıtlı İstasyonlar', value: '342', change: '+3 bekliyor', trend: 'neutral', icon: Building2, color: 'purple', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { label: 'Aktif Şarj Oturumu', value: '1,204', change: 'Anlık', trend: 'live', icon: Activity, color: 'orange', bg: 'bg-orange-50', iconColor: 'text-orange-600' },
];

const roleLabels: Record<UserRole, string> = {
  driver: 'Sürücü',
  station_owner: 'İstasyon Sahibi',
  admin: 'Admin',
};

const roleColors: Record<UserRole, string> = {
  driver: 'bg-blue-100 text-blue-700',
  station_owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

const statusColors: Record<UserStatus | StationStatus, string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  pending_approval: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<UserStatus | StationStatus, string> = {
  active: 'Aktif',
  suspended: 'Askıya Alındı',
  pending: 'Beklemede',
  pending_approval: 'Onay Bekliyor',
};

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [stations, setStations] = useState<AdminStation[]>(mockStations);
  const [userSearch, setUserSearch] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [userActionMenu, setUserActionMenu] = useState<string | null>(null);
  const [stationActionMenu, setStationActionMenu] = useState<string | null>(null);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
    s.owner.toLowerCase().includes(stationSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const pendingStations = stations.filter(s => s.status === 'pending_approval').length;

  function changeUserRole(userId: string, newRole: UserRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success(`Kullanıcı rolü "${roleLabels[newRole]}" olarak güncellendi`);
    setUserActionMenu(null);
  }

  function toggleUserStatus(userId: string) {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newStatus: UserStatus = u.status === 'active' ? 'suspended' : 'active';
      toast.success(`Kullanıcı ${newStatus === 'active' ? 'aktif edildi' : 'askıya alındı'}`);
      return { ...u, status: newStatus };
    }));
    setUserActionMenu(null);
  }

  function approveStation(stationId: string) {
    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: 'active' } : s));
    toast.success('İstasyon onaylandı ve yayına alındı');
    setStationActionMenu(null);
  }

  function suspendStation(stationId: string) {
    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: 'suspended' } : s));
    toast.success('İstasyon askıya alındı');
    setStationActionMenu(null);
  }

  function reactivateStation(stationId: string) {
    setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: 'active' } : s));
    toast.success('İstasyon yeniden aktif edildi');
    setStationActionMenu(null);
  }

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
          <div className="flex items-center gap-3">
            {pendingStations > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg px-3 py-1.5 text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {pendingStations} istasyon onay bekliyor
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* KPI Row */}
          <div className="p-5 pb-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="border-0 shadow-sm">
                  <CardContent className={`p-4 ${kpi.bg} rounded-xl`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
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
                          <TrendingUp className="w-3 h-3" />
                          {kpi.change}
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
          </div>

          {/* Tabs */}
          <div className="p-5">
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
              </TabsList>

              {/* ── USERS TAB ── */}
              <TabsContent value="users">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ad veya e-posta ara..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <Card key={user.id} className={`transition-all ${user.status === 'suspended' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className={`text-sm font-semibold ${
                              user.role === 'admin' ? 'bg-red-100 text-red-700' :
                              user.role === 'station_owner' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{user.name}</span>
                              <Badge className={`text-xs border-0 ${roleColors[user.role]}`}>
                                {roleLabels[user.role]}
                              </Badge>
                              <Badge className={`text-xs border-0 ${statusColors[user.status]}`}>
                                {statusLabels[user.status]}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{user.totalSessions} oturum</span>
                              <span>₺{user.totalSpent.toLocaleString('tr-TR')} harcama</span>
                              <span>Katıldı: {new Date(user.joinDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>

                          <div className="relative flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => setUserActionMenu(userActionMenu === user.id ? null : user.id)}
                            >
                              İşlem <ChevronDown className="w-3 h-3" />
                            </Button>

                            {userActionMenu === user.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-10 py-1 min-w-[180px]">
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Rol Değiştir</div>
                                {(['driver', 'station_owner', 'admin'] as UserRole[]).map(role => (
                                  <button
                                    key={role}
                                    onClick={() => changeUserRole(user.id, role)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${user.role === role ? 'text-blue-600 font-medium' : ''}`}
                                  >
                                    {user.role === role && <CheckCircle className="w-3.5 h-3.5" />}
                                    {user.role !== role && <div className="w-3.5 h-3.5" />}
                                    {roleLabels[role]}
                                  </button>
                                ))}
                                <Separator className="my-1" />
                                <button
                                  onClick={() => toggleUserStatus(user.id)}
                                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${user.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                                >
                                  {user.status === 'active' ? (
                                    <><UserX className="w-3.5 h-3.5" /> Askıya Al</>
                                  ) : (
                                    <><UserCheck className="w-3.5 h-3.5" /> Aktif Et</>
                                  )}
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

              {/* ── STATIONS TAB ── */}
              <TabsContent value="stations">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="İstasyon adı, sahip veya şehir ara..."
                      value={stationSearch}
                      onChange={e => setStationSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Pending approval banner */}
                {stations.filter(s => s.status === 'pending_approval').length > 0 && (
                  <Card className="bg-orange-50 border-orange-200 mb-4">
                    <CardContent className="p-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <p className="text-sm text-orange-800">
                        <strong>{stations.filter(s => s.status === 'pending_approval').length} yeni istasyon</strong> onay bekliyor. İnceleyin ve onaylayın veya reddedin.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {filteredStations.map(station => (
                    <Card
                      key={station.id}
                      className={`transition-all ${
                        station.status === 'pending_approval' ? 'border-orange-300 bg-orange-50/30' :
                        station.status === 'suspended' ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            station.status === 'pending_approval' ? 'bg-orange-100' :
                            station.status === 'suspended' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <Zap className={`w-5 h-5 ${
                              station.status === 'pending_approval' ? 'text-orange-600' :
                              station.status === 'suspended' ? 'text-red-600' : 'text-green-600'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-sm">{station.name}</span>
                              <Badge className={`text-xs border-0 ${statusColors[station.status]}`}>
                                {statusLabels[station.status]}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{station.brand}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sahip: {station.owner} · {station.city} · {station.totalPoints} şarj noktası
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {station.status === 'active' && (
                                <span className="text-green-600 font-medium">₺{station.monthlyRevenue.toLocaleString('tr-TR')}/ay gelir</span>
                              )}
                              {station.rating > 0 && <span>⭐ {station.rating}</span>}
                              <span>Başvuru: {new Date(station.submittedDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {station.status === 'pending_approval' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                  onClick={() => approveStation(station.id)}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Onayla
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8"
                                  onClick={() => suspendStation(station.id)}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Reddet
                                </Button>
                              </>
                            )}
                            {station.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8"
                                onClick={() => suspendStation(station.id)}
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                Askıya Al
                              </Button>
                            )}
                            {station.status === 'suspended' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-600 hover:bg-green-50 text-xs h-8"
                                onClick={() => reactivateStation(station.id)}
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                Aktif Et
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
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 bg-gray-50 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <span>eŞarj Admin · Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.info('Veriler yenilendi')}>
            <RefreshCw className="w-3 h-3" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {(userActionMenu || stationActionMenu) && (
        <div
          className="fixed inset-0 z-[1999]"
          onClick={() => { setUserActionMenu(null); setStationActionMenu(null); }}
        />
      )}
    </div>
  );
}