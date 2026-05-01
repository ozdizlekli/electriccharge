import { X, Calendar, Clock, MapPin, CreditCard, Star, Settings, User, LogOut, Award, Heart, Bell, Receipt, Plus, Edit } from 'lucide-react';
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
import React, { useState } from 'react';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 532 123 4567'
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
    updates: true
  });

  const upcomingReservations = reservations.filter(r => r.status === 'upcoming');
  const completedReservations = reservations.filter(r => r.status === 'completed');

  const totalSpent = completedReservations.reduce((sum, r) => sum + r.price, 0);
  const totalSessions = completedReservations.length;

  const handleLogout = () => {
    toast.success('Başarıyla çıkış yapıldı');
    setTimeout(() => { onClose(); }, 1000);
  };

  const handleSavePersonalInfo = () => {
    setEditingPersonalInfo(false);
    toast.success('Kişisel bilgileriniz güncellendi');
  };

  const handleCancelReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    toast.success('Rezervasyon başarıyla iptal edildi');
  };

  const handleViewReservationDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationDetail(true);
  };

  const handleAddCard = () => {
    setCardModalMode('add');
    setSelectedCard(null);
    setShowCardModal(true);
  };

  const handleEditCard = (card: PaymentMethod) => {
    setCardModalMode('edit');
    setSelectedCard(card);
    setShowCardModal(true);
  };

  return (
    <>
    {/* FIXED: z-[9999] to render above Leaflet map */}
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-lg max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Profilim</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">AY</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{personalInfo.name}</h4>
              <p className="text-sm text-muted-foreground">{personalInfo.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Premium Üye
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="bg-blue-50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
                <div className="text-xs text-muted-foreground">Toplam Şarj</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{totalSpent.toFixed(0)} ₺</div>
                <div className="text-xs text-muted-foreground">Toplam Harcama</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">4.8</div>
                <div className="text-xs text-muted-foreground">Kullanıcı Puanı</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="reservations" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger value="reservations" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Rezervasyonlar</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Ödeme Yöntemleri</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Ayarlar</TabsTrigger>
            </TabsList>

            <TabsContent value="reservations" className="p-4 space-y-4">
              {upcomingReservations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Yaklaşan Rezervasyonlar</h4>
                  {upcomingReservations.map((reservation) => (
                    <Card key={reservation.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold mb-1">{reservation.stationName}</h5>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{reservation.startTime.toLocaleDateString('tr-TR')}</span>
                              <Clock className="w-3 h-3 ml-2" />
                              <span>{reservation.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">Yaklaşan</Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Süre: {reservation.estimatedDuration} dk</span>
                          <span className="font-semibold">{reservation.price} ₺</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewReservationDetails(reservation)}>Detaylar</Button>
                          <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleCancelReservation(reservation.id)}>İptal Et</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Geçmiş Rezervasyonlar</h4>
                {completedReservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold mb-1">{reservation.stationName}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{reservation.startTime.toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <Badge variant="outline">Tamamlandı</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Süre: {reservation.estimatedDuration} dk</span>
                        <span className="font-semibold">{reservation.price} ₺</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Kayıtlı Kartlarım</h4>
                <Button size="sm" onClick={handleAddCard}>
                  <CreditCard className="w-3 h-3 mr-2" />
                  Yeni Kart Ekle
                </Button>
              </div>
              {mockPaymentMethods.map((method) => (
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
                          <div className="text-sm text-muted-foreground">•••• •••• •••• {method.cardNumber}</div>
                          <div className="text-xs text-muted-foreground">{method.cardHolder} • {method.expiryDate}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCard(method)}>Düzenle</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Kişisel Bilgiler</div>
                        <div className="text-xs text-muted-foreground">İsim, e-posta, telefon</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPersonalInfo(!editingPersonalInfo)}>
                      {editingPersonalInfo ? 'İptal' : 'Düzenle'}
                    </Button>
                  </div>
                  {editingPersonalInfo && (
                    <div className="space-y-3 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input id="name" value={personalInfo.name} onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input id="email" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                      </div>
                      <Button className="w-full" onClick={handleSavePersonalInfo}>Kaydet</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setShowFavorites(true)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Favori İstasyonlar</div>
                    <div className="text-xs text-muted-foreground">Sık kullandığınız istasyonlar</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setShowNotifications(true)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Bildirimler</div>
                    <div className="text-xs text-muted-foreground">Bildirim tercihlerinizi yönetin</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setShowInvoices(true)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Faturalar</div>
                    <div className="text-xs text-muted-foreground">Ödeme geçmişi ve faturalar</div>
                  </div>
                </CardContent>
              </Card>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

    {showReservationDetail && selectedReservation && (
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Rezervasyon Detayları</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowReservationDetail(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="p-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">{selectedReservation.stationName}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tarih</span><span className="font-medium">{selectedReservation.startTime.toLocaleDateString('tr-TR')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Başlangıç Saati</span><span className="font-medium">{selectedReservation.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bitiş Saati</span><span className="font-medium">{selectedReservation.endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Süre</span><span className="font-medium">{selectedReservation.estimatedDuration} dakika</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Toplam Tutar</span><span className="text-green-600">{selectedReservation.price} ₺</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ödeme Durumu</span><Badge variant="outline" className="bg-green-50">Ödendi</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )}

    {showCardModal && (
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
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
            <Button className="w-full" onClick={() => { toast.success(cardModalMode === 'add' ? 'Kart eklendi' : 'Kart güncellendi'); setShowCardModal(false); }}>
              {cardModalMode === 'add' ? 'Kartı Ekle' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </div>
    )}

    {showFavorites && (
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-lg max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Favori İstasyonlar</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowFavorites(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favoriteStations.map((station) => (
              <Card key={station.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{station.name}</h4>
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{station.address}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span>{station.rating}</span></div>
                        <span className="text-muted-foreground">{station.distance} km</span>
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
        <div className="bg-white w-full md:max-w-lg md:rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Bildirim Ayarları</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="p-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div><div className="font-medium">Rezervasyon Bildirimleri</div><div className="text-sm text-muted-foreground">Rezervasyonlarınızla ilgili bildirimler</div></div>
                  <Switch checked={notificationSettings.reservations} onCheckedChange={(c) => setNotificationSettings({...notificationSettings, reservations: c})} />
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between mb-4">
                  <div><div className="font-medium">Kampanya Bildirimleri</div><div className="text-sm text-muted-foreground">İndirim ve kampanyalar</div></div>
                  <Switch checked={notificationSettings.promotions} onCheckedChange={(c) => setNotificationSettings({...notificationSettings, promotions: c})} />
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div><div className="font-medium">Uygulama Güncellemeleri</div><div className="text-sm text-muted-foreground">Yeni özellikler</div></div>
                  <Switch checked={notificationSettings.updates} onCheckedChange={(c) => setNotificationSettings({...notificationSettings, updates: c})} />
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={() => { toast.success('Kaydedildi'); setShowNotifications(false); }}>Kaydet</Button>
          </div>
        </div>
      </div>
    )}

    {showInvoices && (
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-lg max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Faturalar</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowInvoices(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {completedReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{reservation.stationName}</h4>
                      <div className="text-sm text-muted-foreground">{reservation.startTime.toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{reservation.price} ₺</div>
                      <Badge variant="outline" className="text-xs mt-1">Ödendi</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info('Fatura indiriliyor...')}>
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