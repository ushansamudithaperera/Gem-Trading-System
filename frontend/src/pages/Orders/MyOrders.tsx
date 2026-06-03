import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getUserOrders } from '../../services/order.service';
import { Package, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRoleTheme } from '../../utils/theme';

type Order = {
  _id: string;
  orderNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  gemId: { title: string; images: string[]; type: string };
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  PENDING_DISPATCH: { label: 'Pending Dispatch', variant: 'warning' },
  IN_CUTTING_PROCESS: { label: 'Cutting in Progress', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'default' },
  DELIVERED: { label: 'Delivered', variant: 'secondary' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  DISPUTED: { label: 'Disputed', variant: 'destructive' },
};

export const MyOrders: React.FC = () => {
  const { role: activeRole } = useRoleTheme();
  const isSeller = activeRole === 'SELLER';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isSeller ? 'Sales Orders' : 'My Orders'}
      </h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'PENDING_DISPATCH', 'IN_CUTTING_PROCESS', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 text-sm rounded-full transition ${
              statusFilter === status
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : (statusConfig[status]?.label || status)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-700 flex flex-col items-center justify-center">
            <Package className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              {isSeller ? 'No sales orders yet.' : 'No orders found.'}
            </p>
            {isSeller ? (
              <Link to="/dashboard">
                <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 shadow-md text-white">Add New Listing</Button>
              </Link>
            ) : (
              <Link to="/marketplace">
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700 shadow-md text-white">Start Shopping</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Card key={order._id} className="hover:shadow-md transition border-emerald-200">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={order.gemId.images?.[0] || '/gem-placeholder.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link to={`/orders/${order._id}`}>
                      <h3 className="font-semibold hover:text-blue-600">
                        {order.gemId.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-700">Order #{order.orderNumber.slice(-8)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-lg font-bold">${order.amount.toLocaleString()}</p>
                  {getStatusBadge(order.status)}
                  <Link to={`/orders/${order._id}`}>
                    <Button variant="ghost" size="sm" className="mt-1">
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};