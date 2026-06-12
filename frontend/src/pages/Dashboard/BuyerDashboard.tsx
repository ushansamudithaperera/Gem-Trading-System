import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-blue-700">Buyer</span>. Track your purchases and orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Spent" value={`$${stats.totalSpent.toLocaleString()}`} icon={DollarSign} accentColor="emerald" />
        <StatCard label="Active Orders" value={stats.activeOrders} icon={Clock} accentColor="blue" />
        <StatCard label="Completed" value={stats.completedOrders} icon={Package} accentColor="sky" />
        <StatCard label="Disputes" value={stats.disputes} icon={AlertTriangle} accentColor="amber" />
      </div>

      {recentOrders.length > 0 && (
        <div className="premium-section-card">
          <div className="premium-section-header">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Gem Acquisition Trend
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(226, 232, 240, 0.6)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    backdropFilter: 'blur(12px)',
                    color: '#0f172a',
                  }}
                />
                <Line type="monotone" dataKey="amount" stroke="#1d4ed8" strokeWidth={2.5} dot={{ fill: '#1d4ed8', r: 4 }} activeDot={{ r: 6, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Gem Transactions */}
      <div className="premium-section-card">
        <div className="premium-section-header flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Recent Gem Orders
          </h3>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">View All</Button>
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-slate-500">No orders yet. Start browsing the marketplace!</p>
          ) : (
            <div className="divide-y divide-slate-100/80">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={order.gemId.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded-xl border border-white/60 shadow-sm" />
                    <div>
                      <p className="font-semibold text-slate-900">{order.gemId.title}</p>
                      <p className="text-sm text-slate-500">Order #{order.orderNumber.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${order.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 capitalize">{order.status.replace(/_/g, ' ').toLowerCase()}</p>
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