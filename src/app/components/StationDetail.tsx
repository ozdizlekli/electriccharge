import React, { useState } from 'react';
import { X, MapPin, Star, Clock, Zap, Info, CreditCard, AlertTriangle, MessageSquare, Play } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ReservationModal } from './ReservationModal';
import { LiveChargingSimulation } from './LiveChargingSimulation';
import { AIDamageReport } from './AIDamageReport';
import { CommunityReviews } from './CommunityReviews';

interface StationDetailProps {
  station: Station;
  onClose: () => void;
}

export function StationDetail({ station, onClose }: StationDetailProps) {
  const [selectedPoint, setSelectedPoint] = useState<ChargingPoint | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [showLiveCharging, setShowLiveCharging] = useState(false);
  const [showAIDamage, setShowAIDamage] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [liveChargingPoint, setLiveChargingPoint] = useState<ChargingPoint | null>(null);

  const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;

  const handleReserve = (point: ChargingPoint) => {
    setSelectedPoint(point);
    setShowReservation(true);
  };

  const handleStartCharging = (point: ChargingPoint) => {
    setLiveChargingPoint(point);
    setShowLiveCharging(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-3xl md:rounded-lg max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative">
            <img 
              src={station.images && station.images.length > 0 ? station.images[0] : 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?q=80&w=800&auto=format&fit=crop'} 
              alt={station.name}
              className="w-full h-48 object-cover bg-slate-100"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?q=80&w=800&auto=format&fit=crop'; }}
            />
            <Button 
              variant="secondary" 
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-lg"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title Section */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">{station.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{station.address}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">{station.brand}</Badge>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{station.rating}</span>
                  <span className="text-sm text-muted-foreground">({station.totalReviews} değerlendirme)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{station.isOpen24Hours ? '24 Saat Açık' : station.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons - NEW FEATURES */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setShowCommunity(true)}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-medium">Topluluk</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 gap-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => setShowAIDamage(true)}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-medium">Hasar Bildir</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 gap-1 border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => {
                  const availablePoint = station.chargingPoints.find(cp => cp.status === 'available');
                  if (availablePoint) {
                    handleStartCharging(availablePoint);
                  } else {
                     alert("Şu an müsait şarj noktası bulunmuyor.");
                  }
                }}
              >
                <Play className="w-5 h-5" />
                <span className="text-xs font-medium">Şarj Başlat</span>
              </Button>
            </div>

            {/* Availability Status */}
            <Card className="mb-5 bg-gradient-to-r from-blue-50 to-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${availablePoints > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-semibold">
                        {availablePoints > 0 ? `${availablePoints} Şarj Noktası Müsait` : 'Tüm Noktalar Dolu'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Toplam {station.chargingPoints.length} şarj noktası
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Mesafe</div>
                    <div className="font-semibold">{station.distance} km</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="charging" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="charging">Şarj Noktaları</TabsTrigger>
                <TabsTrigger value="amenities">Olanaklar</TabsTrigger>
                <TabsTrigger value="info">Bilgiler</TabsTrigger>
              </TabsList>

              <TabsContent value="charging" className="space-y-3 mt-4">
                {station.chargingPoints.map((point) => (
                  <Card key={point.id} className={point.status === 'available' ? 'border-green-200' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="font-semibold">{point.type} - {point.power} kW</span>
                            <Badge variant={point.status === 'available' ? 'default' : 'secondary'}>
                              {point.status === 'available' ? 'Müsait' : 
                               point.status === 'occupied' ? 'Dolu' : 'Bakımda'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Konnektör: {point.connector}
                          </div>
                          {point.status === 'occupied' && point.currentUser && (
                            <div className="flex items-center gap-1 text-sm text-orange-600">
                              <Clock className="w-3 h-3" />
                              <span>{point.currentUser.remainingMinutes} dakika sonra boşalacak</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <div className="font-semibold text-lg">{point.price} ₺/kWh</div>
                          {point.status === 'available' && (
                            <div className="flex flex-col gap-1">
                              <Button size="sm" onClick={() => handleReserve(point)}>
                                Rezervasyon
                              </Button>
                              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleStartCharging(point)}>
                                <Play className="w-3 h-3 mr-1" />
                                Şarj Et
                              </Button>
                            </div>
                          )}
                          {point.status === 'occupied' && point.currentUser && point.currentUser.remainingMinutes <= 60 && (
                            <Button size="sm" variant="outline" onClick={() => handleReserve(point)}>
                              Ön Rezervasyon
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="amenities" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {station.amenities.map((amenity, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Info className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{amenity}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="info" className="mt-4 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Çalışma Saatleri</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{station.isOpen24Hours ? '24 Saat Hizmet' : station.openingHours}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Fiyatlandırma</h4>
                    <div className="space-y-2 text-sm">
                      {station.chargingPoints.map((point, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{point.type} ({point.power} kW)</span>
                          <span className="font-medium">{point.price} ₺/kWh</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Ödeme Yöntemleri</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>Kredi Kartı, Banka Kartı, Dijital Cüzdan, QR Kod</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showReservation && selectedPoint && (
        <ReservationModal
          station={station}
          chargingPoint={selectedPoint}
          onClose={() => { setShowReservation(false); setSelectedPoint(null); }}
        />
      )}

      {showLiveCharging && liveChargingPoint && (
        <LiveChargingSimulation
          station={station}
          chargingPoint={liveChargingPoint}
          onClose={() => { setShowLiveCharging(false); setLiveChargingPoint(null); }}
        />
      )}

      {showAIDamage && (
        <AIDamageReport
          station={station}
          onClose={() => setShowAIDamage(false)}
        />
      )}

      {showCommunity && (
        <CommunityReviews
          station={station}
          onClose={() => setShowCommunity(false)}
        />
      )}
    </>
  );
}