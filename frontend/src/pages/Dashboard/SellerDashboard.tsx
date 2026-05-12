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
          <p className="text-slate-700 mt-1">You are currently logged in as a <span className="font-semibold text-blue-700">Seller</span>. Manage your gem listings and sales</p>
        </div>
        <Link to="/my-gems/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            List New Gem
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <DollarSign className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Active Listings</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeListings}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Total Sold</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalSold}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <ShoppingCart className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Listings</CardTitle>
          <Link to="/my-gems">
            <Button variant="ghost" size="sm">Manage Listings</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : recentGems.length === 0 ? (
            <p className="text-gray-500">You haven't listed any gems yet.</p>
          ) : (
            <div className="space-y-3">
              {recentGems.map((gem) => (
                <div key={gem._id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <img src={gem.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-medium">{gem.title}</p>
                      <p className="text-sm text-gray-500">{gem.weightCarats} ct • {gem.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${gem.price.toLocaleString()}</p>
                    <p className={`text-xs ${gem.status === 'AVAILABLE' ? 'text-green-600' : 'text-gray-500'}`}>
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