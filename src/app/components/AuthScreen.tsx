import React, { useState } from 'react';
import { Zap, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Chrome } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuthenticated: (user: { name: string; email: string; role: 'driver' | 'station_owner' | 'admin' }) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'driver' as 'driver' | 'station_owner'
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
    // Simulate role-based auth
    if (loginForm.email.includes('admin')) {
      onAuthenticated({ name: 'Admin User', email: loginForm.email, role: 'admin' });
    } else if (loginForm.email.includes('owner')) {
      onAuthenticated({ name: 'İstasyon Sahibi', email: loginForm.email, role: 'station_owner' });
    } else {
      onAuthenticated({ name: 'Hatice Çevik', email: loginForm.email, role: 'driver' });
    }
    toast.success('Hoş geldiniz!');
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

  const handleGuestLogin = () => {
    onAuthenticated({ name: 'Misafir Kullanıcı', email: 'guest@esarj.com', role: 'driver' });
    toast.info('Misafir olarak devam ediyorsunuz');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-500/30">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">eŞarj</h1>
          <p className="text-blue-200/70 text-sm mt-1">AI-Powered EV Charging Platform</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full bg-white/10 border-white/20 mb-6">
                <TabsTrigger value="login" className="flex-1 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Giriş Yap
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Kayıt Ol
                </TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white/80 text-sm">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white/80 text-sm">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 border-0 text-white font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Giriş yapılıyor...</>
                    ) : (
                      <><ArrowRight className="w-4 h-4 mr-2" />Giriş Yap</>
                    )}
                  </Button>

                  {/* Demo hint */}
                  <div className="text-xs text-white/40 text-center space-y-1 pt-1">
                    <p>Demo: <span className="text-white/60">herhangi@email.com</span> (sürücü)</p>
                    <p>Demo: <span className="text-white/60">owner@email.com</span> (istasyon sahibi)</p>
                    <p>Demo: <span className="text-white/60">admin@email.com</span> (yönetici)</p>
                  </div>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Hesap Türü</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'driver', label: '🚗 EV Sürücüsü' },
                        { value: 'station_owner', label: '⚡ İstasyon Sahibi' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: opt.value as any })}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                            registerForm.role === opt.value
                              ? 'bg-blue-500/30 border-blue-400 text-white'
                              : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
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
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="email"
                          placeholder="email@..."
                          value={registerForm.email}
                          onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Telefon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          placeholder="+90 5xx"
                          value={registerForm.phone}
                          onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Şifre</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Şifre Tekrar</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={registerForm.confirmPassword}
                          onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 border-0 text-white font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Hesap oluşturuluyor...</>
                    ) : (
                      'Kayıt Ol'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative text-center">
                <span className="bg-transparent px-2 text-white/30 text-xs">veya</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white" onClick={handleGuestLogin}>
              Misafir Olarak Devam Et
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-4">
          256-bit SSL şifreleme • PCI DSS uyumlu
        </p>
      </div>
    </div>
  );
}