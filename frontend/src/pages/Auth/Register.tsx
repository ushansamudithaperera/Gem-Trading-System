import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { register } from '../../services/auth.service';
import { setCredentials } from '../../store/slices/authSlice';
import { toast } from '../../components/ui/Toast';
import { Eye, EyeOff, UserPlus, Gem, Home, ShoppingBag } from 'lucide-react';

type RoleOption = 'BUYER' | 'SELLER' | 'CUTTER';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    roles: [] as RoleOption[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: RoleOption) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.roles.length === 0) {
      toast.error('Select at least one role (Buyer, Seller, or Cutter)');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      dispatch(setCredentials(response));
      toast.success('Welcome!', `Account created for ${response.user.firstName}`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Registration failed', error.message);
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

      {/* Centered Registration Card */}
      <div className="w-full max-w-md my-8">
        <Card className="border-slate-200/60 shadow-xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Gem className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-955 tracking-tight">Create Account</CardTitle>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Join the gem trading community</p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <Input 
                    id="firstName"
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                    placeholder="John"
                    className="rounded-xl border-slate-200 bg-white/50 focus:bg-white text-xs py-2"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <Input 
                    id="lastName"
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    placeholder="Doe"
                    className="rounded-xl border-slate-200 bg-white/50 focus:bg-white text-xs py-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="you@example.com"
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white text-xs py-2"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <Input 
                  id="phone"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="+94 77 123 4567"
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white text-xs py-2"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="rounded-xl border-slate-200 bg-white/50 focus:bg-white pr-10 text-xs py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="rounded-xl border-slate-200 bg-white/50 focus:bg-white text-xs py-2"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  I want to:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['BUYER', 'SELLER', 'CUTTER'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                        formData.roles.includes(role)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/10'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {role === 'BUYER' && 'Buy Gems'}
                      {role === 'SELLER' && 'Sell Gems'}
                      {role === 'CUTTER' && 'Cut / Polish'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">You can select multiple roles</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-750 hover:to-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
                {!loading && <UserPlus className="h-4 w-4" />}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};