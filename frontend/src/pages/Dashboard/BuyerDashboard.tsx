import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500 mt-1">You are currently logged in as a <span className="font-semibold text-blue-700">Buyer</span>. Track your purchases and orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Spent</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${stats.totalSpent.toLocaleString()}</p>
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
            <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-center border border-blue-100">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedOrders}</p>
            </div>
            <div className="bg-sky-50 p-3 rounded-xl flex items-center justify-center border border-sky-100">
              <Package className="h-6 w-6 text-sky-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Disputes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.disputes}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl flex items-center justify-center border border-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    color: '#0f172a',
                  }}
                />
                <Line type="monotone" dataKey="amount" stroke="#1d4ed8" strokeWidth={2.5} dot={{ fill: '#1d4ed8', r: 4 }} activeDot={{ r: 6, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-slate-500">No orders yet. Start browsing the marketplace!</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={order.gemId.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    <div>
                      <p className="font-medium text-slate-900">{order.gemId.title}</p>
                      <p className="text-sm text-slate-500">Order #{order.orderNumber.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${order.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 capitalize">{order.status.replace(/_/g, ' ').toLowerCase()}</p>
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