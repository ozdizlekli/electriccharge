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
  onComplete 
}: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState(mockPaymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
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
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Güvenli Ödeme
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Reservation Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="font-semibold mb-3">Rezervasyon Özeti</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İstasyon</span>
                  <span className="font-medium text-right">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Şarj Noktası</span>
                  <span className="font-medium">
                    {reservationDetails.chargingPoint.type} - {reservationDetails.chargingPoint.power} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih</span>
                  <span className="font-medium">{formatDate(reservationDetails.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat</span>
                  <span className="font-medium">{reservationDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Süre</span>
                  <span className="font-medium">{reservationDetails.duration} dakika</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Toplam Tutar</span>
                  <span className="text-xl font-bold text-green-600">{amount.toFixed(2)} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base">Ödeme Yöntemi</Label>
            
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {mockPaymentMethods.map((method) => (
                <Card 
                  key={method.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPayment === method.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium">
                            {method.type === 'credit' ? 'Kredi Kartı' : 'Banka Kartı'}
                          </span>
                          {method.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          •••• •••• •••• {method.cardNumber}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {method.cardHolder} - {method.expiryDate}
                        </div>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {/* Add New Card Option */}
            {!showNewCard && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowNewCard(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Yeni Kart Ekle
              </Button>
            )}

            {showNewCard && (
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Yeni Kart Bilgileri</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNewCard(false)}
                    >
                      İptal
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm">Kart Numarası</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-sm">Son Kullanma</Label>
                      <Input 
                        id="expiry" 
                        placeholder="AA/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm">CVV</Label>
                      <Input 
                        id="cvv" 
                        type="password"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardHolder" className="text-sm">Kart Üzerindeki İsim</Label>
                    <Input 
                      id="cardHolder" 
                      placeholder="AD SOYAD"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Security Info */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-800">
                Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. 
                Kart bilgileriniz güvenli bir şekilde saklanır ve asla üçüncü şahıslarla paylaşılmaz.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
