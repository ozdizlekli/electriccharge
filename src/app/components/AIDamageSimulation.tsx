import React, { useState, useRef } from 'react';
import {
  X, Camera, Upload, AlertTriangle, CheckCircle, Loader2,
  Zap, ShieldAlert,
} from 'lucide-react';
import { Station } from '../types/station';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'uploading' | 'analyzing' | 'complete';

type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface AIDamageReport {
  id: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  damageType: string;
  severity: Severity;
  confidence: number;
  description: string;
  recommendation: string;
  priorityCode: string;
  reportedBy: string;
  status: 'open' | 'in_progress' | 'resolved';
}

// ── Mock analysis results ─────────────────────────────────────────────────────

const SCENARIOS: Omit<AIDamageReport, 'id' | 'stationId' | 'stationName' | 'timestamp' | 'reportedBy' | 'status'>[] = [
  {
    damageType: 'Kablo Hasarı',
    severity: 'high',
    confidence: 94.2,
    description: 'Konektör kablosunda fiziksel hasar tespit edildi. Kablo kılıfında yırtık ve iç tellerde aşınma görülüyor.',
    recommendation: 'Servis ekibinin 24 saat içinde müdahale etmesi gerekmektedir. Güvenlik riski mevcut.',
    priorityCode: 'P1-URGENT',
  },
  {
    damageType: 'Konektör Korozyonu',
    severity: 'medium',
    confidence: 87.5,
    description: 'Şarj konektöründe orta düzeyde korozyon tespit edildi. Bağlantı kalitesini olumsuz etkileyebilir.',
    recommendation: 'Haftalık bakım döngüsünde temizlik ve koruyucu kaplama uygulanmalıdır.',
    priorityCode: 'P2-ROUTINE',
  },
  {
    damageType: 'Ekran Arızası',
    severity: 'low',
    confidence: 91.8,
    description: 'İstasyon ekranında piksel hatası ve görüntü bozukluğu tespit edildi. Işık yayan diot arızası.',
    recommendation: 'Bir sonraki rutin bakımda ekran modülü değiştirilmesi planlanabilir.',
    priorityCode: 'P3-SCHEDULED',
  },
  {
    damageType: 'Kapı/Kasa Hasarı',
    severity: 'low',
    confidence: 96.1,
    description: 'İstasyon kasasında kırık veya çatlak tespit edildi. İç donanımı koruma kapasitesi azalmış.',
    recommendation: 'IP rating standardlarını korumak için kasa onarımı planlanmalıdır.',
    priorityCode: 'P3-SCHEDULED',
  },
  {
    damageType: 'Güç Modülü Arızası',
    severity: 'critical',
    confidence: 98.4,
    description: 'DC güç modülünde aşırı ısınma ve elektrik kaçağı belirtisi saptandı. Şarj noktası devre dışı bırakılmalıdır.',
    recommendation: 'ACİL: İstasyon derhal hizmet dışı bırakılmalı, yetkili servis çağrılmalıdır.',
    priorityCode: 'P0-CRITICAL',
  },
];

const LS_KEY = 'ai_damage_reports';

function saveReport(report: AIDamageReport) {
  try {
    const existing: AIDamageReport[] = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    existing.unshift(report);
    localStorage.setItem(LS_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save AI damage report', e);
  }
}

// ── Severity config ───────────────────────────────────────────────────────────

const severityConfig: Record<Severity, { label: string; color: string; dot: string }> = {
  low:      { label: 'Düşük',   color: 'bg-zinc-800 text-zinc-300 border-zinc-700', dot: '🔵' },
  medium:   { label: 'Orta',    color: 'bg-zinc-800 text-zinc-300 border-zinc-700', dot: '🟡' },
  high:     { label: 'Yüksek',  color: 'bg-zinc-800 text-zinc-300 border-zinc-700', dot: '🟠' },
  critical: { label: 'Kritik',  color: 'bg-zinc-800 text-zinc-200 border-zinc-700', dot: '🔴' },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  station: Station;
  onClose: () => void;
}

const ANALYSIS_STEPS = ['Görsel İşleniyor', 'Nesne Tespiti', 'Hasar Sınıflandırma', 'Öncelik Atama'];

export function AIDamageSimulation({ station, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<AIDamageReport | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!previewSrc && !category) {
      toast.error('Lütfen bir fotoğraf yükleyin veya hasar kategorisi seçin');
      return;
    }

    // Upload phase
    setPhase('uploading');
    setProgress(0);
    await sleep(900);

    // Analysis phase
    setPhase('analyzing');
    const ticks = [10, 25, 42, 58, 71, 84, 93, 100];
    for (let i = 0; i < ticks.length; i++) {
      await sleep(350);
      setProgress(ticks[i]);
      setStepIdx(Math.min(Math.floor(i / 2), ANALYSIS_STEPS.length - 1));
    }

    // Pick scenario
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const report: AIDamageReport = {
      ...scenario,
      id: `dmg_${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: new Date().toISOString(),
      reportedBy: 'Sürücü (Mobil Uygulama)',
      status: 'open',
    };
    setResult(report);
    setPhase('complete');
    toast.success('AI analizi tamamlandı!');
  };

  const handleSubmitReport = () => {
    if (!result) return;
    saveReport(result);
    setSubmitted(true);
    toast.success(`Rapor iletildi! Öncelik: ${result.priorityCode}`);
    setTimeout(onClose, 2200);
  };

  const reset = () => {
    setPhase('idle');
    setPreviewSrc(null);
    setDescription('');
    setCategory('');
    setProgress(0);
    setStepIdx(0);
    setResult(null);
    setSubmitted(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/60 z-[10010] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-950 w-full md:max-w-lg md:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between flex-shrink-0 text-zinc-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-bold">AI Hasar Bildirimi</div>
              <div className="text-xs text-zinc-400 truncate">{station.name}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── IDLE ── */}
          {phase === 'idle' && (
            <div className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <Label className="text-sm font-semibold text-zinc-200 mb-2 block">Hasar Fotoğrafı</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    previewSrc
                      ? 'border-emerald-500 bg-zinc-900/60'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                  onClick={() => fileRef.current?.click()}
                >
                  {previewSrc ? (
                    <div className="space-y-2">
                      <img src={previewSrc} alt="Hasar fotoğrafı" className="w-full h-44 object-cover rounded-lg" />
                      <p className="text-sm text-emerald-400 font-medium">✓ Fotoğraf yüklendi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center gap-3">
                        <Camera className="w-8 h-8 text-zinc-500" />
                        <Upload className="w-8 h-8 text-zinc-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">Fotoğraf çek veya yükle</p>
                      <p className="text-xs text-zinc-500">PNG, JPG desteklenir</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-200">Hasar Kategorisi</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500">
                    <SelectValue placeholder="Hasar türünü seçin" />
                  </SelectTrigger>
                  <SelectContent className="z-[10020] bg-zinc-900 border-zinc-800 text-zinc-100">
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
                <Label className="text-sm font-semibold text-zinc-200">Açıklama (isteğe bağlı)</Label>
                <Textarea
                  placeholder="Hasarı kısaca açıklayın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20"
                onClick={runAnalysis}
              >
                <Zap className="w-4 h-4 mr-2" />
                AI ile Analiz Et
              </Button>
            </div>
          )}

          {/* ── UPLOADING ── */}
          {phase === 'uploading' && (
            <div className="p-8 flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-zinc-700 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-lg text-zinc-100">Fotoğraf Yükleniyor...</p>
                <p className="text-sm text-zinc-400 mt-1">Lütfen bekleyin</p>
              </div>
            </div>
          )}

          {/* ── ANALYZING ── */}
          {phase === 'analyzing' && (
            <div className="p-8 flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-700 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-lg text-zinc-100">AI Analiz Ediyor...</p>
                <p className="text-sm text-zinc-400 mt-1">
                  OpenCV modeliyle hasar sınıflandırılıyor
                </p>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{ANALYSIS_STEPS[stepIdx]}</span>
                  <span>%{progress}</span>
                </div>
                <Progress value={progress} className="h-2" />

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ANALYSIS_STEPS.map((step, i) => (
                    <div
                      key={step}
                      className={`p-2 rounded-lg text-xs text-center transition-colors ${
                        stepIdx > i
                          ? 'bg-zinc-800 text-emerald-400'
                          : stepIdx === i
                          ? 'bg-zinc-800 text-zinc-100 font-medium'
                          : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {stepIdx > i ? '✓ ' : ''}{step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── COMPLETE ── */}
          {phase === 'complete' && result && (
            <div className="p-5 space-y-4">
              {/* Success banner */}
              <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-zinc-100">AI Analizi Tamamlandı</p>
                  <p className="text-xs text-zinc-400">Model güveni: %{result.confidence}</p>
                </div>
              </div>

              {/* Result card */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-lg text-zinc-100">{result.damageType}</h4>
                      <Badge
                        className={`mt-1 border ${severityConfig[result.severity].color}`}
                      >
                        {severityConfig[result.severity].dot} {severityConfig[result.severity].label} Öncelik
                      </Badge>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-zinc-400">Öncelik Kodu</div>
                      <div className="font-mono font-bold text-sm text-zinc-100">
                        {result.priorityCode}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-400 mb-1">AI TESPİTİ</p>
                      <p className="text-zinc-100">{result.description}</p>
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
                      <span className="font-medium text-zinc-100">%{result.confidence}</span>
                    </div>
                    <Progress value={result.confidence} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>

              {/* Report info */}
              <div className="text-xs text-zinc-400 bg-zinc-900 rounded-lg p-3 space-y-1 border border-zinc-800">
                <div className="flex justify-between">
                  <span>Rapor ID</span>
                  <span className="font-mono text-zinc-100">{result.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zaman</span>
                  <span className="text-zinc-100">{new Date(result.timestamp).toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durum</span>
                  <span className="text-emerald-400 font-medium">Açık</span>
                </div>
              </div>

              {/* Actions */}
              {!submitted ? (
                <Button
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20"
                  onClick={handleSubmitReport}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Yöneticiye Acil Bildir
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Rapor başarıyla yöneticiye iletildi</span>
                </div>
              )}

              <Button variant="outline" className="w-full bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" onClick={reset}>
                Yeni Rapor Oluştur
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── util ──────────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
