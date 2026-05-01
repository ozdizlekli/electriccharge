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

export function StationCard({ station, onViewDetails, onNavigate }: StationCardProps) {
  const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;
  const totalPoints = station.chargingPoints.length;
  const nextAvailableTime = station.chargingPoints
    .filter(cp => cp.status === 'occupied' && cp.currentUser)
    .sort((a, b) => (a.currentUser?.remainingMinutes || 0) - (b.currentUser?.remainingMinutes || 0))[0];

  const minPrice = Math.min(...station.chargingPoints.map(cp => cp.price));
  const maxPower = Math.max(...station.chargingPoints.map(cp => cp.power));

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Station Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={station.images[0]} 
              alt={station.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{station.name}</h3>
                  <Badge variant="outline" className="flex-shrink-0">{station.brand}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{station.address}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{station.rating}</span>
                <span className="text-muted-foreground">({station.totalReviews})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Navigation className="w-3 h-3" />
                <span>{station.distance} km</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>{maxPower} kW</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {availablePoints > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">
                      <span className="font-medium text-green-600">{availablePoints}/{totalPoints}</span>
                      <span className="text-muted-foreground"> Şarj Noktası Müsait</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-red-600 font-medium">Tüm Noktalar Dolu</span>
                  </>
                )}
              </div>
              <span className="text-sm font-medium">{minPrice} ₺/kWh</span>
            </div>

            {/* Next Available */}
            {availablePoints === 0 && nextAvailableTime && (
              <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                <Clock className="w-3 h-3" />
                <span>
                  {nextAvailableTime.currentUser?.remainingMinutes} dk sonra boşalacak
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onNavigate(station.id)}
              >
                <Navigation className="w-3 h-3 mr-1" />
                Yol Tarifi
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
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
