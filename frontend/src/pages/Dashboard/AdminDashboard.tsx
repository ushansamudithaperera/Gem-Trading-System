import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-purple-600">Admin</span>. Platform overview and dispute management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accentColor="blue" />
        <StatCard label="Active Gems" value={stats.totalGems} icon={ShoppingBag} accentColor="sky" />
        <StatCard label="Platform Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} accentColor="emerald" />
        <StatCard label="Active Orders" value={stats.activeOrders} icon={Shield} accentColor="indigo" />
        <StatCard label="Pending Disputes" value={stats.pendingDisputes} icon={AlertTriangle} accentColor="amber" />
      </div>

      <div className="premium-section-card">
        <div className="premium-section-header flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            Dispute Investigation Backlog
          </h3>
          <Link to="/admin/disputes">
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">View All</Button>
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : disputes.length === 0 ? (
            <p className="text-slate-500">No pending disputes. All good!</p>
          ) : (
            <div className="divide-y divide-slate-100/80">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">Order #{dispute.orderId?.orderNumber?.slice(-8) || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{dispute.reason}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-50/80 text-rose-700 ring-1 ring-inset ring-rose-200/50 shadow-sm">
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
        </div>
      </div>
    </div>
  );
};