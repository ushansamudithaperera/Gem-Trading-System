import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { EscrowStatus } from '../../components/orders/EscrowStatus';
import { DisputeForm } from '../../components/orders/DisputeForm';
import { getOrderById, cancelOrder, confirmDelivery } from '../../services/order.service';
import { releaseEscrow } from '../../services/escrow.service';
import { ArrowLeft, Truck, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

type OrderDetail = {
  _id: string;
  orderNumber: string;
  amount: number;
  adminFee: number;
  sellerAmount: number;
  status: string;
  escrowStatus: 'HELD' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
  deliveryInfo: {
    courierCompany?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
    autoReleaseDate?: string;
  };
  gemId: {
    _id: string;
    title: string;
    images: string[];
    type: string;
    weightCarats: number;
  };
  buyerId: { _id: string; firstName: string; lastName: string };
  sellerId: { _id: string; firstName: string; lastName: string; businessName?: string };
  cutterId?: { _id: string; firstName: string; lastName: string };
};

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isBuyer = user?._id === order?.buyerId._id;
  const isSeller = user?._id === order?.sellerId._id;
  const isAdmin = user?.roles.includes('ADMIN');

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id!);
      setOrder(data);
    } catch (error) {
      console.error(error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This will refund your payment.')) return;
    setActionLoading(true);
    try {
      await cancelOrder(order!._id);
      toast.success('Order Cancelled', 'Your order has been cancelled and refund will be processed.');
      await fetchOrder();
    } catch (error: any) {
      toast.error('Cancel Failed', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setActionLoading(true);
    try {
      await confirmDelivery(order!._id);
      toast.success('Delivery Confirmed', 'Thank you! Funds will be released to seller.');
      await fetchOrder();
    } catch (error: any) {
      toast.error('Failed', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseEscrow = async () => {
    setActionLoading(true);
    try {
      await releaseEscrow(order!._id);
      toast.success('Funds Released', 'Escrow has been released to the seller.');
      await fetchOrder();
    } catch (error: any) {
      toast.error('Release Failed', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  const canCancel = order.status === 'PENDING_DISPATCH' && (isBuyer || isAdmin);
  const canDispute = order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DISPUTED' && (isBuyer || isSeller);
  const canConfirmDelivery = order.status === 'DELIVERED' && isBuyer && order.escrowStatus === 'HELD';
  const canReleaseEscrow = order.status === 'COMPLETED' && order.escrowStatus === 'HELD' && isBuyer;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant={order.status === 'COMPLETED' ? 'success' : 'default'}>
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img src={order.gemId.images?.[0] || '/gem-placeholder.png'} alt="" className="w-24 h-24 object-cover rounded-md" />
                <div>
                  <Link to={`/gems/${order.gemId._id}`} className="font-semibold hover:text-blue-600">
                    {order.gemId.title}
                  </Link>
                  <p className="text-sm text-gray-600">{order.gemId.weightCarats} ct • {order.gemId.type}</p>
                  <p className="text-sm">Seller: {order.sellerId.businessName || `${order.sellerId.firstName} ${order.sellerId.lastName}`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                currentStatus={order.status as any}
                isDisputed={order.status === 'DISPUTED'}
                deliveredAt={order.deliveryInfo.deliveredAt ? new Date(order.deliveryInfo.deliveredAt) : undefined}
                autoReleaseDate={order.deliveryInfo.autoReleaseDate ? new Date(order.deliveryInfo.autoReleaseDate) : undefined}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {canCancel && (
              <Button variant="destructive" onClick={handleCancelOrder} disabled={actionLoading}>
                <XCircle className="h-4 w-4 mr-1" /> Cancel Order
              </Button>
            )}
            {canConfirmDelivery && (
              <Button onClick={handleConfirmDelivery} disabled={actionLoading}>
                <Truck className="h-4 w-4 mr-1" /> Confirm Delivery
              </Button>
            )}
            {canReleaseEscrow && (
              <Button onClick={handleReleaseEscrow} disabled={actionLoading}>
                <CheckCircle className="h-4 w-4 mr-1" /> Release Funds
              </Button>
            )}
            {canDispute && !showDisputeForm && (
              <Button variant="outline" onClick={() => setShowDisputeForm(true)}>
                <AlertCircle className="h-4 w-4 mr-1" /> Open Dispute
              </Button>
            )}
          </div>

          {showDisputeForm && (
            <DisputeForm
              orderId={order._id}
              orderNumber={order.orderNumber}
              onSuccess={() => { setShowDisputeForm(false); fetchOrder(); }}
              onCancel={() => setShowDisputeForm(false)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EscrowStatus
            orderId={order._id}
            amount={order.amount}
            state={order.escrowStatus}
            releaseDate={order.deliveryInfo.autoReleaseDate ? new Date(order.deliveryInfo.autoReleaseDate) : undefined}
            canRelease={canReleaseEscrow}
            onRelease={handleReleaseEscrow}
            isDisputed={order.status === 'DISPUTED'}
          />

          {order.deliveryInfo.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><span className="font-medium">Courier:</span> {order.deliveryInfo.courierCompany}</p>
                <p className="text-sm"><span className="font-medium">Tracking:</span> {order.deliveryInfo.trackingNumber}</p>
                {order.deliveryInfo.shippedAt && (
                  <p className="text-sm">Shipped on {new Date(order.deliveryInfo.shippedAt).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};