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
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-purple-600">Admin</span>. Platform overview and dispute management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-center border border-blue-100">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Gems</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalGems}</p>
            </div>
            <div className="bg-sky-50 p-3 rounded-xl flex items-center justify-center border border-sky-100">
              <ShoppingBag className="h-6 w-6 text-sky-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Platform Revenue</p>
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
              <p className="text-sm text-slate-500 font-medium">Active Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeOrders}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl flex items-center justify-center border border-indigo-100">
              <Shield className="h-6 w-6 text-indigo-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Disputes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingDisputes}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl flex items-center justify-center border border-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300/60 transition-all duration-300">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            Dispute Investigation Backlog
          </CardTitle>
          <Link to="/admin/disputes">
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : disputes.length === 0 ? (
            <p className="text-slate-500">No pending disputes. All good!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-medium text-slate-900">Order #{dispute.orderId?.orderNumber?.slice(-8) || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{dispute.reason}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700 border border-rose-200/20">
                        Dispute Ticket
                      </span>
                    </div>
                    <Link to={`/admin/disputes/${dispute._id}`}>
                      <Button variant="link" size="sm" className="text-purple-600 hover:text-purple-700">Resolve</Button>
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