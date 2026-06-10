import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { login } from '../../services/auth.service';
import { setCredentials } from '../../store/slices/authSlice';
import { toast } from '../../components/ui/Toast';
import { Eye, EyeOff, LogIn, Gem, Home, ShoppingBag } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4">
      {/* Top Right Icon Navigation */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <Link
          to="/"
          title="Go to Home"
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all duration-200 relative group flex items-center justify-center bg-white shadow-sm border border-slate-200/50"
        >
          <Home className="h-5 w-5" />
          <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all duration-150 origin-top rounded bg-slate-800 px-2.5 py-1.5 text-xs text-white whitespace-nowrap shadow-md pointer-events-none z-50 font-semibold">
            Go to Home
          </span>
        </Link>
        
        <Link
          to="/marketplace"
          title="Go to Marketplace"
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all duration-200 relative group flex items-center justify-center bg-white shadow-sm border border-slate-200/50"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all duration-150 origin-top rounded bg-slate-800 px-2.5 py-1.5 text-xs text-white whitespace-nowrap shadow-md pointer-events-none z-50 font-semibold">
            Go to Marketplace
          </span>
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md">
        <Card className="border-slate-200/60 shadow-xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Gem className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-950 tracking-tight">Welcome Back</CardTitle>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Sign in to your GemTrade account</p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="rounded-xl border-slate-200 bg-white/50 focus:bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-750 hover:to-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <LogIn className="h-4 w-4" />}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};