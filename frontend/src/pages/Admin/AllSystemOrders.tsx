import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  ClipboardList,
  Search,
  Eye,
  X,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Tag
} from 'lucide-react';

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  businessName?: string;
}

interface GemInfo {
  _id: string;
  title: string;
  price: number;
  images: string[];
  type: 'ROUGH' | 'POLISHED';
  status: string;
  weightCarats: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  buyerId: UserInfo;
  sellerId: UserInfo;
  cutterId?: UserInfo;
  gemId: GemInfo;
  amount: number;
  adminFee: number;
  sellerAmount: number;
  cutterAmount?: number;
  status: string;
  escrowStatus: string;
  createdAt: string;
  updatedAt: string;
  deliveryInfo?: {
    courierCompany?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
    status?: 'pending' | 'in_transit' | 'delivered' | 'failed';
  };
  cancellationReason?: string;
}

export const AllSystemOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders');
      const data = response.data.data || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (error: any) {
      toast.error('Fetch Failed', error.message || 'Failed to retrieve system orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter list based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        order =>
          order.orderNumber.toLowerCase().includes(term) ||
          `${order.buyerId.firstName} ${order.buyerId.lastName}`.toLowerCase().includes(term) ||
          `${order.sellerId.firstName} ${order.sellerId.lastName}`.toLowerCase().includes(term) ||
          (order.cutterId && `${order.cutterId.firstName} ${order.cutterId.lastName}`.toLowerCase().includes(term)) ||
          order.buyerId.email.toLowerCase().includes(term) ||
          order.sellerId.email.toLowerCase().includes(term)
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  // Order Status color mapper
  const getOrderStatusBadge = (status: string) => {
    let color = 'bg-slate-100 text-slate-800';
    
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      color = 'bg-emerald-100 text-emerald-900 border-emerald-200';
    } else if (
      status === 'PENDING_DISPATCH' ||
      status === 'IN_CUTTING_PROCESS' ||
      status === 'SHIPPED'
    ) {
      color = 'bg-amber-100 text-amber-900 border-amber-200';
    } else if (status === 'DISPUTED' || status === 'CANCELLED' || status === 'RETURN_REQUESTED') {
      color = 'bg-rose-100 text-rose-900 border-rose-200';
    }

    return (
      <Badge variant="outline" className={`font-semibold text-xs tracking-wide uppercase px-2 py-0.5 border ${color}`}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Escrow Status color mapper
  const getEscrowStatusBadge = (status: string) => {
    let color = 'bg-slate-100 text-slate-800 border-slate-200';
    
    if (status === 'HELD') {
      color = 'bg-blue-100 text-blue-900 border-blue-200';
    } else if (status === 'RELEASED') {
      color = 'bg-emerald-100 text-emerald-900 border-emerald-200';
    } else if (status === 'REFUNDED') {
      color = 'bg-slate-200 text-slate-800 border-slate-300';
    }

    return (
      <Badge variant="outline" className={`font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 border ${color}`}>
        {status}
      </Badge>
    );
  };

  const formatLKR = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              All System Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor and audit all transactions, marketplace sales, and cutting jobs across the platform.
            </p>
          </div>
          
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </button>
        </div>

        {/* Search Bar */}
        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Order ID, Buyer, Seller, or Cutter name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-350 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-505 transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-150 rounded w-1/3"></div>
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-md font-bold text-slate-900">No Orders Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  {searchTerm
                    ? 'No platform orders matched your search filters.'
                    : 'There are currently no orders registered on the system.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Seller/Cutter</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Order Status</th>
                    <th className="px-6 py-4">Escrow Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredOrders.map(order => {
                    const isLapidary = !!order.cutterId;
                    const vendor = isLapidary ? order.cutterId : order.sellerId;
                    
                    return (
                      <tr key={order._id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Order Number */}
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                          {order.orderNumber}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-450" />
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isLapidary
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <Tag className="w-3 h-3" />
                            {isLapidary ? 'Lapidary' : 'Marketplace'}
                          </span>
                        </td>

                        {/* Buyer */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {order.buyerId.firstName} {order.buyerId.lastName}
                            </span>
                            <span className="text-xs text-slate-450">{order.buyerId.email}</span>
                          </div>
                        </td>

                        {/* Vendor (Seller/Cutter) */}
                        <td className="px-6 py-4">
                          {vendor ? (
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {vendor.firstName} {vendor.lastName}
                              </span>
                              <span className="text-xs text-slate-450 block">{vendor.email}</span>
                              {isLapidary ? (
                                <span className="text-[10px] text-purple-600 font-bold uppercase">Cutter</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-bold uppercase">Seller</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatLKR(order.amount)}
                        </td>

                        {/* Order Status */}
                        <td className="px-6 py-4">
                          {getOrderStatusBadge(order.status)}
                        </td>

                        {/* Escrow Status */}
                        <td className="px-6 py-4">
                          {getEscrowStatusBadge(order.escrowStatus)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      </div>

      {/* DETAIL MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <Card className="max-w-2xl w-full border border-slate-200 shadow-2xl bg-white max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Order Detail Audit
                </h2>
                <span className="text-xs text-slate-450 font-mono mt-0.5 block">
                  Reference: #{selectedOrder.orderNumber}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-450 hover:text-slate-655 transition-colors p-1.5 hover:bg-slate-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Top Summary Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Transaction Amount</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{formatLKR(selectedOrder.amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Platform Commission</span>
                  <span className="text-sm font-bold text-indigo-650 mt-0.5 block">{formatLKR(selectedOrder.adminFee)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Order Status</span>
                  <div className="mt-1">{getOrderStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Escrow Clearance</span>
                  <div className="mt-1">{getEscrowStatusBadge(selectedOrder.escrowStatus)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Users */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Buyer Information
                    </h3>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-850 block">{selectedOrder.buyerId.firstName} {selectedOrder.buyerId.lastName}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.buyerId.email}</span>
                      {selectedOrder.buyerId.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.buyerId.phone}</span>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedOrder.cutterId ? 'Lapidary Specialist' : 'Seller Information'}
                    </h3>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {selectedOrder.cutterId ? (
                        <>
                          <span className="font-semibold text-slate-850 block">{selectedOrder.cutterId.firstName} {selectedOrder.cutterId.lastName}</span>
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.cutterId.email}</span>
                          {selectedOrder.cutterId.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.cutterId.phone}</span>}
                          {selectedOrder.cutterId.companyName && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.cutterId.companyName}</span>}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-850 block">{selectedOrder.sellerId.firstName} {selectedOrder.sellerId.lastName}</span>
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.sellerId.email}</span>
                          {selectedOrder.sellerId.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.sellerId.phone}</span>}
                          {(selectedOrder.sellerId.companyName || selectedOrder.sellerId.businessName) && (
                            <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.sellerId.companyName || selectedOrder.sellerId.businessName}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Gem details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                      💎 Item / Gem Details
                    </h3>
                    <div className="mt-2 space-y-2 text-xs">
                      {selectedOrder.gemId.images && selectedOrder.gemId.images.length > 0 && (
                        <img
                          src={selectedOrder.gemId.images[0]}
                          alt={selectedOrder.gemId.title}
                          className="w-full h-32 object-cover rounded-lg border border-slate-150 shadow-inner"
                        />
                      )}
                      <div className="space-y-1.5 text-slate-600">
                        <span className="font-semibold text-slate-850 block">{selectedOrder.gemId.title}</span>
                        <span className="block">Type: <span className="font-medium text-slate-800">{selectedOrder.gemId.type}</span></span>
                        <span className="block">Weight: <span className="font-medium text-slate-800">{selectedOrder.gemId.weightCarats} carats</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Info */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                      📦 Dispatch & Courier Status
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {selectedOrder.deliveryInfo?.courierCompany ? (
                        <>
                          <span className="block">Courier: <span className="font-medium text-slate-850">{selectedOrder.deliveryInfo.courierCompany}</span></span>
                          <span className="block">Tracking ID: <span className="font-medium text-slate-850 font-mono">{selectedOrder.deliveryInfo.trackingNumber}</span></span>
                          {selectedOrder.deliveryInfo.shippedAt && (
                            <span className="block">Shipped: <span className="font-medium text-slate-850">{formatDate(selectedOrder.deliveryInfo.shippedAt)}</span></span>
                          )}
                          {selectedOrder.deliveryInfo.deliveredAt && (
                            <span className="block">Delivered: <span className="font-medium text-slate-850">{formatDate(selectedOrder.deliveryInfo.deliveredAt)}</span></span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No dispatch tracking details uploaded yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              {selectedOrder.status === 'CANCELLED' && selectedOrder.cancellationReason && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs">
                  <span className="font-bold text-rose-800 block flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Cancellation Description
                  </span>
                  <p className="text-rose-700 mt-1">{selectedOrder.cancellationReason}</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors text-center"
              >
                Close Audit View
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
