import React, { useState } from 'react';
import { MapPin, Zap, Clock, Star, Navigation } from 'lucide-react';
import { Station } from '../types/station';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface StationCardProps {
  station: Station;
  onViewDetails: (stationId: string) => void;
  onNavigate: (stationId: string) => void;
}

// Curated list of reliable Unsplash EV / modern car / charging station photos
// Each has a stable photo ID so they never break
const EV_PHOTO_IDS = [
  'photo-1593941707882-a5bba14938cb', // EV charger
  'photo-1617704548623-340376564e68', // Tesla charging
  'photo-1558618666-fcd25c85cd64', // EV charger station
  'photo-1560179707-f14e90ef3623', // modern building / charge
  'photo-1585208798174-6cedd86e019a', // car charging
  'photo-1623126908029-58cb08a2b272', // EV plug
  'photo-1621264448270-9ef00e88a935', // car charger modern
  'photo-1572120360610-d971b9d7767c', // EV car front
  'photo-1494976388531-d1058494cdd8', // electric car
  'photo-1592198084033-aade902d1aae', // sports car modern
];

function getStableImageUrl(stationId: string): string {
  // Pick a photo deterministically based on the station id
  const numericPart = parseInt(stationId.replace(/\D/g, ''), 10) || stationId.charCodeAt(0);
  const photoId = EV_PHOTO_IDS[numericPart % EV_PHOTO_IDS.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`;
}

// Gradient fallback rendered as an SVG data URI — never broken
function getGradientFallback(stationId: string): string {
  const hue = (parseInt(stationId.replace(/\D/g, ''), 10) * 37 || 200) % 360;
  const hue2 = (hue + 40) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='hsl(${hue},70%25,45%25)'/><stop offset='100%25' stop-color='hsl(${hue2},60%25,30%25)'/></linearGradient></defs><rect width='400' height='200' fill='url(%23g)'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='sans-serif'>⚡</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

export function StationCard({ station, onViewDetails, onNavigate }: StationCardProps) {
  const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;
  const totalPoints = station.chargingPoints.length;
  const nextAvailableTime = station.chargingPoints
    .filter(cp => cp.status === 'occupied' && cp.currentUser)
    .sort((a, b) => (a.currentUser?.remainingMinutes || 0) - (b.currentUser?.remainingMinutes || 0))[0];

  const minPrice = Math.min(...station.chargingPoints.map(cp => cp.price));
  const maxPower = Math.max(...station.chargingPoints.map(cp => cp.power));

  // Resolve image: prefer API-provided URL, fall back to stable Unsplash photo
  const primaryImage =
    station.images && station.images.length > 0 && station.images[0]
      ? station.images[0]
      : getStableImageUrl(station.id);

  const [imgSrc, setImgSrc] = useState(primaryImage);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImageError = () => {
    if (!imgFailed) {
      // First fallback: try stable Unsplash URL
      const stable = getStableImageUrl(station.id);
      if (imgSrc !== stable) {
        setImgSrc(stable);
      } else {
        // Final fallback: SVG gradient (never fails)
        setImgSrc(getGradientFallback(station.id));
        setImgFailed(true);
      }
    }
  };

  return (
    <Card className="transition-all duration-200 cursor-pointer group border border-zinc-800 bg-zinc-900 rounded-2xl hover:border-emerald-400/70">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Station Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-700">
            <img
              src={imgSrc}
              alt={station.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate text-zinc-100">{station.name}</h3>
                  <Badge variant="outline" className="flex-shrink-0 text-xs border-zinc-700 text-zinc-300 bg-zinc-950">{station.brand}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-zinc-400 mb-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{station.address}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span className="font-medium text-zinc-200">{station.rating}</span>
                <span className="text-zinc-500">({station.totalReviews})</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-400">
                <Navigation className="w-3 h-3" />
                <span>{station.distance} km</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-400">
                <Zap className="w-3 h-3" />
                <span>{maxPower} kW</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {availablePoints > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm">
                      <span className="font-medium text-emerald-400">{availablePoints}/{totalPoints}</span>
                      <span className="text-zinc-400"> Müsait</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-red-600 font-medium">Tüm Noktalar Dolu</span>
                  </>
                )}
              </div>
              <span className="text-sm font-semibold text-zinc-100">{minPrice} ₺/kWh</span>
            </div>

            {/* Next Available */}
            {availablePoints === 0 && nextAvailableTime && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                <Clock className="w-3 h-3" />
                <span>{nextAvailableTime.currentUser?.remainingMinutes} dk sonra boşalacak</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 transition-all duration-150 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800"
                onClick={() => onNavigate(station.id)}
              >
                <Navigation className="w-3 h-3 mr-1" />
                Yol Tarifi
              </Button>
              <Button
                size="sm"
                className="flex-1 transition-all duration-150 bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                onClick={() => onViewDetails(station.id)}
              >
                Detaylar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
