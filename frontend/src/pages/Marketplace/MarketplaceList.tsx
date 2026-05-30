import React, { useState, useEffect, useCallback } from 'react';
import { GemCard, Gem } from '../../components/marketplace/GemCard';
import { GemFilters, FilterState } from '../../components/marketplace/GemFilters';
import { BidModal } from '../../components/marketplace/BidModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getMarketplace, getSellerGems, getSellerStats, createGem } from '../../services/gem.service';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  SlidersHorizontal,
  Grid3x3,
  LayoutList,
  Plus,
  PackageOpen,
  Eye,
  DollarSign,
  TrendingUp,
  Pencil,
  XCircle,
  X,
  Upload,
  Gem as GemIcon,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────

/** Read the active sidebar role from localStorage (set by the Sidebar role-switcher). */
const getActiveRole = (): string => {
  return localStorage.getItem('activeSidebarRole') || 'BUYER';
};

// ─── Seller Stat Card ─────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string; // tailwind text-color for the icon
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, accent }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

// ─── Add New Gemstone Modal ───────────────────────────────

interface AddGemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGemModal: React.FC<AddGemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'ROUGH' as 'ROUGH' | 'POLISHED',
    weightCarats: '',
    price: '',
    location: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createGem({
        title: form.title,
        description: form.description,
        type: form.type,
        weightCarats: Number(form.weightCarats),
        price: Number(form.price),
        location: form.location,
      });
      onSuccess();
      onClose();
      setForm({ title: '', description: '', type: 'ROUGH', weightCarats: '', price: '', location: '' });
    } catch (err) {
      console.error('Failed to create gem:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <GemIcon className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Add New Gemstone</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="e.g., Ceylon Blue Sapphire 3ct"
              className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>

          {/* Type + Weight row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gem Type</label>
              <select
                value={form.type}
                onChange={e => handleChange('type', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              >
                <option value="ROUGH">Rough</option>
                <option value="POLISHED">Polished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (ct)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.weightCarats}
                onChange={e => handleChange('weightCarats', e.target.value)}
                placeholder="3.50"
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Price + Location row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="2500"
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                required
                type="text"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                placeholder="Ratnapura"
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Describe origin, clarity, colour, treatments …"
              className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Publishing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Seller Inventory Table ───────────────────────────────

interface SellerGem {
  _id: string;
  title: string;
  type: 'ROUGH' | 'POLISHED';
  weightCarats: number;
  price: number;
  location: string;
  status: string;
  images: string[];
  createdAt: string;
}

interface SellerStats {
  activeListings: number;
  totalViews: number;
  totalValue: number;
  totalOffers: number;
}

interface SellerInventoryViewProps {
  gems: SellerGem[];
  stats: SellerStats;
  loading: boolean;
  onAddNew: () => void;
  onRefresh: () => void;
}

const SellerInventoryView: React.FC<SellerInventoryViewProps> = ({
  gems,
  stats,
  loading,
  onAddNew,
}) => {
  const defaultImage = 'https://placehold.co/80x80?text=Gem';

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<PackageOpen className="h-5 w-5" />}
          label="Active Listings"
          value={stats.activeListings}
          accent="text-teal-600"
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          accent="text-sky-600"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          accent="text-emerald-600"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Pending Offers"
          value={stats.totalOffers}
          accent="text-amber-600"
        />
      </div>

      {/* Inventory Table / Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : gems.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600/10 mb-4">
            <GemIcon className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Listings Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs text-center">
            Start selling by creating your first gemstone listing. It only takes a minute.
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Your First Listing
          </button>
        </div>
      ) : (
        /* ── Inventory Table ── */
        <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[3.5fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 border-b border-white/40 bg-white/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Gemstone</span>
            <span>Type</span>
            <span>Weight</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/30">
            {gems.map((gem) => (
              <div
                key={gem._id}
                className="grid grid-cols-1 md:grid-cols-[3.5fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 items-center hover:bg-white/30 transition-colors"
              >
                {/* Gem Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={gem.images?.[0] || defaultImage}
                    alt={gem.title}
                    className="h-10 w-10 rounded-lg object-cover border border-white/50 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{gem.title}</p>
                    <p className="text-xs text-slate-500 truncate">📍 {gem.location}</p>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <Badge variant={gem.type === 'ROUGH' ? 'warning' : 'success'}>
                    {gem.type}
                  </Badge>
                </div>

                {/* Weight */}
                <p className="text-sm font-medium text-slate-700">{gem.weightCarats} ct</p>

                {/* Price */}
                <p className="text-sm font-bold text-emerald-600">${gem.price.toLocaleString()}</p>

                {/* Status */}
                <div>
                  <Badge
                    variant={
                      gem.status === 'AVAILABLE' || gem.status === 'LISTED'
                        ? 'success'
                        : gem.status === 'SOLD'
                        ? 'info'
                        : 'secondary'
                    }
                  >
                    {gem.status}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    title="Edit Listing"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/60 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    title="Unlist Gemstone"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50/50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100/60 hover:text-rose-700 transition-all cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Unlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────

export const MarketplaceList: React.FC = () => {
  // ── Buyer view state ────────────────────────────────────
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    minPrice: '',
    maxPrice: '',
    minWeight: '',
    maxWeight: '',
    location: '',
  });
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Seller view state ───────────────────────────────────
  const [sellerGems, setSellerGems] = useState<SellerGem[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    activeListings: 0,
    totalViews: 0,
    totalValue: 0,
    totalOffers: 0,
  });
  const [sellerLoading, setSellerLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Active perspective sync ─────────────────────────────
  const [activeRole, setActiveRole] = useState(getActiveRole);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isSeller = activeRole === 'SELLER';
  const limit = 12;

  // Listen for sidebar role changes
  useEffect(() => {
    const sync = () => setActiveRole(getActiveRole());
    window.addEventListener('activeRoleChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('activeRoleChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // ── Buyer data fetching ─────────────────────────────────
  const fetchBuyerGems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMarketplace({ ...filters, page, limit });
      setGems(response.gems);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch gems:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (!isSeller) fetchBuyerGems();
  }, [isSeller, fetchBuyerGems]);

  // ── Seller data fetching ────────────────────────────────
  const fetchSellerData = useCallback(async () => {
    setSellerLoading(true);
    try {
      const [gemsRes, statsRes] = await Promise.all([
        getSellerGems(),
        getSellerStats(),
      ]);
      setSellerGems(gemsRes || []);
      setSellerStats({
        activeListings: statsRes?.activeListings ?? gemsRes?.length ?? 0,
        totalViews: statsRes?.totalViews ?? 0,
        totalValue: statsRes?.totalValue ?? 0,
        totalOffers: statsRes?.totalOffers ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
      // Graceful fallback – show empty state
      setSellerGems([]);
      setSellerStats({ activeListings: 0, totalViews: 0, totalValue: 0, totalOffers: 0 });
    } finally {
      setSellerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSeller && isAuthenticated) fetchSellerData();
  }, [isSeller, isAuthenticated, fetchSellerData]);

  // ── Buyer handlers ──────────────────────────────────────
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({ type: '', minPrice: '', maxPrice: '', minWeight: '', maxWeight: '', location: '' });
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // ── Render ──────────────────────────────────────────────

  // ════════════════════════════════════════════════════════
  //  SELLER VIEW — Inventory / Listing Management
  // ════════════════════════════════════════════════════════
  if (isSeller) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your gemstone inventory and track performance
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-teal-700 hover:shadow-xl focus:ring-2 focus:ring-teal-500/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Gemstone
          </button>
        </div>

        {/* Seller Inventory Content */}
        <SellerInventoryView
          gems={sellerGems}
          stats={sellerStats}
          loading={sellerLoading}
          onAddNew={() => setShowAddModal(true)}
          onRefresh={fetchSellerData}
        />

        {/* Add Gemstone Modal */}
        <AddGemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSellerData}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  BUYER / CUTTER VIEW — Browse & Filter Marketplace
  // ════════════════════════════════════════════════════════
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gem Marketplace</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Filters Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="hidden md:block md:w-64 flex-shrink-0">
          <GemFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : gems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-emerald-200">
              <p className="text-slate-500">No gem listings found.</p>
              <Button onClick={handleResetFilters} variant="link" className="mt-2">
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {gems.map((gem) => (
                  <GemCard
                    key={gem._id}
                    gem={gem}
                    isAuthenticated={isAuthenticated}
                    onBid={() => setSelectedGem(gem)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <GemFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobile
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bid Modal */}
      {selectedGem && (
        <BidModal
          isOpen={!!selectedGem}
          onClose={() => setSelectedGem(null)}
          gem={selectedGem}
        />
      )}
    </div>
  );
};