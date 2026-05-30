import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
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
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Ruby Red Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-8 md:p-10 shadow-2xl border border-rose-500/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-slate-500/5 blur-3xl"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 rounded-full border border-rose-500/20 backdrop-blur-md mb-4">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
            System Administrator
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Admin Auditing Panel
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm">
            Monitor escrow disbursements, investigate platform dispute tickets, inspect newly cataloged gemstone carats, and oversee system health.
          </p>
        </div>
      </div>

      {/* Elevated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(100,116,139,0.08)] hover:border-slate-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Users</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="relative z-20 bg-slate-50 text-slate-600 p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-slate-100/80 shadow-inner">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Active Gems */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(59,130,246,0.08)] hover:border-blue-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Gems</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalGems}</p>
          </div>
          <div className="relative z-20 bg-blue-50 text-blue-600 p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-100/80 shadow-inner">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.08)] hover:border-emerald-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Platform Revenue</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="relative z-20 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100/80 shadow-inner">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(99,102,241,0.08)] hover:border-indigo-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Orders</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.activeOrders}</p>
          </div>
          <div className="relative z-20 bg-indigo-50 text-indigo-600 p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-indigo-100/80 shadow-inner">
            <Shield className="h-5 w-5" />
          </div>
        </div>

        {/* Open Disputes */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(244,63,94,0.08)] hover:border-rose-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Open Disputes</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.pendingDisputes}</p>
          </div>
          <div className="relative z-20 bg-rose-50 text-rose-600 p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-rose-100/80 shadow-inner">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Disputes Card */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-500 hover:border-rose-300/40 hover:shadow-[0_20px_50px_-10px_rgba(244,63,94,0.05)]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            Dispute Investigation Backlog
          </CardTitle>
          <Link to="/admin/disputes">
            <button className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1.5 transition-colors">
              Manage Disputes
            </button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500 text-sm animate-pulse">Consulting platform ledger...</p>
          ) : disputes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No platform dispute tickets require attention. Perfect!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                  <div>
                    <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-rose-600 transition-colors">Escrow Order #{dispute.orderId?.orderNumber?.slice(-8).toUpperCase() || 'N/A'}</p>
                    <p className="text-xs text-slate-400 font-medium">{dispute.reason}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700 border border-rose-200/20">
                        Dispute Ticket
                      </span>
                    </div>
                    <Link to={`/admin/disputes/${dispute._id}`}>
                      <button className="inline-flex items-center justify-center text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg px-3 py-1.5 transition-all duration-300">
                        Investigate
                      </button>
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