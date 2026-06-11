import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';
import { Loader2, Check, User, MapPin, Clock, Star, UploadCloud, X } from 'lucide-react';
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
  });

  const [existingPortfolio, setExistingPortfolio] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (user?.lapidaryProfile) {
      setForm({
        description: user.lapidaryProfile.description || '',
        location: user.lapidaryProfile.location || '',
        avgTurnaroundDays: user.lapidaryProfile.avgTurnaroundDays?.toString() || '',
        specialties: user.lapidaryProfile.specialties?.join(', ') || '',
      });
      if (user.lapidaryProfile.portfolio) {
        setExistingPortfolio(user.lapidaryProfile.portfolio);
      }
      setFetching(false);
    } else {
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
            });
            if (lapidaryProfile.portfolio) {
              setExistingPortfolio(lapidaryProfile.portfolio);
            }
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

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (filesArray.length > 5) {
        toast.error('Too many files', 'You can only upload up to 5 portfolio images.');
        return;
      }

      setSelectedFiles(filesArray);
      
      // Generate preview URLs
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previewUrls];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', form.description);
      formData.append('location', form.location);
      if (form.avgTurnaroundDays) {
        formData.append('avgTurnaroundDays', form.avgTurnaroundDays);
      }
      formData.append('specialties', form.specialties); // The backend splits this by comma

      selectedFiles.forEach((file) => {
        formData.append('portfolio', file);
      });

      await api.put('/users/cutter-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile Updated', 'Your Lapidary public profile has been updated successfully.');
      
      // Clear selections on success
      setSelectedFiles([]);
      setPreviewUrls([]);
      
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
    <Card className="border border-slate-200 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Lapidary Public Profile</CardTitle>
        <CardDescription className="text-slate-500">
          Update the public information buyers will see when hiring you for cutting jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Bio / Description */}
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
            {/* Location */}
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

            {/* Average Turnaround Time */}
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

          {/* Specialties */}
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

          {/* Real File Upload - Portfolio */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Portfolio Images (Max 5)
            </label>
            
            {/* File Input */}
            <div className="flex items-center justify-center w-full">
              <label htmlFor="portfolio-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-400">JPEG, PNG or WEBP (Max 5MB per file)</p>
                </div>
                <input 
                  id="portfolio-upload" 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Existing Portfolio (if no new files selected) */}
            {existingPortfolio.length > 0 && selectedFiles.length === 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-500 mb-2">Current Portfolio:</p>
                <div className="flex flex-wrap gap-3">
                  {existingPortfolio.map((url, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-md overflow-hidden border border-slate-200">
                      {/* Assuming backend serves them via /uploads/filename */}
                      <img src={`http://localhost:5000${url}`} alt="Portfolio" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Uploading new files will replace your current portfolio.</p>
              </div>
            )}

            {/* Selected Files Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-emerald-600 mb-2">New Portfolio Previews:</p>
                <div className="flex flex-wrap gap-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-md overflow-hidden border border-slate-200 group">
                      <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  Uploading...
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
