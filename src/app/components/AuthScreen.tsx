import React, { useState } from 'react';
import { Zap, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuthenticated: (user: { name: string; email: string; role: 'driver' | 'station_owner' | 'admin' }) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    role: 'driver' as 'driver' | 'station_owner' | 'admin'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);

    // Rol tabanlı giriş simülasyonu
    if (loginForm.email.includes('admin')) {
      onAuthenticated({ name: 'Sistem Yöneticisi', email: loginForm.email, role: 'admin' });
      toast.success('Yönetici paneline yönlendiriliyorsunuz...');
    } else if (loginForm.email.includes('owner')) {
      onAuthenticated({ name: 'İstasyon Sahibi', email: loginForm.email, role: 'station_owner' });
      toast.success('İstasyon yönetim paneline yönlendiriliyorsunuz...');
    } else {
      onAuthenticated({ name: 'Sürücü Kullanıcı', email: loginForm.email, role: 'driver' });
      toast.success('Hoş geldiniz!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    onAuthenticated({ name: registerForm.name, email: registerForm.email, role: registerForm.role });
    toast.success('Hesabınız başarıyla oluşturuldu!');
  };

  // Hızlı test için Misafir Girişi Admin yetkisiyle güncellendi
  const handleGuestLogin = () => {
    onAuthenticated({ name: 'Yönetici (Misafir)', email: 'admin@esarj.com', role: 'admin' });
    toast.info('Yönetici yetkisiyle devam ediyorsunuz');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/30">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">eŞarj</h1>
          <p className="text-blue-200/70 text-sm mt-1">AI-Powered EV Charging Platform</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full bg-white/10 border-white/20 mb-6">
                <TabsTrigger value="login" className="flex-1 text-white data-[state=active]:bg-white/20">Giriş Yap</TabsTrigger>
                <TabsTrigger value="register" className="flex-1 text-white data-[state=active]:bg-white/20">Kayıt Ol</TabsTrigger>
              </TabsList>

              {/* GİRİŞ FORMU */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        type="email"
                        placeholder="admin@email.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>

                  <div className="text-xs text-white/40 text-center space-y-1 pt-1 italic">
                    <p>Admin Test: <span className="text-white/60">admin@email.com</span></p>
                  </div>
                </form>
              </TabsContent>

              {/* KAYIT FORMU */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Hesap Türü</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'driver', label: '🚗 Sürücü' },
                        { value: 'station_owner', label: '⚡ Sahibi' },
                        { value: 'admin', label: '🛡️ Admin' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: opt.value as any })}
                          className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${
                            registerForm.role === opt.value
                              ? 'bg-blue-500/40 border-blue-400 text-white shadow-lg'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Ad Soyad</Label>
                    <div className="relative">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                       <Input
                        placeholder="Ad Soyad"
                        value={registerForm.name}
                        onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="pl-10 bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">E-posta</Label>
                      <Input
                        type="email"
                        placeholder="E-posta"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">Telefon</Label>
                      <Input
                        placeholder="Telefon"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">Şifre</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">Şifre Tekrar</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold mt-2">
                    {isLoading ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative text-center"><span className="bg-transparent px-2 text-white/30 text-xs uppercase tracking-widest">veya</span></div>
            </div>

            <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white/70 hover:text-white" onClick={handleGuestLogin}>
               <ShieldCheck className="w-4 h-4 mr-2" /> Misafir (Admin Test)
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-white/20 text-[10px] mt-4">
          256-bit SSL şifreleme • Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
}