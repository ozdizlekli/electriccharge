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
    onFiltersChange({ maxDistance: 50, onlyAvailable: false, brands: [], minPower: 0, connectorTypes: [] });
  };

  return (
    /* FIXED: z-[9999] to render above Leaflet map */
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full md:max-w-md md:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col text-zinc-100">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg text-white">Filtreler</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Maksimum Mesafe</Label>
              <span className="text-sm font-medium text-zinc-100">{filters.maxDistance} km</span>
            </div>
            <Slider value={[filters.maxDistance]} onValueChange={([value]) => onFiltersChange({ ...filters, maxDistance: value })} min={1} max={50} step={1} />
          </div>

          <Card className="border border-zinc-800 bg-zinc-950 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="available" className="cursor-pointer text-zinc-200">Sadece Müsait Olanlar</Label>
                  <p className="text-xs text-zinc-500 mt-1">En az bir şarj noktası müsait olan istasyonları göster</p>
                </div>
                <Switch id="available" checked={filters.onlyAvailable} onCheckedChange={(checked) => onFiltersChange({ ...filters, onlyAvailable: checked })} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label className="text-zinc-300">Markalar</Label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((brand) => (
                <Badge key={brand} variant={filters.brands.includes(brand) ? 'default' : 'outline'} className={`cursor-pointer border ${filters.brands.includes(brand) ? 'bg-emerald-400 text-zinc-950 border-emerald-400' : 'bg-zinc-950 text-zinc-300 border-zinc-700'}`} onClick={() => toggleBrand(brand)}>
                  {brand}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Minimum Güç</Label>
              <span className="text-sm font-medium text-zinc-100">{filters.minPower > 0 ? `${filters.minPower} kW` : 'Tümü'}</span>
            </div>
            <Slider value={[filters.minPower]} onValueChange={([value]) => onFiltersChange({ ...filters, minPower: value })} min={0} max={200} step={10} />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>AC (Yavaş)</span>
              <span>DC (Hızlı)</span>
              <span>DC (Ultra)</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-300">Konnektör Tipi</Label>
            <div className="grid grid-cols-2 gap-2">
              {connectorTypes.map((connector) => (
                <Button key={connector} variant={filters.connectorTypes.includes(connector) ? 'default' : 'outline'} size="sm" onClick={() => toggleConnector(connector)} className={`justify-start ${filters.connectorTypes.includes(connector) ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 border-0' : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'}`}>
                  {connector}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex gap-3">
          <Button variant="outline" className="flex-1 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800" onClick={resetFilters}>Sıfırla</Button>
          <Button className="flex-1 bg-emerald-400 text-zinc-950 hover:bg-emerald-300" onClick={onClose}>Uygula</Button>
        </div>
      </div>
    </div>
  );
}
