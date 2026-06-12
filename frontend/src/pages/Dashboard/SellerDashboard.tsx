import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSellerStats, getSellerGems } from '../../services/gem.service';
import { AddGemModal } from '../Marketplace/MarketplaceList';

interface SellerStats {
  totalRevenue: number;
  activeListings: number;
  totalSold: number;
  pendingOrders: number;
}

export const SellerDashboard: React.FC = () => {
  const { user: _user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<SellerStats>({
    totalRevenue: 0,
    activeListings: 0,
    totalSold: 0,
    pendingOrders: 0,
  });
  const [recentGems, setRecentGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddGemModalOpen, setIsAddGemModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, gems] = await Promise.all([
        getSellerStats(),
        getSellerGems(),
      ]);
      setStats(statsData);
      setRecentGems(gems.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-emerald-600">Seller</span>. Manage your gem listings and sales</p>
        </div>
        <Button 
          onClick={() => setIsAddGemModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          List New Gem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} accentColor="emerald" />
        <StatCard label="Active Listings" value={stats.activeListings} icon={Package} accentColor="emerald" />
        <StatCard label="Total Sold" value={stats.totalSold} icon={ShoppingCart} accentColor="sky" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={TrendingUp} accentColor="amber" />
      </div>

      <div className="premium-section-card">
        <div className="premium-section-header flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Gemstone Listings
          </h3>
          <Link to="/my-gems">
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">Manage Listings</Button>
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : recentGems.length === 0 ? (
            <p className="text-slate-500">You haven't listed any gems yet.</p>
          ) : (
            <div className="divide-y divide-slate-100/80">
              {recentGems.map((gem) => (
                <div key={gem._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={gem.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded-xl border border-white/60 shadow-sm" />
                    <div>
                      <p className="font-semibold text-slate-900">{gem.title}</p>
                      <p className="text-sm text-slate-500">{gem.weightCarats} ct • {gem.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${gem.price.toLocaleString()}</p>
                    <p className={`text-xs font-semibold ${gem.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {gem.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Gemstone Modal */}
      <AddGemModal
        isOpen={isAddGemModalOpen}
        onClose={() => setIsAddGemModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};