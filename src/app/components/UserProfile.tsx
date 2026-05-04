import { X, Calendar, Clock, MapPin, CreditCard, Star, User, LogOut, Award, Heart, Bell, Receipt, Zap, Shield, Trophy, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { mockReservations, mockPaymentMethods, mockStations } from '../data/mockData';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Reservation, PaymentMethod } from '../types/station';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import React, { useState, useMemo } from 'react';

interface UserProfileProps {
  onClose: () => void;
}

// ── Gamification helpers ──────────────────────────────────────────────────────

interface EarnedBadge {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

function computeGamification() {
  let points = 0;
  const badges: EarnedBadge[] = [];

  // +50 per AI damage report
  try {
    const reports = JSON.parse(localStorage.getItem('ai_damage_reports') || '[]');
    points += reports.length * 50;
    if (reports.length >= 1) {
      badges.push({
        id: 'first_reporter',
        icon: '🔍',
        label: 'İlk Raporcu',
        description: 'İlk AI hasar bildirimi',
        color: 'bg-orange-100 text-orange-700 border-zinc-700',
      });
    }
    if (reports.length >= 5) {
      badges.push({
        id: 'guardian',
        icon: '🛡️',
        label: 'İstasyon Koruyucusu',
        description: '5+ hasar bildirimi',
        color: 'bg-red-100 text-red-700 border-zinc-700',
      });
    }
  } catch {}

  // +30 per completed reservation
  const completedCount = mockReservations.filter(r => r.status === 'completed').length;
  points += completedCount * 30;

  // +10 per community review in localStorage
  try {
    const reviews = JSON.parse(localStorage.getItem('esarj_community_reviews') || '[]');
    const userReviews = reviews.filter((r: any) => r.author === 'Siz (Sürücü)');
    points += userReviews.length * 10;
    if (userReviews.length >= 1) {
      badges.push({
        id: 'reviewer',
        icon: '⭐',
        label: 'Topluluk Üyesi',
        description: 'İlk değerlendirme',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      });
    }
  } catch {}

  // Base points for being registered
  points += 100;
  badges.push({
    id: 'eco_driver',
    icon: '🌿',
    label: 'Eko Sürücü',
    description: 'Elektrikli araç kullanıcısı',
    color: 'bg-green-100 text-green-700 border-zinc-700',
  });

  if (completedCount >= 1) {
    badges.push({
      id: 'charged',
      icon: '⚡',
      label: 'İlk Şarj',
      description: 'İlk şarj oturumu tamamlandı',
      color: 'bg-blue-100 text-emerald-300 border-zinc-700',
    });
  }

  // Level system
  const level = points < 200 ? 1 : points < 500 ? 2 : points < 1000 ? 3 : 4;
  const levelNames = ['', 'Başlangıç', 'Gezgin', 'Şampion', 'Efsane'];
  const nextLevelThreshold = level === 1 ? 200 : level === 2 ? 500 : level === 3 ? 1000 : 2000;
  const prevThreshold = level === 1 ? 0 : level === 2 ? 200 : level === 3 ? 500 : 1000;
  const progress = Math.min(100, Math.round(((points - prevThreshold) / (nextLevelThreshold - prevThreshold)) * 100));

  return { points, badges, level, levelName: levelNames[level], nextLevelThreshold, progress };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserProfile({ onClose }: UserProfileProps) {
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 532 123 4567',
  });
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationDetail, setShowReservationDetail] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [favoriteStations, setFavoriteStations] = useState([mockStations[0], mockStations[3]]);
  const [notificationSettings, setNotificationSettings] = useState({
    reservations: true,
    promotions: false,
    updates: true,
  });

  const gamification = useMemo(() => computeGamification(), []);

  const upcomingReservations = reservations.filter(r => r.status === 'upcoming');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const totalSpent = completedReservations.reduce((sum, r) => sum + r.price, 0);
  const totalSessions = completedReservations.length;

  const handleLogout = () => {
    toast.success('Başarıyla çıkış yapıldı');
    setTimeout(() => onClose(), 1000);
  };

  const handleSavePersonalInfo = () => {
    setEditingPersonalInfo(false);
    toast.success('Kişisel bilgileriniz güncellendi');
  };

  const handleCancelReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    toast.success('Rezervasyon iptal edildi');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-zinc-900 w-full md:max-w-2xl md:rounded-lg max-h-[95vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Profilim</h3>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-100 text-emerald-300 text-xl">AY</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{personalInfo.name}</h4>
                <p className="text-sm text-zinc-400">{personalInfo.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Premium Üye
                  </Badge>
                  <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    {gamification.levelName}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <Card className="bg-zinc-800/40">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{totalSessions}</div>
                  <div className="text-xs text-zinc-400">Toplam Şarj</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/40">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{totalSpent.toFixed(0)} ₺</div>
                  <div className="text-xs text-zinc-400">Toplam Harcama</div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">{gamification.points}</div>
                  <div className="text-xs text-zinc-400">e-Puan</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="rewards" className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300">
              <TabsList className="w-full justify-start border-b border-zinc-800 rounded-none h-auto p-0 overflow-x-auto">
                <TabsTrigger value="rewards" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 whitespace-nowrap">
                  🏆 Ödüller
                </TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 whitespace-nowrap">
                  Rezervasyonlar
                </TabsTrigger>
                <TabsTrigger value="payments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 whitespace-nowrap">
                  Ödeme
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 whitespace-nowrap">
                  Ayarlar
                </TabsTrigger>
              </TabsList>

              {/* ── REWARDS TAB ── */}
              <TabsContent value="rewards" className="p-4 space-y-4">

                {/* Level progress */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-900">Seviye {gamification.level} — {gamification.levelName}</div>
                          <div className="text-xs text-amber-700">{gamification.points} / {gamification.nextLevelThreshold} e-Puan</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-amber-600">{gamification.points}</div>
                    </div>
                    <Progress value={gamification.progress} className="h-2.5" />
                    <p className="text-xs text-amber-700 mt-2">
                      Sonraki seviyeye {gamification.nextLevelThreshold - gamification.points} puan kaldı
                    </p>
                  </CardContent>
                </Card>

                {/* Points breakdown */}
                <div>
                  <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide mb-3">Puan Kazanma Yolları</h4>
                  <div className="space-y-2">
                    {[
                      { icon: '🔍', action: 'AI Hasar Bildirimi', points: '+50 puan', color: 'text-orange-600' },
                      { icon: '⭐', action: 'Değerlendirme Yaz', points: '+10 puan', color: 'text-yellow-600' },
                      { icon: '⚡', action: 'Şarj Oturumu Tamamla', points: '+30 puan', color: 'text-emerald-400' },
                      { icon: '📍', action: 'Durum Bildirimi', points: '+5 puan', color: 'text-emerald-400' },
                    ].map(item => (
                      <div key={item.action} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium">{item.action}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.color}`}>{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h4 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide mb-3">
                    Rozetlerim ({gamification.badges.length})
                  </h4>
                  {gamification.badges.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center text-zinc-400">
                        <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Henüz rozet kazanmadınız.</p>
                        <p className="text-xs mt-1">AI hasar bildirimi yaparak başlayın!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {gamification.badges.map(badge => (
                        <Card key={badge.id} className={`border ${badge.color.includes('border') ? '' : 'border-zinc-800'}`}>
                          <CardContent className={`p-3 ${badge.color.split(' ').slice(0, 2).join(' ')} rounded-xl`}>
                            <div className="flex items-start gap-2">
                              <span className="text-2xl">{badge.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">{badge.label}</div>
                                <div className="text-xs opacity-80 mt-0.5">{badge.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Locked badges */}
                      {[
                        { icon: '💎', label: 'Platin Sürücü', description: '1000 puana ulaş' },
                        { icon: '🏅', label: 'Süper Raporcu', description: '10 hasar bildirimi' },
                      ].map(locked => (
                        <Card key={locked.label} className="border-dashed opacity-50">
                          <CardContent className="p-3 bg-zinc-950 rounded-xl">
                            <div className="flex items-start gap-2">
                              <span className="text-2xl grayscale">{locked.icon}</span>
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-gray-500">{locked.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{locked.description}</div>
                                <Badge variant="outline" className="text-xs mt-1">Kilitli 🔒</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Redeem */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-purple-900">Puanlarınızı Kullanın</div>
                      <div className="text-xs text-purple-700 mt-0.5">
                        {gamification.points >= 200
                          ? `${gamification.points} puanınız var. Yakında ödül kataloğu açılacak!`
                          : `${200 - gamification.points} puan daha kazanarak ödülleri açabilirsiniz.`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── RESERVATIONS TAB ── */}
              <TabsContent value="reservations" className="p-4 space-y-4">
                {upcomingReservations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-zinc-400">Yaklaşan Rezervasyonlar</h4>
                    {upcomingReservations.map(r => (
                      <Card key={r.id} className="border-zinc-700 bg-zinc-800/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold mb-1">{r.stationName}</h5>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Calendar className="w-3 h-3" />
                                <span>{r.startTime.toLocaleDateString('tr-TR')}</span>
                                <Clock className="w-3 h-3 ml-2" />
                                <span>{r.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <Badge className="bg-blue-600">Yaklaşan</Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Süre: {r.estimatedDuration} dk</span>
                            <span className="font-semibold">{r.price} ₺</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedReservation(r); setShowReservationDetail(true); }}>Detaylar</Button>
                            <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleCancelReservation(r.id)}>İptal Et</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-zinc-400">Geçmiş Rezervasyonlar</h4>
                  {completedReservations.map(r => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold mb-1">{r.stationName}</h5>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Calendar className="w-3 h-3" />
                              <span>{r.startTime.toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                          <Badge variant="outline">Tamamlandı</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">Süre: {r.estimatedDuration} dk</span>
                          <span className="font-semibold">{r.price} ₺</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── PAYMENTS TAB ── */}
              <TabsContent value="payments" className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Kayıtlı Kartlarım</h4>
                  <Button size="sm" onClick={() => { setCardModalMode('add'); setSelectedCard(null); setShowCardModal(true); }}>
                    <CreditCard className="w-3 h-3 mr-2" />
                    Yeni Kart Ekle
                  </Button>
                </div>
                {mockPaymentMethods.map(method => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{method.type === 'credit' ? 'Kredi Kartı' : 'Banka Kartı'}</span>
                              {method.isDefault && <Badge variant="secondary" className="text-xs">Varsayılan</Badge>}
                            </div>
                            <div className="text-sm text-zinc-400">•••• •••• •••• {method.cardNumber}</div>
                            <div className="text-xs text-zinc-400">{method.cardHolder} • {method.expiryDate}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setCardModalMode('edit'); setSelectedCard(method); setShowCardModal(true); }}>Düzenle</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── SETTINGS TAB ── */}
              <TabsContent value="settings" className="p-4 space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-zinc-400" />
                        <div>
                          <div className="font-medium">Kişisel Bilgiler</div>
                          <div className="text-xs text-zinc-400">İsim, e-posta, telefon</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEditingPersonalInfo(!editingPersonalInfo)}>
                        {editingPersonalInfo ? 'İptal' : 'Düzenle'}
                      </Button>
                    </div>
                    {editingPersonalInfo && (
                      <div className="space-y-3 mt-4">
                        <div className="space-y-2">
                          <Label>Ad Soyad</Label>
                          <Input value={personalInfo.name} onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>E-posta</Label>
                          <Input type="email" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefon</Label>
                          <Input value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                        </div>
                        <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={handleSavePersonalInfo}>Kaydet</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-zinc-950" onClick={() => setShowFavorites(true)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <div className="flex-1">
                      <div className="font-medium">Favori İstasyonlar</div>
                      <div className="text-xs text-zinc-400">Sık kullandığınız istasyonlar</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-zinc-950" onClick={() => setShowNotifications(true)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-zinc-400" />
                    <div className="flex-1">
                      <div className="font-medium">Bildirimler</div>
                      <div className="text-xs text-zinc-400">Bildirim tercihlerinizi yönetin</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-zinc-950" onClick={() => setShowInvoices(true)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    <div className="flex-1">
                      <div className="font-medium">Faturalar</div>
                      <div className="text-xs text-zinc-400">Ödeme geçmişi ve faturalar</div>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-4" />

                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-zinc-800/40" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showReservationDetail && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Rezervasyon Detayları</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowReservationDetail(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">{selectedReservation.stationName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-400">Tarih</span><span className="font-medium">{selectedReservation.startTime.toLocaleDateString('tr-TR')}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Başlangıç</span><span className="font-medium">{selectedReservation.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Süre</span><span className="font-medium">{selectedReservation.estimatedDuration} dakika</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold"><span>Toplam</span><span className="text-emerald-400">{selectedReservation.price} ₺</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Ödeme</span><Badge variant="outline" className="bg-zinc-800/40">Ödendi</Badge></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">{cardModalMode === 'add' ? 'Yeni Kart Ekle' : 'Kartı Düzenle'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCardModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2"><Label>Kart Numarası</Label><Input placeholder="1234 5678 9012 3456" defaultValue={selectedCard ? `•••• •••• •••• ${selectedCard.cardNumber}` : ''} /></div>
              <div className="space-y-2"><Label>Kart Üzerindeki İsim</Label><Input placeholder="AD SOYAD" defaultValue={selectedCard?.cardHolder || ''} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Son Kullanma</Label><Input placeholder="MM/YY" defaultValue={selectedCard?.expiryDate || ''} /></div>
                <div className="space-y-2"><Label>CVV</Label><Input type="password" placeholder="123" maxLength={3} /></div>
              </div>
              <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={() => { toast.success(cardModalMode === 'add' ? 'Kart eklendi' : 'Kart güncellendi'); setShowCardModal(false); }}>
                {cardModalMode === 'add' ? 'Kartı Ekle' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showFavorites && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Favori İstasyonlar</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFavorites(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {favoriteStations.map(station => (
                <Card key={station.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{station.name}</h4>
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </div>
                        <div className="text-sm text-zinc-400 mb-2">{station.address}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span>{station.rating}</span></div>
                          <span className="text-zinc-400">{station.distance} km</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFavoriteStations(prev => prev.filter(s => s.id !== station.id)); toast.success('Favorilerden kaldırıldı'); }}>Kaldır</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Bildirim Ayarları</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  {[
                    { key: 'reservations', label: 'Rezervasyon Bildirimleri', desc: 'Rezervasyonlarınızla ilgili' },
                    { key: 'promotions', label: 'Kampanya Bildirimleri', desc: 'İndirim ve kampanyalar' },
                    { key: 'updates', label: 'Uygulama Güncellemeleri', desc: 'Yeni özellikler' },
                  ].map((item, idx) => (
                    <React.Fragment key={item.key}>
                      {idx > 0 && <Separator className="my-3" />}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-zinc-400">{item.desc}</div>
                        </div>
                        <Switch
                          checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                          onCheckedChange={c => setNotificationSettings({ ...notificationSettings, [item.key]: c })}
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
              <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={() => { toast.success('Kaydedildi'); setShowNotifications(false); }}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {showInvoices && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Faturalar</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInvoices(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {completedReservations.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{r.stationName}</h4>
                        <div className="text-sm text-zinc-400">{r.startTime.toLocaleDateString('tr-TR')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{r.price} ₺</div>
                        <Badge variant="outline" className="text-xs mt-1">Ödendi</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={() => toast.info('Fatura indiriliyor...')}>
                      <Receipt className="w-3 h-3 mr-2" />
                      Faturayı İndir
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}