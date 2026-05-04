import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Zap, CreditCard, AlertCircle, TrendingUp, Leaf } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { PaymentModal } from './PaymentModal';
import { toast } from 'sonner';

interface ReservationModalProps {
  station: Station;
  chargingPoint: ChargingPoint;
  onClose: () => void;
}

// Peak hours: 17:00–20:00
const PEAK_START = 17;
const PEAK_END = 20;
const SURGE_MULTIPLIER = 1.15;
const ECO_MULTIPLIER = 0.90;

function getPricingTier(timeStr: string): 'peak' | 'eco' | 'normal' {
  if (!timeStr) {
    const h = new Date().getHours();
    if (h >= PEAK_START && h < PEAK_END) return 'peak';
    if (h >= 22 || h < 7) return 'eco';
    return 'normal';
  }
  const [hourStr] = timeStr.split(':');
  const h = parseInt(hourStr, 10);
  if (h >= PEAK_START && h < PEAK_END) return 'peak';
  if (h >= 22 || h < 7) return 'eco';
  return 'normal';
}

export function ReservationModal({ station, chargingPoint, onClose }: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [showPayment, setShowPayment] = useState(false);

  const isOccupied = chargingPoint.status === 'occupied';
  const availableFromMinutes = isOccupied ? chargingPoint.currentUser?.remainingMinutes || 0 : 0;

  const pricingTier = useMemo(() => getPricingTier(selectedTime), [selectedTime]);

  const effectivePrice = useMemo(() => {
    const base = chargingPoint.price;
    if (pricingTier === 'peak') return parseFloat((base * SURGE_MULTIPLIER).toFixed(2));
    if (pricingTier === 'eco') return parseFloat((base * ECO_MULTIPLIER).toFixed(2));
    return base;
  }, [chargingPoint.price, pricingTier]);

  const calculatePrice = () => {
    const durationHours = parseInt(duration) / 60;
    const estimatedKwh = chargingPoint.power * durationHours * 0.8;
    return (estimatedKwh * effectivePrice).toFixed(2);
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = isOccupied ? currentMinutes + availableFromMinutes : currentMinutes;

    for (let i = Math.ceil(startMinutes / 30) * 30; i < 24 * 60; i += 30) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getSlotLabel = (time: string) => {
    const [hourStr] = time.split(':');
    const h = parseInt(hourStr, 10);
    if (h >= PEAK_START && h < PEAK_END) return `${time} 🔴 Yoğun`;
    if (h >= 22 || h < 7) return `${time} 🟢 Eco`;
    return time;
  };

  const handleReservation = () => {
    if (!selectedTime) {
      toast.error('Lütfen bir saat seçin');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    toast.success('Rezervasyon başarıyla oluşturuldu!');
    onClose();
  };

  const PricingBadge = () => {
    if (pricingTier === 'peak') {
      return (
        <div className="flex items-center gap-2 p-3 bg-zinc-800/40 border border-zinc-700 rounded-xl">
          <TrendingUp className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-red-800">Yüksek Talep Dalgası</span>
              <Badge className="bg-red-100 text-red-700 border-zinc-700 border text-xs">+%15</Badge>
            </div>
            <p className="text-xs text-red-600 mt-0.5">Yoğun saat (17:00–20:00). Taban fiyata %15 ek uygulanıyor.</p>
          </div>
        </div>
      );
    }
    if (pricingTier === 'eco') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
          <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-400">Eco İndirim</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-900/30 text-xs">-%10</Badge>
            </div>
            <p className="text-xs text-emerald-500/80 mt-0.5">Gece saatleri indirimi aktif. Taban fiyata %10 indirim uygulanıyor.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-3 bg-zinc-800/40 border border-zinc-700 rounded-xl">
        <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-emerald-300">Normal tarife geçerli. Yoğun saatlerde fiyatlar artabilir.</p>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-lg">Rezervasyon Yap</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card className="bg-zinc-800/40">
              <CardContent className="p-4">
                <div className="font-semibold mb-1 text-zinc-100">{station.name}</div>
                <div className="text-sm text-zinc-400 mb-2">{station.address}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium text-zinc-100">
                    {chargingPoint.type} - {chargingPoint.power} kW - {chargingPoint.connector}
                  </span>
                </div>
              </CardContent>
            </Card>

            {isOccupied && (
              <Card className="bg-zinc-800/40 border-zinc-700">
                <CardContent className="p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-900">Bu nokta şu anda dolu</div>
                    <div className="text-orange-700">
                      Yaklaşık {availableFromMinutes} dakika sonra boşalacak.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarih
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Saat
               
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500">
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-zinc-950 border border-zinc-800 text-zinc-100">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {getSlotLabel(time)}
                      {isOccupied && time === timeSlots[0] && ' (En erken)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic pricing badge */}
            <PricingBadge />

            <div className="space-y-2">
              <Label>Tahmini Şarj Süresi</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-zinc-950 border border-zinc-800 text-zinc-100">
                  <SelectItem value="30">30 dakika</SelectItem>
                  <SelectItem value="45">45 dakika</SelectItem>
                  <SelectItem value="60">1 saat</SelectItem>
                  <SelectItem value="90">1.5 saat</SelectItem>
                  <SelectItem value="120">2 saat</SelectItem>
                  <SelectItem value="180">3 saat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-zinc-900 border border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Taban Fiyat</span>
                  <span className="font-medium line-through text-zinc-400 text-sm">
                    {pricingTier !== 'normal' ? `${chargingPoint.price} ₺/kWh` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Geçerli Fiyat</span>
                  <span className="font-semibold text-emerald-400">
                    {effectivePrice} ₺/kWh
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Tahmini Enerji</span>
                  <span className="font-medium text-emerald-400">
                    {(chargingPoint.power * parseInt(duration) / 60 * 0.8).toFixed(1)} kWh
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="font-semibold text-zinc-100">Tahmini Tutar</span>
                  <span className="text-xl font-bold text-emerald-400">{calculatePrice()} ₺</span>
                </div>
                <div className="text-xs text-zinc-400 mt-2">
                  * Gerçek tutar kullanılan enerji miktarına göre değişebilir
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-zinc-400 space-y-1">
              <p>• Rezervasyonunuz başlangıç saatinden itibaren 15 dakika geçerlidir.</p>
              <p>• İptal işlemleri başlangıç saatinden 1 saat öncesine kadar ücretsizdir.</p>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950">
            <Button className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold" size="lg" onClick={handleReservation}>
              <CreditCard className="w-4 h-4 mr-2" />
              Ödeme Yap ve Rezerve Et
            </Button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          amount={parseFloat(calculatePrice())}
          station={station}
          reservationDetails={{
            date: selectedDate,
            time: selectedTime,
            duration: parseInt(duration),
            chargingPoint: { ...chargingPoint, price: effectivePrice },
          }}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
