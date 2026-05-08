import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import authService from '@/services/authService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: UserRole }>({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password || (isRegister && !form.name)) {
      setError('Please fill in all fields');
      return;
    }

    (async () => {
      let authResponse;
      try {
        authResponse = isRegister
          ? await authService.register({ fullName: form.name, email: form.email, password: form.password, role: form.role })
          : await authService.login({ email: form.email, password: form.password });
      } catch (err) {
        console.error('Auth error', err);
        let responseMessage = '';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as {
            response?: {
              status?: number;
              statusText?: string;
              data?: { message?: string; errors?: Record<string, string> } | string;
            };
            message?: string;
          };

          const rawData = axiosErr.response?.data;
          if (typeof rawData === 'string') {
            try {
              const parsed = JSON.parse(rawData) as { message?: string };
              responseMessage = parsed.message || rawData;
            } catch {
              responseMessage = rawData;
            }
          } else {
            responseMessage =
              rawData?.message ||
              Object.values(rawData?.errors || {}).join(', ');
          }

          if (!responseMessage && axiosErr.response?.status) {
            responseMessage = `Request failed (${axiosErr.response.status}${axiosErr.response.statusText ? ` ${axiosErr.response.statusText}` : ''}).`;
          }

          if (!responseMessage && axiosErr.message) {
            responseMessage = axiosErr.message;
          }
        }

        setError(responseMessage || (err instanceof Error ? err.message : String(err)) || 'Authentication failed. Check the backend is running and the credentials are valid.');
        return;
      }

      try {
        const baseUser = {
          id: 0,
          name: form.name || form.email,
          email: form.email,
          role: form.role,
          token: authResponse.data.accessToken,
          accessToken: authResponse.data.accessToken,
          refreshToken: authResponse.data.refreshToken,
        };

        login(baseUser);

        try {
          const profileResponse = await userService.getMyProfile();
          const profile = profileResponse.data;

          login({
            ...baseUser,
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          });
        } catch (profileErr) {
          console.warn('Signed in, but profile lookup failed. Using basic account data.', profileErr);
        }

        navigate('/dashboard');
      } catch (err) {
        console.error('Post-auth flow error', err);
        setError('Account created, but sign-in session setup failed. Please try signing in with your new account.');
      }
    })();
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Package className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">IT Asset Management System</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Track assets, manage maintenance requests, and generate reports with role-based access control.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">ITAMS</span>
          </div>

          <h2 className="text-2xl font-display font-bold mb-1">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-muted-foreground mb-8">
            {isRegister ? 'Register to start managing assets' : 'Sign in to your account'}
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isRegister && (
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  {(['EMPLOYEE', 'ASSET_MANAGER'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        form.role === role ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'
                      }`}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary font-medium hover:underline">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
