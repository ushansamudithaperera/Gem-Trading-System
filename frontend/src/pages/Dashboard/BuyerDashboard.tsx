import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Package, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../../services/order.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrderSummary {
  _id: string;
  orderNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  gemId: { title: string; images: string[] };
}

export const BuyerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeOrders: 0,
    completedOrders: 0,
    disputes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await getUserOrders();
        setRecentOrders(orders.slice(0, 5));
        const completed = orders.filter((o: any) => o.status === 'COMPLETED');
        const active = orders.filter((o: any) => ['PENDING_DISPATCH', 'SHIPPED', 'DELIVERED', 'IN_CUTTING_PROCESS'].includes(o.status));
        const disputed = orders.filter((o: any) => o.status === 'DISPUTED');
        setStats({
          totalSpent: completed.reduce((sum: number, o: any) => sum + o.amount, 0),
          activeOrders: active.length,
          completedOrders: completed.length,
          disputes: disputed.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = recentOrders.map(order => ({
    name: new Date(order.createdAt).toLocaleDateString(),
    amount: order.amount,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Emerald Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-8 md:p-10 shadow-2xl border border-emerald-500/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Gem VIP Buyer
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome Back, <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">{user?.firstName}</span>!
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm md:text-base">
            Your exclusive portal to the world's finest gemstones. Track active escrows, coordinate cutting processes, and secure certified purchases.
          </p>
        </div>
      </div>

      {/* Elevated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Invested */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.08)] hover:border-emerald-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Invested</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">${stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="relative z-20 bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100/80 shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Active Escrows */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.08)] hover:border-amber-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Escrows</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.activeOrders}</p>
          </div>
          <div className="relative z-20 bg-amber-50 text-amber-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-amber-100/80 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Deals */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(20,184,166,0.08)] hover:border-teal-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Completed Deals</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.completedOrders}</p>
          </div>
          <div className="relative z-20 bg-teal-50 text-teal-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-teal-100/80 shadow-inner">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Active Disputes */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/90 to-white/45 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(244,63,94,0.08)] hover:border-rose-300/60">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 pointer-events-none" />
          <div className="relative z-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Disputes</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.disputes}</p>
          </div>
          <div className="relative z-20 bg-rose-50 text-rose-600 p-3.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-rose-100/80 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Spending Trend & Graph */}
      {recentOrders.length > 0 && (
        <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-500 hover:border-emerald-300/40 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.05)]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gem Acquisition Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', backdropFilter: 'blur(8px)' }}
                  labelClassName="text-emerald-300 font-bold"
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Gem Transactions */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-500 hover:border-emerald-300/40 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.05)]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            Recent Gem Orders
          </CardTitle>
          <Link to="/orders">
            <button className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors">
              View All Orders
            </button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-500 text-sm animate-pulse">Retrieving order database...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No purchases logged. Browse the marketplace to acquire gems!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                  <div className="flex items-center gap-4">
                    <img 
                      src={order.gemId.images?.[0] || '/gem-placeholder.png'} 
                      alt="" 
                      className="w-14 h-14 object-cover rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">{order.gemId.title}</p>
                      <p className="text-xs text-slate-400 font-medium">Escrow ID: #{order.orderNumber.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-850 text-base">${order.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      order.status === 'COMPLETED' ? 'bg-emerald-150 text-emerald-700 border border-emerald-250/20' :
                      order.status === 'DISPUTED' ? 'bg-rose-100 text-rose-700 border border-rose-200/20' :
                      'bg-amber-100 text-amber-700 border border-amber-200/20'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
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