import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';

interface FilterPanelProps {
  onClose: () => void;
  filters: {
    maxDistance: number;
    onlyAvailable: boolean;
    brands: string[];
    minPower: number;
    connectorTypes: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterPanel({ onClose, filters, onFiltersChange }: FilterPanelProps) {
  const availableBrands = ['Eşarj', 'Voltrun', 'ZES', 'Sharz', 'PlugTurk'];
  const connectorTypes = ['CCS2', 'CHAdeMO', 'Type 2', 'Tesla'];

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const toggleConnector = (connector: string) => {
    const newConnectors = filters.connectorTypes.includes(connector)
      ? filters.connectorTypes.filter(c => c !== connector)
      : [...filters.connectorTypes, connector];
    onFiltersChange({ ...filters, connectorTypes: newConnectors });
  };

  const resetFilters = () => {
    onFiltersChange({
      maxDistance: 50,
      onlyAvailable: false,
      brands: [],
      minPower: 0,
      connectorTypes: []
    });
  };

  return (
<div className="fixed inset-0 bg-black/50 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Filtreler</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Distance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Maksimum Mesafe</Label>
              <span className="text-sm font-medium">{filters.maxDistance} km</span>
            </div>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={([value]) => onFiltersChange({ ...filters, maxDistance: value })}
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Only Available */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="available" className="cursor-pointer">
                    Sadece Müsait Olanlar
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    En az bir şarj noktası müsait olan istasyonları göster
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={filters.onlyAvailable}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, onlyAvailable: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Brands */}
          <div className="space-y-3">
            <Label>Markalar</Label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((brand) => (
                <Badge
                  key={brand}
                  variant={filters.brands.includes(brand) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>

          {/* Minimum Power */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Güç</Label>
              <span className="text-sm font-medium">
                {filters.minPower > 0 ? `${filters.minPower} kW` : 'Tümü'}
              </span>
            </div>
            <Slider
              value={[filters.minPower]}
              onValueChange={([value]) => onFiltersChange({ ...filters, minPower: value })}
              min={0}
              max={200}
              step={10}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>AC (Yavaş)</span>
              <span>DC (Hızlı)</span>
              <span>DC (Ultra)</span>
            </div>
          </div>

          {/* Connector Types */}
          <div className="space-y-3">
            <Label>Konnektör Tipi</Label>
            <div className="grid grid-cols-2 gap-2">
              {connectorTypes.map((connector) => (
                <Button
                  key={connector}
                  variant={filters.connectorTypes.includes(connector) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleConnector(connector)}
                  className="justify-start"
                >
                  {connector}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            Sıfırla
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}
