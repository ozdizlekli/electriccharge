import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, QrCode, CheckCircle, XCircle, Pause, Play, AlertTriangle, CreditCard, Download } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface LiveChargingProps {
  station: Station;
  chargingPoint: ChargingPoint;
  onClose: () => void;
}

type ChargingPhase = 'qr' | 'connecting' | 'charging' | 'paused' | 'completed' | 'error';

function generateInvoiceId() {
  return `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function LiveChargingSimulation({ station, chargingPoint, onClose }: LiveChargingProps) {
  const [phase, setPhase] = useState<ChargingPhase>('qr');
  const [batteryPct, setBatteryPct] = useState(22); // Başlangıç şarj seviyesi
  const [targetPct] = useState(80);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [currentKw, setCurrentKw] = useState(chargingPoint.power);
  const [totalKwh, setTotalKwh] = useState(0);
  const [cost, setCost] = useState(0);
  const [invoiceId] = useState(generateInvoiceId);
  const [qrScanned, setQrScanned] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batteryRef = useRef(batteryPct);
  const kwhRef = useRef(totalKwh);

  batteryRef.current = batteryPct;
  kwhRef.current = totalKwh;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCharging = useCallback(() => {
    setPhase('charging');
    intervalRef.current = setInterval(() => {
      setBatteryPct(prev => {
        if (prev >= targetPct) {
          stopInterval();
          setPhase('completed');
          toast.success('🎉 Şarj tamamlandı! Faturanız hazırlandı.');
          return targetPct;
        }
        // Gerçekçi simülasyon: %70'ten sonra hız düşer
        const taperedKw = prev > 70 ? chargingPoint.power * 0.4 : chargingPoint.power;
        setCurrentKw(taperedKw);

        const increment = (taperedKw / 3600) * 2; // Her tick'te aktarılan kWh (2s tick)
        const newKwh = kwhRef.current + increment;
        setTotalKwh(newKwh);
        setCost(newKwh * chargingPoint.price);

        return Math.min(prev + 0.15, targetPct);
      });
      setElapsedSecs(prev => prev + 2);
    }, 2000);
  }, [chargingPoint.power, chargingPoint.price, targetPct, stopInterval]);

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  function handleQrScan() {
    setQrScanned(true);
    setPhase('connecting');
    setTimeout(() => {
      startCharging();
      toast.success('Konnektör kilitlendi. Şarj başlıyor...');
    }, 2500);
  }

  function handlePause() {
    if (phase === 'charging') {
      stopInterval();
      setPhase('paused');
      toast.info('Şarj duraklatıldı.');
    } else if (phase === 'paused') {
      startCharging();
      toast.info('Şarj devam ediyor...');
    }
  }

  function handleStop() {
    stopInterval();
    setPhase('completed');
    toast.success('Şarj durduruldu. Faturanız hazırlandı.');
  }

  const remainingSecs = batteryPct < targetPct
    ? Math.round(((targetPct - batteryPct) / 0.15) * 2)
    : 0;
  const remainingMins = Math.ceil(remainingSecs / 60);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Batarya doluluk rengi
  const batteryColor = batteryPct >= 60 ? '#22c55e' : batteryPct >= 30 ? '#f59e0b' : '#ef4444';
  const progressAngle = ((batteryPct - 22) / (targetPct - 22)) * 283; // çember uzunluğu ~283

  return (
    <div className="fixed inset-0 bg-black/70 z-[1150] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between flex-shrink-0 transition-colors ${
          phase === 'charging' ? 'bg-green-600 text-white' :
          phase === 'completed' ? 'bg-blue-600 text-white' :
          phase === 'error' ? 'bg-red-600 text-white' :
          'bg-gray-900 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <div>
              <div className="font-bold text-sm">
                {phase === 'qr' && 'QR Kod ile Başlat'}
                {phase === 'connecting' && 'Bağlanıyor...'}
                {phase === 'charging' && 'Şarj Ediliyor ⚡'}
                {phase === 'paused' && 'Duraklatıldı'}
                {phase === 'completed' && 'Şarj Tamamlandı ✓'}
                {phase === 'error' && 'Bağlantı Hatası'}
              </div>
              <div className="text-xs opacity-80">{station.name}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            disabled={phase === 'charging'}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── QR PHASE ── */}
          {phase === 'qr' && (
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Şarj noktasındaki QR kodu okutun</p>
                <Badge variant="outline" className="mt-2">
                  {chargingPoint.type} • {chargingPoint.power} kW • {chargingPoint.connector}
                </Badge>
              </div>

              {/* QR Code visual */}
              <div className="relative">
                <div className={`w-52 h-52 border-4 rounded-2xl flex items-center justify-center transition-all ${qrScanned ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  {!qrScanned ? (
                    <div className="space-y-1 p-2">
                      {/* Fake QR pattern */}
                      {[...Array(7)].map((_, row) => (
                        <div key={row} className="flex gap-1">
                          {[...Array(7)].map((_, col) => {
                            const isCorner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
                            const isFinder = row === 0 || row === 6 || col === 0 || col === 6;
                            const randomFill = ((row * 7 + col) * 37) % 100 > 45;
                            return (
                              <div
                                key={col}
                                className={`w-5 h-5 rounded-sm ${isCorner || (isFinder && !isCorner) ? 'bg-gray-900' : randomFill ? 'bg-gray-900' : 'bg-white border border-gray-100'}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                      <p className="text-sm font-semibold text-green-700 mt-2">QR Okutuldu!</p>
                    </div>
                  )}
                </div>
                {!qrScanned && (
                  <>
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  </>
                )}
              </div>

              <div className="w-full space-y-3">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Birim Fiyat</span>
                      <span className="font-medium">{chargingPoint.price} ₺/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maks. Güç</span>
                      <span className="font-medium">{chargingPoint.power} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hedef Doluluk</span>
                      <span className="font-medium">%{targetPct}</span>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" size="lg" onClick={handleQrScan} disabled={qrScanned}>
                  <QrCode className="w-5 h-5 mr-2" />
                  {qrScanned ? 'Bağlanıyor...' : 'QR Kodu Tarat (Simüle Et)'}
                </Button>
              </div>
            </div>
          )}

          {/* ── CONNECTING PHASE ── */}
          {phase === 'connecting' && (
            <div className="p-8 flex flex-col items-center gap-6 text-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                <Zap className="absolute inset-0 m-auto w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-lg">Konnektör Kilitleniyor</p>
                <p className="text-sm text-muted-foreground mt-1">WebSocket bağlantısı kuruluyor...</p>
              </div>
              <div className="w-full space-y-2">
                {['QR doğrulandı ✓', 'Ödeme onaylandı ✓', 'Konnektör kilitleniyor...'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i < 2 ? 'bg-green-500' : 'bg-blue-100'}`}>
                      {i < 2 && <CheckCircle className="w-3 h-3 text-white" />}
                      {i === 2 && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                    </div>
                    <span className={i < 2 ? 'text-green-700' : 'text-blue-600 font-medium'}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHARGING / PAUSED PHASE ── */}
          {(phase === 'charging' || phase === 'paused') && (
            <div className="p-5 space-y-5">

              {/* Circular Battery Gauge */}
              <div className="flex flex-col items-center py-2">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    {/* Progress arc */}
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke={batteryColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${progressAngle} 283`}
                      className="transition-all duration-1000"
                    />
                    {/* Target marker */}
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="4 279"
                      strokeDashoffset={`-${((targetPct - 22) / (targetPct - 22)) * 283 - 2}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold" style={{ color: batteryColor }}>
                      %{Math.round(batteryPct)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {phase === 'paused' ? '⏸ Duraklatıldı' : '⚡ Şarj Oluyor'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Anlık Güç</div>
                    <div className="text-xl font-bold text-green-600">{currentKw.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">kW</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Toplam Enerji</div>
                    <div className="text-xl font-bold text-blue-600">{totalKwh.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">kWh</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Geçen Süre</div>
                    <div className="text-xl font-bold text-gray-700">{formatTime(elapsedSecs)}</div>
                    <div className="text-xs text-muted-foreground">ss:dd</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Kalan Süre</div>
                    <div className="text-xl font-bold text-purple-600">{remainingMins}</div>
                    <div className="text-xs text-muted-foreground">dakika</div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Cost */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Anlık Tutar</div>
                    <div className="text-2xl font-bold text-green-700">{cost.toFixed(2)} ₺</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Kalan (%{Math.round(targetPct - batteryPct)})</div>
                    <div className="text-sm font-medium text-gray-600">
                      ≈ {((targetPct - batteryPct) * (chargingPoint.power / 100) * chargingPoint.price * 0.8).toFixed(2)} ₺
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live power bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Şarj Hızı</span>
                  <span>{currentKw.toFixed(1)} / {chargingPoint.power} kW</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentKw / chargingPoint.power) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePause}
                >
                  {phase === 'paused' ? <><Play className="w-4 h-4 mr-1" /> Devam Et</> : <><Pause className="w-4 h-4 mr-1" /> Duraklat</>}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleStop}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Durdur
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Konnektörü şarj tamamlanmadan çıkarmayın.
              </p>
            </div>
          )}

          {/* ── COMPLETED PHASE ── */}
          {phase === 'completed' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-700">Şarj Tamamlandı!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Konnektörü güvenle çıkarabilirsiniz.</p>
                </div>
              </div>

              {/* Invoice */}
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-sm">Fatura</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{invoiceId}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">İstasyon</span>
                      <span className="font-medium text-right max-w-[180px] truncate">{station.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Şarj Noktası</span>
                      <span className="font-medium">{chargingPoint.type} {chargingPoint.power}kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Süre</span>
                      <span className="font-medium">{formatTime(elapsedSecs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enerji</span>
                      <span className="font-medium">{totalKwh.toFixed(3)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Başlangıç - Bitiş</span>
                      <span className="font-medium">%22 → %{Math.round(batteryPct)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Birim Fiyat</span>
                      <span className="font-medium">{chargingPoint.price} ₺/kWh</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Toplam</span>
                      <span className="text-green-700 text-lg">{cost.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Ödeme</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Otomatik Ödendi
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="text-center">
                  <CardContent className="py-3 px-2">
                    <div className="text-2xl font-bold text-blue-600">%{Math.round(batteryPct - 22)}</div>
                    <div className="text-xs text-muted-foreground">Kazanılan Şarj</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="py-3 px-2">
                    <div className="text-2xl font-bold text-green-600">{(totalKwh * 0.5).toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">CO₂ Tasarrufu</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => toast.info('Fatura indiriliyor...')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fatura İndir
                </Button>
                <Button className="flex-1" onClick={onClose}>
                  Kapat
                </Button>
              </div>
            </div>
          )}

          {/* ── ERROR PHASE ── */}
          {phase === 'error' && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400" />
              <div>
                <p className="font-semibold text-lg">Bağlantı Hatası</p>
                <p className="text-sm text-muted-foreground mt-1">Konnektör kilitlenemedi. Lütfen tekrar deneyin.</p>
              </div>
              <Button onClick={() => setPhase('qr')}>Tekrar Dene</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}