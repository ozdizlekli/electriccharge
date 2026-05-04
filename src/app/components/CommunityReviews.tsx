import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, CheckCircle, Zap, Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Station } from '../types/station';
import { toast } from 'sonner';

interface Review {
  id: string;
  stationId: string;
  author: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  tags: string[];
  verified: boolean;
  userHelpedIds: string[]; // Bu ID'ye sahip kullanıcılar "faydalı" oyu vermiş demektir
}

interface StatusReport {
  id: string;
  stationId: string;
  author: string;
  initials: string;
  type: 'available' | 'occupied' | 'broken' | 'queue';
  message: string;
  date: string;
  upvotes: number;
}

interface CommunityReviewsProps {
  station: Station;
  onClose: () => void;
}

const STORAGE_KEY_REVIEWS = 'esarj_community_reviews';
const STORAGE_KEY_REPORTS = 'esarj_status_reports';
const SESSION_ID = `session_${Math.random().toString(36).substr(2, 9)}`;

// Eğer ilk kez giriliyorsa ve hafızada yorum yoksa gösterilecek sahte(seed) yorumlar
const seedReviews: Review[] = [
  {
    id: 'r_seed_1',
    stationId: 'global',
    author: 'Sibel K.',
    initials: 'AY',
    rating: 5,
    comment: 'Şarj noktaları çok hızlı, DC 150kW\'da 20 dakikada %80\'e çıktım. Yakında AVM var, alışveriş yaparken şarj tamamlandı. Kesinlikle tavsiye ederim!',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 12,
    tags: ['Hızlı Şarj', 'Temiz', 'Kolay Erişim'],
    verified: true,
    userHelpedIds: [],
  },
  {
    id: 'r_seed_2',
    stationId: 'global',
    author: 'Zeynep K.',
    initials: 'ZK',
    rating: 4,
    comment: 'Genel olarak iyi bir istasyon. Sadece 1 kez konnektör sorunuyla karşılaştım ama hemen diğerine geçtim. Uygulama üzerinden kolayca rezervasyon yapabildim.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 8,
    tags: ['İyi Konum', 'Güvenilir', 'WiFi'],
    verified: true,
    userHelpedIds: [],
  },
  {
    id: 'r_seed_3',
    stationId: 'global',
    author: 'Mehmet A.',
    initials: 'MA',
    rating: 3,
    comment: 'Şarj hızı bazen düşüyor, özellikle yoğun saatlerde. Fiyatlar biraz yüksek ama konum çok merkezi.',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 5,
    tags: ['Merkezi Konum'],
    verified: false,
    userHelpedIds: [],
  },
];

// LocalStorage'dan ilgili istasyonun yorumlarını çeker
function getReviews(stationId: string): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
    const all: Review[] = stored ? JSON.parse(stored) : seedReviews;
    // 'global' id'li yorumlar her istasyonda demo olarak görünsün diye bırakıldı. İstersen kaldırabilirsin.
    return all.filter(r => r.stationId === stationId || r.stationId === 'global');
  } catch {
    return seedReviews;
  }
}

// LocalStorage'a yeni bir yorum kaydeder
function saveReview(review: Review) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
    const all: Review[] = stored ? JSON.parse(stored) : seedReviews;
    all.unshift(review);
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save review', e);
  }
}

// Bir yoruma "Faydalı" oyu verildiğinde LocalStorage'ı günceller
function updateReviewHelpful(reviewId: string, sessionId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
    const all: Review[] = stored ? JSON.parse(stored) : seedReviews;
    const idx = all.findIndex(r => r.id === reviewId);
    if (idx !== -1 && !all[idx].userHelpedIds.includes(sessionId)) {
      all[idx].helpful += 1;
      all[idx].userHelpedIds.push(sessionId);
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(all));
      return all[idx].helpful;
    }
    return null;
  } catch {
    return null;
  }
}

// Anlık durum raporlarını çeker
function getReports(stationId: string): StatusReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    const all: StatusReport[] = stored ? JSON.parse(stored) : [];
    return all.filter(r => r.stationId === stationId);
  } catch {
    return [];
  }
}

// Anlık durum raporunu kaydeder (Son 100 raporu tutar)
function saveReport(report: StatusReport) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    const all: StatusReport[] = stored ? JSON.parse(stored) : [];
    all.unshift(report);
    const trimmed = all.slice(0, 100);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save report', e);
  }
}

const AVAILABLE_TAGS = ['Hızlı Şarj', 'Temiz', 'Kolay Erişim', 'Güvenilir', 'İyi Konum', 'WiFi', 'Gece Açık', 'Fiyat Uygun'];

const statusOptions = [
  { type: 'available' as const, label: 'Müsait', emoji: '', message: 'Şu an müsait, sorun yok.' },
  { type: 'occupied' as const, label: 'Dolu', emoji: '', message: 'Tüm noktalar dolu, bekleme var.' },
  { type: 'queue' as const, label: 'Kuyruk Var', emoji: '', message: 'Kuyruk var, yaklaşık 15 dk bekleme.' },
  { type: 'broken' as const, label: 'Arızalı', emoji: '', message: 'Bazı noktalar arızalı görünüyor.' },
];

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function CommunityReviews({ station, onClose }: CommunityReviewsProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'status'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<StatusReport[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Bileşen yüklendiğinde hafızadan istasyonun verilerini çek
    setReviews(getReviews(station.id));
    setReports(getReports(station.id));
  }, [station.id]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  function handleSubmitReview() {
    if (newRating === 0) { toast.error('Lütfen bir puan seçin'); return; }
    if (newComment.trim().length < 10) { toast.error('Yorum en az 10 karakter olmalı'); return; }
    
    setIsSubmitting(true);
    
    // Küçük bir bekleme efekti (gerçekçilik katsın diye)
    setTimeout(() => {
      const review: Review = {
        id: `r_${Date.now()}`,
        stationId: station.id, // Hangi istasyona yorum yapıldığı
        author: 'Siz (Sürücü)',
        initials: 'SZ',
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toISOString(),
        helpful: 0,
        tags: selectedTags,
        verified: true,
        userHelpedIds: [],
      };
      
      saveReview(review);
      setReviews(getReviews(station.id)); // Listeyi yenile
      setNewRating(0);
      setNewComment('');
      setSelectedTags([]);
      setShowAddReview(false);
      setIsSubmitting(false);
      toast.success('Yorumunuz eklendi!');
    }, 800);
  }

  function handleHelpful(reviewId: string) {
    const newCount = updateReviewHelpful(reviewId, SESSION_ID);
    if (newCount !== null) {
      // Sadece ilgili yorumu güncelleyelim
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: newCount, userHelpedIds: [...r.userHelpedIds, SESSION_ID] } : r));
      toast.success('Geri bildiriminiz için teşekkürler!');
    } else {
      toast.info('Bunu zaten faydalı buldunuz.');
    }
  }

  function handleStatusReport(type: typeof statusOptions[number]) {
    const report: StatusReport = {
      id: `rep_${Date.now()}`,
      stationId: station.id,
      author: 'Siz',
      initials: 'SZ',
      type: type.type,
      message: type.message,
      date: new Date().toISOString(),
      upvotes: 1,
    };
    saveReport(report);
    setReports(getReports(station.id));
    toast.success(`Durum bildirimi gönderildi: ${type.emoji} ${type.label}`);
  }

  const latestReport = reports[0];

  return (
    <div className="fixed inset-0 bg-black/60 z-[1050] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-zinc-900 w-full md:max-w-2xl md:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-zinc-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-5 h-5 text-zinc-400" />
              <h3 className="font-bold text-lg text-zinc-100">Topluluk</h3>
            </div>
            <p className="text-sm text-zinc-400 truncate max-w-xs">{station.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 flex-shrink-0">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'text-zinc-100 border-b-2 border-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Değerlendirmeler ({reviews.length})
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'status' ? 'text-zinc-100 border-b-2 border-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
            onClick={() => setActiveTab('status')}
          >
            Anlık Durum
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* ── REVIEWS TAB ── */}
          {activeTab === 'reviews' && (
            <div className="p-4 space-y-4">
              
              {/* Rating Summary */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-zinc-100">{avgRating.toFixed(1)}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{reviews.length} yorum</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {ratingCounts.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 w-4">{star}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all"
                              style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 w-4">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Review Button */}
              {!showAddReview && (
                <Button className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => setShowAddReview(true)}>
                  <Star className="w-4 h-4 mr-2" />
                  Değerlendirme Yaz
                </Button>
              )}

              {/* Add Review Form */}
              {showAddReview && (
                <Card className="bg-zinc-900 border border-zinc-800">
                  <CardContent className="p-4 space-y-4">
                    <div className="font-semibold text-sm text-zinc-100">Değerlendirmeniz</div>

                    {/* Star Selector */}
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(s)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 transition-colors ${s <= (hoverRating || newRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                      {newRating > 0 && (
                        <span className="ml-2 self-center text-sm text-zinc-400">
                          {['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][newRating]}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-xs text-zinc-400 mb-2">Etiket ekle (isteğe bağlı)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TAGS.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTags(prev =>
                              prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                            )}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <Textarea
                      placeholder="Deneyiminizi paylaşın... (en az 10 karakter)"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 resize-none"
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" onClick={() => setShowAddReview(false)}>
                        İptal
                      </Button>
                      <Button className="flex-1 bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={handleSubmitReview} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Gönderiliyor...</>
                        ) : 'Gönder'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review List */}
              {reviews.map(review => (
                <Card key={review.id} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">
                          {review.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm text-zinc-100">{review.author}</span>
                          {review.verified && (
                            <span className="flex items-center gap-0.5 text-xs text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> Doğrulandı
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 ml-auto">{formatRelativeDate(review.date)}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed mb-2">{review.comment}</p>
                        {review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {review.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${review.userHelpedIds.includes(SESSION_ID) ? 'text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-100'}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Faydalı ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
                            <Flag className="w-3.5 h-3.5" />
                            Raporla
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-8 text-zinc-400">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Henüz yorum yok. İlk yorumu siz yapın!</p>
                </div>
              )}
            </div>
          )}

          {/* ── STATUS TAB ── */}
          {activeTab === 'status' && (
            <div className="p-4 space-y-4">
              
              {/* Current Live Status */}
              {latestReport ? (
                <Card className={`border ${
                  latestReport.type === 'available' ? 'border-emerald-800 bg-emerald-950/30' :
                  latestReport.type === 'broken' ? 'border-red-800 bg-red-950/30' :
                  latestReport.type === 'queue' ? 'border-orange-800 bg-orange-950/30' :
                  'border-zinc-700 bg-zinc-800/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        latestReport.type === 'available' ? 'bg-green-500 animate-pulse' :
                        latestReport.type === 'broken' ? 'bg-red-500' :
                        latestReport.type === 'queue' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-semibold text-zinc-100">Son Topluluk Bildirimi</span>
                      <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(latestReport.date)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">{latestReport.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">— {latestReport.author} tarafından</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border border-dashed border-zinc-700">
                  <CardContent className="p-4 text-center text-zinc-400">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz durum bildirimi yok.</p>
                    <p className="text-xs mt-1">İstasyondaysanız toplulukla paylaşın!</p>
                  </CardContent>
                </Card>
              )}

              {/* Report Buttons */}
              <div>
                <p className="text-sm font-semibold mb-3 text-zinc-100">Şu anki durumu bildir</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => handleStatusReport(opt)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        opt.type === 'available' ? 'border-emerald-800 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50' :
                        opt.type === 'broken' ? 'border-red-800 bg-red-950/30 text-red-400 hover:bg-red-950/50' :
                        opt.type === 'queue' ? 'border-orange-800 bg-orange-950/30 text-orange-400 hover:bg-orange-950/50' :
                        'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 leading-tight">{opt.message}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Reports */}
              {reports.length > 1 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-zinc-100">Son Bildirimler</p>
                  <div className="space-y-2">
                    {reports.slice(1, 6).map(rep => (
                      <div key={rep.id} className="flex items-center gap-2 text-sm py-2 border-b border-zinc-800 last:border-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          rep.type === 'available' ? 'bg-emerald-500' : rep.type === 'broken' ? 'bg-red-500' : rep.type === 'queue' ? 'bg-orange-500' : 'bg-zinc-500'
                        }`} />
                        <span className="flex-1 text-zinc-300">{rep.message}</span>
                        <span className="text-xs text-zinc-500 flex-shrink-0">{formatRelativeDate(rep.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
