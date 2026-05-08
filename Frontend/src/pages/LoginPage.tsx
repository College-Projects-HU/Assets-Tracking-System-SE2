import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Package, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import authService from '@/services/authService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/types/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{ fullName: string; email: string; password: string; role: UserRole }>({
    fullName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
  });
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const hydrateAndLogin = async (tokens: { accessToken: string; refreshToken: string }) => {
    const profile = await userService.getProfile();
    login({
      id: profile.data.id,
      name: profile.data.fullName,
      email: profile.data.email,
      role: profile.data.role,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password || (isRegister && !form.fullName)) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        const response = await authService.register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        await hydrateAndLogin(response.data);
      } else {
        const response = await authService.login({
          email: form.email,
          password: form.password,
        });
        await hydrateAndLogin(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Check the backend services and your credentials.');
    } finally {
      setSubmitting(false);
    }
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
            Track assets, handle assignments, manage maintenance, and review reports from the live backend.
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
            {isRegister ? 'Register against the auth service' : 'Sign in with a backend user account'}
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Enter your name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
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
                  {(['EMPLOYEE', 'ASSET_MANAGER', 'ADMIN'] as const).map(role => (
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
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-primary font-medium hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>

          {!isRegister && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Seeded Admin Account</p>
              <p className="text-xs text-muted-foreground">admin@assets.com / Admin@123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
