import React, { useState } from 'react';
import { X, CreditCard, Lock, Check } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { mockPaymentMethods } from '../data/mockData';

interface PaymentModalProps {
  amount: number;
  station: Station;
  reservationDetails: {
    date: string;
    time: string;
    duration: number;
    chargingPoint: ChargingPoint;
  };
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({
  amount,
  station,
  reservationDetails,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState(mockPaymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    /* z-[10005] — absolute topmost layer, above ReservationModal (z-[9999]) and MapView */
    <div className="fixed inset-0 bg-black/60 z-[10005] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-zinc-100">
            <Lock className="w-4 h-4" />
            Güvenli Ödeme
          </h3>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={onClose} disabled={isProcessing}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Reservation Summary */}
          <Card className="bg-zinc-900 border border-zinc-800">
            <CardContent className="p-4">
              <div className="font-semibold mb-3 text-zinc-100">Rezervasyon Özeti</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">İstasyon</span>
                  <span className="font-medium text-right text-zinc-100">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Şarj Noktası</span>
                  <span className="font-medium text-zinc-100">
                    {reservationDetails.chargingPoint.type} - {reservationDetails.chargingPoint.power} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tarih</span>
                  <span className="font-medium text-zinc-100">{formatDate(reservationDetails.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Saat</span>
                  <span className="font-medium text-zinc-100">{reservationDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Süre</span>
                  <span className="font-medium text-zinc-100">{reservationDetails.duration} dakika</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <span className="font-semibold text-zinc-100">Toplam Tutar</span>
                  <span className="text-xl font-bold text-emerald-400">{amount.toFixed(2)} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base text-zinc-100">Ödeme Yöntemi</Label>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {mockPaymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selectedPayment === method.id ? 'border-emerald-400 bg-zinc-800/40' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-950'
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium text-zinc-100">
                            {method.type === 'credit' ? 'Kredi Kartı' : 'Banka Kartı'}
                          </span>
                          {method.isDefault && (
                            <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-400">
                          •••• •••• •••• {method.cardNumber}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {method.cardHolder} - {method.expiryDate}
                        </div>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {!showNewCard && (
              <Button variant="outline" className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={() => setShowNewCard(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Yeni Kart Ekle
              </Button>
            )}

            {showNewCard && (
              <Card className="bg-zinc-900 border border-dashed border-zinc-700">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-zinc-100">Yeni Kart Bilgileri</Label>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setShowNewCard(false)}>
                      İptal
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm text-zinc-300">Kart Numarası</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-sm text-zinc-300">Son Kullanma</Label>
                      <Input id="expiry" placeholder="AA/YY" maxLength={5} className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm text-zinc-300">CVV</Label>
                      <Input id="cvv" type="password" placeholder="123" maxLength={3} className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardHolder" className="text-sm text-zinc-300">Kart Üzerindeki İsim</Label>
                    <Input id="cardHolder" placeholder="AD SOYAD" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Security Info */}
          <Card className="bg-zinc-800/40 border-zinc-700">
            <CardContent className="p-3 flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400">
                Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Kart bilgileriniz güvenli bir
                şekilde saklanır ve asla üçüncü şahıslarla paylaşılmaz.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" size="lg" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t border-t-transparent rounded-full animate-spin mr-2" />
                Ödeme İşleniyor...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {amount.toFixed(2)} ₺ Öde ve Rezerve Et
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
