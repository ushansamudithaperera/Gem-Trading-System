import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSellerStats, getSellerGems } from '../../services/gem.service';

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

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Sapphire Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 md:p-10 shadow-2xl border border-blue-500/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 rounded-full border border-blue-500/20 backdrop-blur-md mb-4">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
              Sapphire Broker Seller
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-slate-300 mt-2 max-w-xl text-sm">
              Publish gem certifications, verify carats, manage bidding offers, and monitor secure escrow status.
            </p>
          </div>
          <Link to="/my-gems/new" className="shrink-0">
            <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm px-5 py-3 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5">
              <Plus className="h-4 w-4 mr-2" />
              List New Gem
            </button>
          </Link>
        </div>
      </div>

      {/* Elevated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(59,130,246,0.08)] hover:border-blue-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Revenue</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="relative z-20 bg-blue-50 text-blue-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-100/80 shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Active Listings */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(99,102,241,0.08)] hover:border-indigo-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Listings</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.activeListings}</p>
          </div>
          <div className="relative z-20 bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-100/80 shadow-inner">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Total Sold */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.08)] hover:border-emerald-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Sold</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalSold}</p>
          </div>
          <div className="relative z-20 bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100/80 shadow-inner">
            <ShoppingCart className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Escrows */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.08)] hover:border-amber-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pending Escrows</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.pendingOrders}</p>
          </div>
          <div className="relative z-20 bg-amber-50 text-amber-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-amber-100/80 shadow-inner">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Gem Listings Card */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-500 hover:border-blue-300/40 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.05)]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Gemstone Listings
          </CardTitle>
          <Link to="/my-gems">
            <button className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors">
              Manage Listings
            </button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500 text-sm animate-pulse">Loading gemstone vaults...</p>
          ) : recentGems.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">You haven't cataloged any gemstones yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentGems.map((gem) => (
                <div key={gem._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                  <div className="flex items-center gap-4">
                    <img 
                      src={gem.images?.[0] || '/gem-placeholder.png'} 
                      alt="" 
                      className="w-14 h-14 object-cover rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">{gem.title}</p>
                      <p className="text-xs text-slate-400 font-medium">{gem.weightCarats} Carats • {gem.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-850 text-base">${gem.price.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      gem.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-250/20' : 'bg-slate-100 text-slate-700 border border-slate-200/20'
                    }`}>
                      {gem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};