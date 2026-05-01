import React, { useState } from 'react';
import { X, Zap, Eye, EyeOff, Mail, Lock, User, Phone, Car, Building2, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export type UserRole = 'driver' | 'owner' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  initials: string;
  isPremium: boolean;
}

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
}

type AuthView = 'login' | 'register' | 'role';

const DEMO_ACCOUNTS: Record<string, AuthUser & { password: string }> = {
  'driver@demo.com': { id: 'u1', name: 'Hatice Çevik', email: 'driver@demo.com', password: '123456', phone: '+90 532 454 98 75', role: 'driver', initials: 'HÇ', isPremium: true },
  'owner@demo.com': { id: 'u2', name: 'Ahmet Yılmaz', email: 'owner@demo.com', password: '123456', phone: '+90 532 111 22 33', role: 'owner', initials: 'AY', isPremium: false },
  'admin@demo.com': { id: 'u3', name: 'Admin Kullanıcı', email: 'admin@demo.com', password: '123456', phone: '+90 532 999 00 11', role: 'admin', initials: 'AD', isPremium: true },
};

const ROLE_OPTIONS: { role: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { role: 'driver', label: 'EV Sürücüsü', desc: 'İstasyon bul, rezervasyon yap, şarj et', icon: <Car className="w-6 h-6" />, color: 'blue' },
  { role: 'owner', label: 'İstasyon Sahibi', desc: 'İstasyon ekle, fiyat belirle, istatistik izle', icon: <Building2 className="w-6 h-6" />, color: 'green' },
  { role: 'admin', label: 'Sistem Yöneticisi', desc: 'Tüm sistemi yönet, kullanıcı denetle', icon: <Shield className="w-6 h-6" />, color: 'purple' },
];

export function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const account = DEMO_ACCOUNTS[loginForm.email.toLowerCase()];
      if (account && account.password === loginForm.password) {
        toast.success(`Hoş geldiniz, ${account.name}!`);
        onAuth(account);
      } else {
        toast.error('E-posta veya şifre hatalı.');
        setLoading(false);
      }
    }, 900);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) { toast.error('Şifreler eşleşmiyor.'); return; }
    if (regForm.password.length < 6) { toast.error('Şifre en az 6 karakter olmalı.'); return; }
    setView('role');
  }

  function handleRoleConfirm() {
    setLoading(true);
    setTimeout(() => {
      const initials = regForm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const user: AuthUser = {
        id: `u_${Date.now()}`,
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        role: selectedRole,
        initials,
        isPremium: false,
      };
      toast.success('Hesabınız oluşturuldu!');
      onAuth(user);
    }, 900);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">eŞarj</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Giriş Yap</h2>
                <p className="text-sm text-muted-foreground mt-1">Hesabınıza erişin</p>
              </div>

              {/* Demo accounts hint */}
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Demo Hesaplar (şifre: 123456)</p>
                  <div className="space-y-1">
                    {Object.values(DEMO_ACCOUNTS).map(acc => (
                      <button key={acc.email} onClick={() => setLoginForm({ email: acc.email, password: '123456' })}
                        className="w-full flex items-center justify-between text-xs text-blue-700 hover:bg-blue-100 rounded px-2 py-1 transition-colors">
                        <span>{acc.email}</span>
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">{acc.role}</Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="ornek@mail.com" className="pl-9"
                      value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••" className="pl-9 pr-9"
                      value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Giriş yapılıyor...</> : 'Giriş Yap'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <button onClick={() => setView('register')} className="text-blue-600 font-medium hover:underline">Kayıt Ol</button>
              </p>
            </div>
          )}

          {/* ── REGISTER VIEW ── */}
          {view === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Kayıt Ol</h2>
                <p className="text-sm text-muted-foreground mt-1">Yeni hesap oluşturun</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Ad Soyad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Ad Soyad" className="pl-9"
                      value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="ornek@mail.com" className="pl-9"
                      value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="+90 5XX XXX XX XX" className="pl-9"
                      value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPass ? 'text' : 'password'} placeholder="Min. 6 karakter" className="pl-9 pr-9"
                      value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Şifre Tekrar</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" placeholder="Şifreyi tekrar girin" className="pl-9"
                      value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Devam Et →</Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Hesabınız var mı?{' '}
                <button onClick={() => setView('login')} className="text-blue-600 font-medium hover:underline">Giriş Yap</button>
              </p>
            </div>
          )}

          {/* ── ROLE SELECTION VIEW ── */}
          {view === 'role' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Rol Seçin</h2>
                <p className="text-sm text-muted-foreground mt-1">Sistemi nasıl kullanacaksınız?</p>
              </div>

              <div className="space-y-3">
                {ROLE_OPTIONS.map(opt => (
                  <button key={opt.role} onClick={() => setSelectedRole(opt.role)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${selectedRole === opt.role
                      ? opt.color === 'blue' ? 'border-blue-500 bg-blue-50'
                        : opt.color === 'green' ? 'border-green-500 bg-green-50'
                        : 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRole === opt.role
                      ? opt.color === 'blue' ? 'bg-blue-600 text-white'
                        : opt.color === 'green' ? 'bg-green-600 text-white'
                        : 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-500'}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                    </div>
                    {selectedRole === opt.role && (
                      <div className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        opt.color === 'blue' ? 'bg-blue-600' : opt.color === 'green' ? 'bg-green-600' : 'bg-purple-600'}`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button className="w-full" onClick={handleRoleConfirm} disabled={loading}>
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Hesap Oluşturuluyor...</> : 'Hesap Oluştur'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}