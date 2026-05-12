import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Package, Clock, DollarSign, TrendingUp } from 'lucide-react';
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
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-600">Track your purchases and orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Orders</p>
              <p className="text-2xl font-bold">{stats.activeOrders}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completedOrders}</p>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disputes</p>
              <p className="text-2xl font-bold text-red-600">{stats.disputes}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
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
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet. Start browsing the marketplace!</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <img src={order.gemId.images?.[0] || '/gem-placeholder.png'} alt="" className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-medium">{order.gemId.title}</p>
                      <p className="text-sm text-gray-500">Order #{order.orderNumber.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.status.replace(/_/g, ' ').toLowerCase()}</p>
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