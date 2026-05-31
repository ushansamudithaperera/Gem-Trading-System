import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { register } from '../../services/auth.service';
import { setCredentials } from '../../store/slices/authSlice';
import { toast } from '../../components/ui/Toast';
import { Eye, EyeOff, UserPlus, ArrowLeft, Gem } from 'lucide-react';

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
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors hidden sm:inline">
              Sign In
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
          <CardTitle className="text-2xl text-slate-900">Create Account</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Join the gem trading community</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">First Name</label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Last Name</label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Phone (Optional)</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Confirm Password</label>
              <Input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">I want to:</label>
              <div className="flex flex-wrap gap-3">
                {(['BUYER', 'SELLER', 'CUTTER'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                      formData.roles.includes(role)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400'
                    }`}
                  >
                    {role === 'BUYER' && 'Buy Gems'}
                    {role === 'SELLER' && 'Sell Gems'}
                    {role === 'CUTTER' && 'Cut / Polish'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">You can select multiple roles</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
              {!loading && <UserPlus className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};