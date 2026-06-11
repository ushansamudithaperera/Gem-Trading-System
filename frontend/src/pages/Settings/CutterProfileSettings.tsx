import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';
import { Loader2, Check, User, MapPin, Clock, Star, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const CutterProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    description: '',
    location: '',
    avgTurnaroundDays: '',
    specialties: '',
    portfolio: '',
  });

  useEffect(() => {
    // If the user object already has the lapidary profile, we can populate it.
    // If we want fresh data, we can also fetch from GET /api/v1/users/profile or similar.
    // Since we just added it to the user object on the backend, we can check if it exists on the auth user.
    if (user?.lapidaryProfile) {
      setForm({
        description: user.lapidaryProfile.description || '',
        location: user.lapidaryProfile.location || '',
        avgTurnaroundDays: user.lapidaryProfile.avgTurnaroundDays?.toString() || '',
        specialties: user.lapidaryProfile.specialties?.join(', ') || '',
        portfolio: user.lapidaryProfile.portfolio?.join(', ') || '',
      });
      setFetching(false);
    } else {
      // In case we need to fetch the profile manually (optional if not in Redux store yet)
      const fetchProfile = async () => {
        try {
          const res = await api.get('/users/profile');
          const lapidaryProfile = res.data?.data?.lapidaryProfile;
          if (lapidaryProfile) {
            setForm({
              description: lapidaryProfile.description || '',
              location: lapidaryProfile.location || '',
              avgTurnaroundDays: lapidaryProfile.avgTurnaroundDays?.toString() || '',
              specialties: lapidaryProfile.specialties?.join(', ') || '',
              portfolio: lapidaryProfile.portfolio?.join(', ') || '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch lapidary profile', error);
        } finally {
          setFetching(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description: form.description,
        location: form.location,
        avgTurnaroundDays: form.avgTurnaroundDays ? parseInt(form.avgTurnaroundDays, 10) : undefined,
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        portfolio: form.portfolio.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await api.put('/users/cutter-profile', payload);
      toast.success('Profile Updated', 'Your Lapidary public profile has been updated successfully.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error('Update Failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Lapidary Public Profile</CardTitle>
        <CardDescription className="text-slate-500">
          Update the public information buyers will see when hiring you for cutting jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              About Me / Bio
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your experience, history, and passion for gem cutting..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow disabled:cursor-not-allowed disabled:opacity-50 resize-none pl-9"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                Location
              </label>
              <div className="relative">
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Ratnapura, Sri Lanka"
                  className="pl-9"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="avgTurnaroundDays" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                Average Turnaround Time (Days)
              </label>
              <div className="relative">
                <Input
                  id="avgTurnaroundDays"
                  name="avgTurnaroundDays"
                  type="number"
                  min="1"
                  value={form.avgTurnaroundDays}
                  onChange={handleChange}
                  placeholder="e.g., 7"
                  className="pl-9"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="specialties" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Specialties (Comma Separated)
            </label>
            <div className="relative">
              <Input
                id="specialties"
                name="specialties"
                type="text"
                value={form.specialties}
                onChange={handleChange}
                placeholder="e.g., Faceting, Cabochon, Sapphire Polishing"
                className="pl-9"
              />
              <Star className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-400 ml-1">List your top skills separated by commas.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="portfolio" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Portfolio Image URLs (Comma Separated)
            </label>
            <div className="relative">
              <Input
                id="portfolio"
                name="portfolio"
                type="text"
                value={form.portfolio}
                onChange={handleChange}
                placeholder="e.g., https://example.com/img1.jpg, https://example.com/img2.jpg"
                className="pl-9"
              />
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-400 ml-1">Provide URLs to images showcasing your previous work.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Update Lapidary Profile
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
