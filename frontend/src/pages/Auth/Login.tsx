import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { login } from '../../services/auth.service';
import { setCredentials } from '../../store/slices/authSlice';
import { toast } from '../../components/ui/Toast';
import { Eye, EyeOff, LogIn, ArrowLeft, Gem } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing fields', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email, password });
      dispatch(setCredentials(response));
      toast.success('Welcome back!', `Logged in as ${response.user.firstName}`);
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error('Login failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-50 to-white">
      {/* Mini navigation header */}
      <div className="sticky top-0 z-50 w-full bg-slate-900 shadow-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link to="/" className="flex items-center space-x-2">
            <Gem className="h-5 w-5 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg p-0.5" />
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GemTrader</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-sm text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <Link to="/marketplace" className="text-sm text-slate-300 hover:text-white transition-colors hidden sm:inline">
              Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-emerald-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💎</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">Welcome Back</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Sign in to your GemTrade account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};