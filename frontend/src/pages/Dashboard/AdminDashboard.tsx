import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, ShoppingBag, DollarSign, AlertTriangle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminDisputes } from '../../services/admin.service';

interface AdminStats {
  totalUsers: number;
  totalGems: number;
  totalRevenue: number;
  pendingDisputes: number;
  activeOrders: number;
}

export const AdminDashboard: React.FC = () => {
  const { user: _user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGems: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
    activeOrders: 0,
  });
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, disputesData] = await Promise.all([
          getAdminStats(),
          getAdminDisputes(),
        ]);
        setStats(statsData);
        setDisputes(disputesData.slice(0, 5));
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-700">Platform overview and dispute management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Active Gems</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalGems}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <ShoppingBag className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Platform Revenue</p>
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
              <p className="text-sm text-slate-700 font-medium">Active Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeOrders}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <Shield className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">Pending Disputes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingDisputes}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-2 rounded-full flex items-center justify-center border border-white/50">
              <AlertTriangle className="h-6 w-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Disputes</CardTitle>
          <Link to="/admin/disputes">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : disputes.length === 0 ? (
            <p className="text-gray-500">No pending disputes. All good!</p>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Order #{dispute.orderId?.orderNumber?.slice(-8) || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{dispute.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600">Open since {new Date(dispute.createdAt).toLocaleDateString()}</p>
                    <Link to={`/admin/disputes/${dispute._id}`}>
                      <Button variant="link" size="sm">Resolve</Button>
                    </Link>
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