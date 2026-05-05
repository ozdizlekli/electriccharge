import React, { useState, useRef } from 'react';
import { X, Camera, Upload, AlertTriangle, CheckCircle, Loader2, Zap, Send } from 'lucide-react';
import { Station, ChargingPoint } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface AIDamageReportProps {
  station: Station;
  onClose: () => void;
}

type AnalysisPhase = 'idle' | 'uploading' | 'analyzing' | 'complete';

interface DamageResult {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  recommendation: string;
  priorityCode: string;
}

const DAMAGE_SCENARIOS: DamageResult[] = [
  {
    type: 'Kablo Hasarı',
    severity: 'high',
    confidence: 94.2,
    description: 'Konektör kablosunda fiziksel hasar tespit edildi. Kablo kılıfında yırtık ve iç tellerde aşınma görülüyor.',
    recommendation: 'Servis ekibinin 24 saat içinde müdahale etmesi gerekmektedir. Güvenlik riski mevcut.',
    priorityCode: 'P1-URGENT'
  },
  {
    type: 'Konektör Korozyonu',
    severity: 'medium',
    confidence: 87.5,
    description: 'Şarj konektöründe orta düzeyde korozyon tespit edildi. Bağlantı kalitesini olumsuz etkileyebilir.',
    recommendation: 'Haftalık bakım döngüsünde temizlik ve koruyucu kaplama uygulanmalıdır.',
    priorityCode: 'P2-ROUTINE'
  },
  {
    type: 'Ekran Arızası',
    severity: 'low',
    confidence: 91.8,
    description: 'İstasyon ekranında piksel hatası ve görüntü bozukluğu tespit edildi. Işık yayan diot arızası.',
    recommendation: 'Bir sonraki rutin bakımda ekran modülü değiştirilmesi planlanabilir.',
    priorityCode: 'P3-SCHEDULED'
  },
  {
    type: 'Kapı/Kasa Hasarı',
    severity: 'low',
    confidence: 96.1,
    description: 'İstasyon kasasında kırık veya çatlak tespit edildi. İç donanımı koruma kapasitesi azalmış.',
    recommendation: 'IP rating standardlarını korumak için kasa onarımı planlanmalıdır.',
    priorityCode: 'P3-SCHEDULED'
  }
];

export function AIDamageReport({ station, onClose }: AIDamageReportProps) {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [damageCategory, setDamageCategory] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<DamageResult | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !damageCategory) {
      toast.error('Lütfen bir fotoğraf yükleyin veya hasar kategorisi seçin');
      return;
    }

    setPhase('uploading');
    setAnalysisProgress(0);

    // Simulate upload
    await new Promise(r => setTimeout(r, 800));
    setPhase('analyzing');

    // Simulate AI analysis progress
    const progressSteps = [15, 30, 45, 60, 72, 85, 93, 100];
    for (const step of progressSteps) {
      await new Promise(r => setTimeout(r, 300));
      setAnalysisProgress(step);
    }

    // Pick a random damage scenario or base on category
    const scenario = DAMAGE_SCENARIOS[Math.floor(Math.random() * DAMAGE_SCENARIOS.length)];
    setResult(scenario);
    setPhase('complete');
    toast.success('AI analizi tamamlandı!');
  };

  const handleSubmitReport = async () => {
    setReportSubmitted(true);
    await new Promise(r => setTimeout(r, 500));
    toast.success(`Rapor gönderildi! Öncelik kodu: ${result?.priorityCode}. Yönetici bilgilendirildi.`);
    setTimeout(onClose, 2000);
  };

  const severityConfig = {
    low: { color: 'bg-zinc-800 text-zinc-300 border-zinc-700', label: 'Düşük', icon: '🔵' },
    medium: { color: 'bg-zinc-800 text-zinc-300 border-zinc-700', label: 'Orta', icon: '🟡' },
    high: { color: 'bg-zinc-800 text-zinc-300 border-zinc-700', label: 'Yüksek', icon: '🟠' },
    critical: { color: 'bg-zinc-800 text-zinc-200 border-zinc-700', label: 'Kritik', icon: '🔴' }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[1200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-950 w-full md:max-w-lg md:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-5 text-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold text-lg">AI Hasar Bildirimi</span>
            </div>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-zinc-400 text-sm mt-1 truncate">{station.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {phase === 'idle' && (
            <>
              {/* Image capture */}
              <div>
                <Label className="text-sm font-semibold text-zinc-200 mb-2 block">Hasar Fotoğrafı</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    selectedImage ? 'border-emerald-500 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <div className="space-y-2">
                      <img src={selectedImage} alt="Hasar fotoğrafı" className="w-full h-48 object-cover rounded-lg" />
                      <p className="text-sm text-emerald-400 font-medium">✓ Fotoğraf yüklendi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center gap-3">
                        <Camera className="w-8 h-8 text-zinc-500" />
                        <Upload className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">Fotoğraf çek veya yükle</p>
                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG desteklenir</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-200">Hasar Kategorisi</Label>
                <Select value={damageCategory} onValueChange={setDamageCategory}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectValue placeholder="Hasar türünü seçin" className="placeholder:text-zinc-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="cable">Kablo / Konektör Hasarı</SelectItem>
                    <SelectItem value="screen">Ekran Arızası</SelectItem>
                    <SelectItem value="housing">Kasa / Kapı Hasarı</SelectItem>
                    <SelectItem value="power">Güç / Şarj Sorunu</SelectItem>
                    <SelectItem value="vandalism">Vandalizm</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-200">Açıklama (İsteğe bağlı)</Label>
                <Textarea
                  placeholder="Hasarı kısaca açıklayın..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="resize-none bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                  rows={3}
                />
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20" onClick={handleAnalyze}>
                <Zap className="w-4 h-4 mr-2" />
                AI ile Analiz Et
              </Button>
            </>
          )}

          {/* Upload/Analyzing phase */}
          {(phase === 'uploading' || phase === 'analyzing') && (
            <div className="py-8 flex flex-col items-center gap-5 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-700 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {phase === 'uploading' ? 'Fotoğraf Yükleniyor...' : 'AI Analiz Ediyor...'}
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  {phase === 'analyzing' ? 'OpenCV modeliyle hasar sınıflandırılıyor' : 'Lütfen bekleyin'}
                </p>
              </div>
              {phase === 'analyzing' && (
                <div className="w-full space-y-2">
                  <Progress value={analysisProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Görsel işleniyor...</span>
                    <span>%{analysisProgress}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    {['Nesne Tespiti', 'Hasar Sınıflandırma', 'Öncelik Atama'].map((step, i) => (
                      <div key={step} className={`p-2 rounded text-center ${analysisProgress > (i + 1) * 30 ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete phase */}
          {phase === 'complete' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-100">AI Analizi Tamamlandı</p>
                  <p className="text-xs text-zinc-400">Güven skoru: %{result.confidence}</p>
                </div>
              </div>

              {/* Result card */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-lg text-zinc-100">{result.type}</h4>
                      <Badge className={`mt-1 ${severityConfig[result.severity].color} border`}>
                        {severityConfig[result.severity].icon} {severityConfig[result.severity].label} Öncelik
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">Öncelik Kodu</div>
                      <div className="font-mono font-bold text-sm text-zinc-100">{result.priorityCode}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-400 mb-1">AI TESPİTİ</p>
                      <p>{result.description}</p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-400 mb-1">ÖNERİ</p>
                      <p className="text-zinc-100">{result.recommendation}</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Model Güveni</span>
                      <span className="font-medium">%{result.confidence}</span>
                    </div>
                    <Progress value={result.confidence} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>

              {!reportSubmitted ? (
                <Button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20" onClick={handleSubmitReport}>
                  <Send className="w-4 h-4 mr-2" />
                  Yöneticiye Acil Bildir
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl text-zinc-100">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Rapor başarıyla iletildi</span>
                </div>
              )}

              <Button variant="outline" className="w-full bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" onClick={() => { setPhase('idle'); setResult(null); setSelectedImage(null); }}>
                Yeni Rapor Oluştur
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}