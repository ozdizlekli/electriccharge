import React, { useState } from 'react';
import { X, Calendar, Clock, Zap, CreditCard, AlertCircle } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PaymentModal } from './PaymentModal';
import { toast } from 'sonner';

interface ReservationModalProps {
  station: Station;
  chargingPoint: ChargingPoint;
  onClose: () => void;
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

  const calculatePrice = () => {
    const durationHours = parseInt(duration) / 60;
    const estimatedKwh = chargingPoint.power * durationHours * 0.8;
    return (estimatedKwh * chargingPoint.price).toFixed(2);
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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-lg md:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Rezervasyon Yap</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Station Info */}
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="font-semibold mb-1">{station.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{station.address}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">
                    {chargingPoint.type} - {chargingPoint.power} kW - {chargingPoint.connector}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Availability Warning */}
            {isOccupied && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-900">Bu nokta şu anda dolu</div>
                    <div className="text-orange-700">
                      Yaklaşık {availableFromMinutes} dakika sonra boşalacak. Rezervasyonunuz bu süreden sonra başlayacak.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date Selection */}
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
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Saat
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {generateTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                      {isOccupied && time === generateTimeSlots()[0] && ' (En erken)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label htmlFor="duration">Tahmini Şarj Süresi</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="30">30 dakika</SelectItem>
                  <SelectItem value="45">45 dakika</SelectItem>
                  <SelectItem value="60">1 saat</SelectItem>
                  <SelectItem value="90">1.5 saat</SelectItem>
                  <SelectItem value="120">2 saat</SelectItem>
                  <SelectItem value="180">3 saat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Birim Fiyat</span>
                  <span className="font-medium">{chargingPoint.price} ₺/kWh</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tahmini Enerji</span>
                  <span className="font-medium">
                    {(chargingPoint.power * parseInt(duration) / 60 * 0.8).toFixed(1)} kWh
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">Tahmini Tutar</span>
                  <span className="text-xl font-bold text-green-600">{calculatePrice()} ₺</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  * Gerçek tutar, kullanılan enerji miktarına göre değişebilir
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Rezervasyonunuz başlangıç saatinden itibaren 15 dakika geçerlidir.</p>
              <p>• 15 dakika içinde başlamazsanız rezervasyon iptal olur.</p>
              <p>• İptal işlemleri başlangıç saatinden 1 saat öncesine kadar ücretsizdir.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <Button
              className="w-full"
              size="lg"
              onClick={handleReservation}
            >
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
            chargingPoint: chargingPoint
          }}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}