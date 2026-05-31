import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-blue-700">Seller</span>. Manage your gem listings and sales</p>
        </div>
        <Link to="/my-gems/new">
          <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            List New Gem
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl flex items-center justify-center border border-emerald-100">
              <DollarSign className="h-6 w-6 text-emerald-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Listings</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeListings}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-center border border-blue-100">
              <Package className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Sold</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalSold}</p>
            </div>
            <div className="bg-sky-50 p-3 rounded-xl flex items-center justify-center border border-sky-100">
              <ShoppingCart className="h-6 w-6 text-sky-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl flex items-center justify-center border border-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300/60 transition-all duration-300">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Gemstone Listings
          </CardTitle>
          <Link to="/my-gems">
            <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">Manage Listings</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : recentGems.length === 0 ? (
            <p className="text-slate-500">You haven't listed any gems yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentGems.map((gem) => (
                <div key={gem._id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={gem.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    <div>
                      <p className="font-medium text-slate-900">{gem.title}</p>
                      <p className="text-sm text-slate-500">{gem.weightCarats} ct • {gem.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${gem.price.toLocaleString()}</p>
                    <p className={`text-xs font-medium ${gem.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {gem.status}
                    </p>
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