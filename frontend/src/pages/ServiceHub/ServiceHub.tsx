import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Scissors,
  Star,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  AlertCircle,
  Plus,
  Check,
  ChevronRight,
  Shield,
  Layers,
  X,
  Camera,
  FolderKanban,
  Search,
  Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { useRoleTheme } from '../../utils/theme';
import { MyCuttingJobs } from './MyCuttingJobs';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces based on actual API response
// ─────────────────────────────────────────────────────────────────────────────

export interface CutterProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  businessName?: string;
  avatar?: string;
  profilePicture?: string;
  lapidaryProfile?: {
    description?: string;
    location?: string;
    avgTurnaroundDays?: number;
    specialties?: string[];
    portfolio?: string[]; // Arrays of URLs
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const ServiceHub: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { role } = useRoleTheme();
  const isCutter = role === 'CUTTER';

  const [activeTab, setActiveTab] = useState<'find-cutter' | 'my-jobs'>('find-cutter');
  
  // Real Data State
  const [cutters, setCutters] = useState<CutterProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hire Modal State
  const [selectedCutter, setSelectedCutter] = useState<CutterProfile | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [agreedFee, setAgreedFee] = useState<number>(0);
  const [jobSpec, setJobSpec] = useState({ gemName: '', roughWeight: '', targetCut: '', instructions: '' });

  // Fetch real cutters
  useEffect(() => {
    const fetchCutters = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/cutters');
        setCutters(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch cutters", error);
        toast.error('Network Error', 'Failed to load lapidary specialists. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCutters();
  }, []);

  // Filter cutters based on search query
  const filteredCutters = cutters.filter(cutter => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const fullName = `${cutter.firstName} ${cutter.lastName}`.toLowerCase();
    const business = cutter.businessName?.toLowerCase() || '';
    const desc = cutter.lapidaryProfile?.description?.toLowerCase() || '';
    const loc = cutter.lapidaryProfile?.location?.toLowerCase() || '';
    const specs = (cutter.lapidaryProfile?.specialties || []).join(' ').toLowerCase();

    return (
      fullName.includes(query) ||
      business.includes(query) ||
      desc.includes(query) ||
      loc.includes(query) ||
      specs.includes(query)
    );
  });

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Lapidary Request Sent', 'Your escrow agreement has been sent to the cutter.');
    setShowHireModal(false);
  };

  // If the user is a Cutter, render their dedicated dashboard.
  if (isCutter) {
    return <MyCuttingJobs />;
  }

  // Buyer / Seller View: Find a Cutter
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Scissors className="h-8 w-8 text-teal-600" />
            B2B Lapidary Service Hub
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl text-sm">
            Find and hire world-class gem cutters from the global marketplace.
          </p>
        </div>
      </div>

      {/* ─── SEARCH SECTION ─── */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lapidaries by name, specialty, location, or bio..."
            className="w-full text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-shadow"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* ─── CUTTER CARDS GRID ─── */}
      {loading ? (
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Discovering Master Cutters...</h3>
        </div>
      ) : filteredCutters.length === 0 ? (
        <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center min-h-[300px] flex flex-col justify-center">
          <Scissors className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Lapidaries Found</h3>
          <p className="text-sm text-slate-600 mt-1">Try entering a different keyword or location.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCutters.map(cutter => (
            <div
              key={cutter._id}
              className="bg-white/60 backdrop-blur-xl border border-white shadow-sm rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-white/60 bg-gradient-to-br from-teal-500/5 to-transparent">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-extrabold text-xl shadow-inner flex-shrink-0 overflow-hidden">
                      {cutter.avatar || cutter.profilePicture ? (
                        <img src={cutter.avatar || cutter.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        `${cutter.firstName[0]}${cutter.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        {cutter.firstName} {cutter.lastName}
                        {cutter.rating >= 4.5 && (
                          <span className="h-2 w-2 rounded-full bg-teal-500 inline-block" title="Top Rated"></span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold">{cutter.businessName || 'Independent Cutter'}</p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-900 ml-1">{cutter.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-teal-500/20 bg-teal-500/10 text-teal-700">
                    Active Profile
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-6 py-5 space-y-5 flex-1">
                <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-teal-300 pl-3">
                  "{cutter.lapidaryProfile?.description || 'Experienced lapidary professional dedicated to maximizing the brilliance of every stone.'}"
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white/40 p-3 rounded-xl border border-white">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold">{cutter.lapidaryProfile?.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold">Avg. {cutter.lapidaryProfile?.avgTurnaroundDays || '?'} Days</span>
                  </div>
                </div>

                {/* Specialties */}
                {cutter.lapidaryProfile?.specialties && cutter.lapidaryProfile.specialties.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Lapidary Specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cutter.lapidaryProfile.specialties.map(spec => (
                        <span key={spec} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Visual Portfolio Gallery (Render 1st image if exists) */}
                {cutter.lapidaryProfile?.portfolio && cutter.lapidaryProfile.portfolio.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100/60">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Recent Work
                    </span>
                    <div className="relative rounded-xl overflow-hidden h-32 bg-slate-900 group">
                      <img 
                        src={cutter.lapidaryProfile.portfolio[0]} 
                        alt="Portfolio work" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <span className="text-[10px] font-medium text-white flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Portfolio Showcase
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0 border-t border-slate-100/60 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedCutter(cutter);
                    setAgreedFee(0);
                    setShowHireModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:translate-x-1"
                >
                  Request Service
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── HIRE CUTTER REQUEST MODAL (Unchanged functional shell) ─── */}
      {showHireModal && selectedCutter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Secure Escrow Request
                </span>
                <h3 className="text-xl font-extrabold mt-1">
                  Hire {selectedCutter.firstName} {selectedCutter.lastName}
                </h3>
              </div>
              <button
                onClick={() => setShowHireModal(false)}
                className="text-white/80 hover:text-white cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleHireSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Gemstone Name or ID</label>
                  <input
                    required
                    type="text"
                    value={jobSpec.gemName}
                    onChange={(e) => setJobSpec({ ...jobSpec, gemName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="e.g., Uncut Ceylon Blue Sapphire"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Rough Weight</label>
                    <input
                      required
                      type="text"
                      value={jobSpec.roughWeight}
                      onChange={(e) => setJobSpec({ ...jobSpec, roughWeight: e.target.value })}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="e.g., 5.4 ct"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Proposed Escrow Fee (Rs)</label>
                    <input
                      required
                      type="number"
                      value={agreedFee || ''}
                      onChange={(e) => setAgreedFee(Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="e.g., 15000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Cutting Instructions</label>
                  <textarea
                    required
                    rows={3}
                    value={jobSpec.instructions}
                    onChange={(e) => setJobSpec({ ...jobSpec, instructions: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Provide specific faceting instructions..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowHireModal(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                  >
                    <Shield className="h-4 w-4" />
                    Lock Escrow & Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
