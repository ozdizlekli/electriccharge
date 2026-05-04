import React, { useState } from 'react';
import { Zap, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

export type UserRole = 'driver' | 'station_owner' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

// ── localStorage helpers ─────────────────────────────────────────────────────

const LS_USERS_KEY = 'esarj_registered_users';

interface StoredUser extends AuthUser {
  password: string;
  phone: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

// ── Component ────────────────────────────────────────────────────────────────

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
    role: 'driver' as UserRole,
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));

    const users = getStoredUsers();
    const found = users.find(
      u => u.email.toLowerCase() === loginForm.email.toLowerCase() && u.password === loginForm.password,
    );

    if (found) {
      toast.success(`Hoş geldiniz, ${found.name}!`);
      onAuthenticated({ name: found.name, email: found.email, role: found.role });
    } else {
      toast.error('E-posta veya şifre hatalı.');
      setIsLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
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
    if (registerForm.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === registerForm.email.toLowerCase())) {
      toast.error('Bu e-posta zaten kayıtlı');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const newUser: StoredUser = {
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      role: registerForm.role,
    };
    users.push(newUser);
    saveStoredUsers(users);

    toast.success('Hesabınız başarıyla oluşturuldu!');
    onAuthenticated({ name: newUser.name, email: newUser.email, role: newUser.role });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">EV Hub</h1>
          <p className="text-zinc-400 text-sm mt-1">AI-Powered EV Charging Platform</p>
        </div>

        <Card className="bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full bg-zinc-800/40 border-zinc-700 mb-6">
                <TabsTrigger value="login" className="flex-1 text-white data-[state=active]:bg-zinc-700/50">
                  Giriş Yap
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1 text-white data-[state=active]:bg-zinc-700/50">
                  Kayıt Ol
                </TabsTrigger>
              </TabsList>

              {/* ── LOGIN ── */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        type="email"
                        placeholder="ornek@mail.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                        required
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
                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-100"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-400 text-zinc-950 font-semibold border-0 hover:bg-emerald-300"
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Giriş yapılıyor...</>
                    ) : 'Giriş Yap'}
                  </Button>
                </form>
              </TabsContent>

              {/* ── REGISTER ── */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Role picker */}
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Hesap Türü</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'driver', label: '🚗 Sürücü' },
                        { value: 'station_owner', label: '⚡ Sahibi' },
                        { value: 'admin', label: '🛡️ Admin' },
                      ] as { value: UserRole; label: string }[]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: opt.value })}
                          className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${
                            registerForm.role === opt.value
                              ? 'bg-zinc-800 border-emerald-400 text-zinc-100 shadow-lg'
                              : 'bg-zinc-800/30 border-zinc-800 text-white/60 hover:bg-zinc-800/40'
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
                        className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <Input
                          type="email"
                          placeholder="E-posta"
                          value={registerForm.email}
                          onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="pl-8 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">Telefon</Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                        <Input
                          placeholder="+90 5XX"
                          value={registerForm.phone}
                          onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="pl-8 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                        />
                      </div>
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
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/60 text-[10px]">Tekrar</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-400 text-zinc-950 font-semibold border-0 hover:bg-emerald-300 mt-2"
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Hesap oluşturuluyor...</>
                    ) : 'Kayıt Ol'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

        <p className="text-center text-white/20 text-[10px] mt-4">
          256-bit SSL şifreleme • Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
}
