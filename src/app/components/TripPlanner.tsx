import React, { useState } from 'react';
import {
  X, Navigation, MapPin, Zap, Clock, Battery, ChevronRight,
  Route, AlertCircle, CheckCircle, Loader2, Car
} from 'lucide-react';
import { Station } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { toast } from 'sonner';

interface TripPlannerProps {
  stations: Station[];
  onClose: () => void;
}

interface TripStop {
  type: 'start' | 'charge' | 'destination';
  name: string;
  address?: string;
  station?: Station;
  batteryOnArrival: number;
  batteryAfterCharge?: number;
  chargeTime?: number;
  distanceFromPrev: number;
  estimatedCost?: number;
}

const VEHICLE_RANGE_KM = 300;

export function TripPlanner({ stations, onClose }: TripPlannerProps) {
  const [destination, setDestination] = useState('');
  const [totalDistance, setTotalDistance] = useState(180);
  const [startBattery, setStartBattery] = useState(80);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripStop[] | null>(null);

  const calculateTrip = async () => {
    if (!destination.trim()) {
      toast.error('Lütfen bir hedef girin');
      return;
    }

    setIsCalculating(true);
    setTripPlan(null);

    await new Promise(r => setTimeout(r, 1800));

    const effectiveRange = (startBattery / 100) * VEHICLE_RANGE_KM;
    const stops: TripStop[] = [];

    // Start point
    stops.push({
      type: 'start',
      name: 'Mevcut Konumunuz',
      address: 'İzmir Merkez',
      batteryOnArrival: startBattery,
      distanceFromPrev: 0,
    });

    let remainingDistance = totalDistance;
    let currentBattery = startBattery;
    let coveredDistance = 0;

    // Determine if charging stops are needed
    const batteryPerKm = 100 / VEHICLE_RANGE_KM;

    while (remainingDistance > 0) {
      const distanceCanCover = currentBattery / batteryPerKm;

      if (distanceCanCover >= remainingDistance + 20) {
        // Can reach destination comfortably
        break;
      }

      // Need a charging stop - pick a nearby available station
      const chargeDistance = Math.min(distanceCanCover * 0.75, remainingDistance - 30);
      const batteryOnArrival = Math.max(10, currentBattery - chargeDistance * batteryPerKm);

      const availableStations = stations.filter(s =>
        s.chargingPoints.some(cp => cp.status === 'available' && cp.type === 'DC')
      );

      if (availableStations.length === 0) break;

      const station = availableStations[Math.floor(Math.random() * Math.min(3, availableStations.length))];
      const dcPoint = station.chargingPoints.find(cp => cp.type === 'DC' && cp.status === 'available')!;
      const chargeTarget = 85;
      const chargeTime = Math.ceil(((chargeTarget - batteryOnArrival) / 100 * VEHICLE_RANGE_KM) / (dcPoint.power / 60));
      const energyCharged = ((chargeTarget - batteryOnArrival) / 100) * VEHICLE_RANGE_KM * 0.2;
      const cost = energyCharged * dcPoint.price;

      stops.push({
        type: 'charge',
        name: station.name,
        address: station.address,
        station,
        batteryOnArrival,
        batteryAfterCharge: chargeTarget,
        chargeTime,
        distanceFromPrev: chargeDistance,
        estimatedCost: parseFloat(cost.toFixed(2)),
      });

      coveredDistance += chargeDistance;
      remainingDistance -= chargeDistance;
      currentBattery = chargeTarget;
    }

    // Destination
    const finalBattery = Math.max(5, currentBattery - remainingDistance * batteryPerKm);
    stops.push({
      type: 'destination',
      name: destination,
      address: `${destination} Varış Noktası`,
      batteryOnArrival: Math.round(finalBattery),
      distanceFromPrev: remainingDistance,
    });

    setTripPlan(stops);
    setIsCalculating(false);
    toast.success('Rota planı hazır!');
  };

  const totalCost = tripPlan?.reduce((s, stop) => s + (stop.estimatedCost || 0), 0) ?? 0;
  const totalChargeTime = tripPlan?.reduce((s, stop) => s + (stop.chargeTime || 0), 0) ?? 0;
  const chargeStops = tripPlan?.filter(s => s.type === 'charge') ?? [];

  const batteryColor = (pct: number) =>
    pct >= 50 ? '#22c55e' : pct >= 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 bg-black/60 z-[1100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-900 w-full md:max-w-xl md:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-zinc-900/20 rounded-lg flex items-center justify-center">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold">Akıllı Rota Planlayıcı</div>
              <div className="text-xs opacity-75">Şarj duraklarıyla optimize edilmiş rota</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-900/20" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Input Section */}
          <div className="p-5 space-y-4 border-b border-zinc-800">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Hedef Konum
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="örn. Ankara, Bodrum, Çeşme..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && calculateTrip()}
                  className="flex-1 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    Toplam Mesafe
                  </Label>
                  <span className="text-sm font-bold text-emerald-400">{totalDistance} km</span>
                </div>
                <Slider
                  value={[totalDistance]}
                  onValueChange={([v]) => setTotalDistance(v)}
                  min={50}
                  max={600}
                  step={10}
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>50 km</span>
                  <span>600 km</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    Başlangıç Şarjı
                  </Label>
                  <span className="text-sm font-bold" style={{ color: batteryColor(startBattery) }}>
                    %{startBattery}
                  </span>
                </div>
                <Slider
                  value={[startBattery]}
                  onValueChange={([v]) => setStartBattery(v)}
                  min={10}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>%10</span>
                  <span>%100</span>
                </div>
              </div>
            </div>

            {/* Vehicle info */}
            <Card className="bg-zinc-800/40 border-zinc-700">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs text-blue-800">
                  <span className="font-semibold">Araç Menzili: {VEHICLE_RANGE_KM} km</span> (tam şarjda).{' '}
                  Mevcut menzil: <span className="font-bold">{Math.round((startBattery / 100) * VEHICLE_RANGE_KM)} km</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"
              size="lg"
              onClick={calculateTrip}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rota Hesaplanıyor...</>
              ) : (
                <><Route className="w-4 h-4 mr-2" />Rotayı Planla</>
              )}
            </Button>
          </div>

          {/* Trip Plan Result */}
          {isCalculating && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-700 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-semibold">Optimal rota hesaplanıyor...</p>
                <p className="text-sm text-zinc-400 mt-1">Şarj noktaları analiz ediliyor</p>
              </div>
            </div>
          )}

          {tripPlan && !isCalculating && (
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-emerald-300">{totalDistance} km</div>
                    <div className="text-xs text-emerald-400 mt-0.5">Toplam Mesafe</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-green-700">{chargeStops.length}</div>
                    <div className="text-xs text-emerald-400 mt-0.5">Şarj Durağı</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border border-zinc-800">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-purple-700">{totalCost.toFixed(0)} ₺</div>
                    <div className="text-xs text-purple-600 mt-0.5">Tahmini Maliyet</div>
                  </CardContent>
                </Card>
              </div>

              {chargeStops.length === 0 && (
                <Card className="bg-zinc-800/40 border-zinc-700">
                  <CardContent className="p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      Şarj durağına gerek yok! Hedefinize tek seferde ulaşabilirsiniz.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <div className="space-y-0">
                {tripPlan.map((stop, idx) => (
                  <div key={idx} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                        stop.type === 'start' ? 'bg-blue-600 border-emerald-500 text-white' :
                        stop.type === 'destination' ? 'bg-green-600 border-green-600 text-white' :
                        'bg-emerald-400 border-orange-500 text-white'
                      }`}>
                        {stop.type === 'start' && <Navigation className="w-4 h-4" />}
                        {stop.type === 'charge' && <Zap className="w-4 h-4" />}
                        {stop.type === 'destination' && <MapPin className="w-4 h-4" />}
                      </div>
                      {idx < tripPlan.length - 1 && (
                        <div className="w-0.5 bg-gray-200 flex-1 min-h-[2rem] my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{stop.name}</span>
                            {stop.type === 'charge' && stop.station && (
                              <Badge variant="outline" className="text-xs">{stop.station.brand}</Badge>
                            )}
                          </div>
                          {stop.address && (
                            <p className="text-xs text-zinc-400 mt-0.5">{stop.address}</p>
                          )}
                          {stop.distanceFromPrev > 0 && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                              +{Math.round(stop.distanceFromPrev)} km
                            </p>
                          )}
                        </div>

                        {/* Battery indicator */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold" style={{ color: batteryColor(stop.batteryOnArrival) }}>
                            %{stop.batteryOnArrival}
                          </div>
                          <div className="text-xs text-zinc-400">varışta</div>
                        </div>
                      </div>

                      {/* Charge stop details */}
                      {stop.type === 'charge' && stop.station && (
                        <Card className="bg-zinc-800/40 border-zinc-700 mt-2">
                          <CardContent className="p-3 space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-zinc-400">Şarj Süresi</div>
                                <div className="font-bold text-orange-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{stop.chargeTime} dk
                                </div>
                              </div>
                              <div>
                                <div className="text-zinc-400">Çıkışta</div>
                                <div className="font-bold text-emerald-400">%{stop.batteryAfterCharge}</div>
                              </div>
                              <div>
                                <div className="text-zinc-400">Maliyet</div>
                                <div className="font-bold text-purple-700">{stop.estimatedCost} ₺</div>
                              </div>
                            </div>
                            {stop.station.chargingPoints.find(cp => cp.type === 'DC') && (
                              <div className="text-xs text-orange-800">
                                ⚡ DC Hızlı Şarj —{' '}
                                {stop.station.chargingPoints.find(cp => cp.type === 'DC')!.power} kW
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total time */}
              {totalChargeTime > 0 && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-4 h-4" />
                      Toplam Şarj Süresi
                    </div>
                    <span className="font-bold">{totalChargeTime} dakika</span>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                onClick={() => {
                  const firstCharge = chargeStops[0];
                  if (firstCharge?.station) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${firstCharge.station.location.lat},${firstCharge.station.location.lng}`, '_blank');
                  }
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {chargeStops.length > 0 ? 'İlk Durağa Yol Tarifi Al' : `${destination}'ya Yol Tarifi Al`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
