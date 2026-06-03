import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useRoleTheme } from '../../utils/theme';
import { Gavel, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { getBuyerBids, getSellerBids, updateBidStatus, Bid } from '../../services/bid.service';
import { toast } from '../../components/ui/Toast';

export const Bids: React.FC = () => {
  const { role: activeRole } = useRoleTheme();
  const isSeller = activeRole === 'SELLER';

  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const data = isSeller ? await getSellerBids() : await getBuyerBids();
      setBids(data || []);
    } catch (error: any) {
      console.error('Failed to fetch bids:', error);
      toast.error('Error', 'Failed to retrieve bids. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSeller]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleUpdateStatus = async (id: string, newStatus: 'Accepted' | 'Rejected' | 'Cancelled') => {
    try {
      await updateBidStatus(id, newStatus);
      
      // Optimistic UI state update: update local state immediately
      setBids(prev =>
        prev.map(bid => (bid._id === id ? { ...bid, status: newStatus } : bid))
      );

      toast.success(
        'Success',
        `Bid successfully ${newStatus.toLowerCase()}.`
      );
    } catch (error: any) {
      console.error(`Failed to update bid status to ${newStatus}:`, error);
      toast.error('Error', error.message || `Failed to update bid status.`);
    }
  };

  const getStatusBadge = (status: Bid['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'Accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Dashboard Link */}
      <div className="mb-6">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Gavel className={`h-8 w-8 ${isSeller ? 'text-emerald-600' : 'text-blue-600'}`} />
            {isSeller ? 'Incoming Offers' : 'My Placed Bids'}
          </h1>
          <p className="text-slate-705 mt-2 text-sm leading-relaxed max-w-xl">
            {isSeller 
              ? 'Review and manage price offers submitted by verified buyers on your gemstone listings.'
              : 'Track and manage the price offers you have placed on marketplace listings.'}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-4" />
          <p className="text-slate-600 text-sm font-medium">Loading bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-12 text-center text-slate-700">
          <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-950 mb-1">No bids found yet.</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {isSeller
              ? 'Your listed gemstones have not received any offers yet.'
              : 'You have not placed any bids on gemstones yet.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="px-6 py-4">Gemstone Details</th>
                  <th className="px-6 py-4">{isSeller ? 'Buyer' : 'Seller'}</th>
                  <th className="px-6 py-4 text-right">List Price</th>
                  <th className="px-6 py-4 text-right">{isSeller ? 'Offered Price' : 'My Offer'}</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.map(bid => {
                  const listPrice = bid.gem?.price || 0;
                  const offeredPrice = bid.offeredPrice || 0;
                  const hasDiscount = offeredPrice < listPrice;
                  const discountPct = listPrice > 0 ? Math.round(((listPrice - offeredPrice) / listPrice) * 100) : 0;
                  const partnerName = isSeller 
                    ? `${bid.buyer?.firstName || ''} ${bid.buyer?.lastName || ''}`.trim() || 'Anonymous Buyer'
                    : `${bid.seller?.firstName || ''} ${bid.seller?.lastName || ''}`.trim() || bid.seller?.businessName || 'Anonymous Seller';

                  return (
                    <tr key={bid._id} className="hover:bg-slate-50/40 transition-colors text-sm text-slate-700">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img 
                            src={bid.gem?.images?.[0] || 'https://placehold.co/60x60?text=Gem'} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200/80 flex-shrink-0"
                          />
                          <span className="truncate max-w-[240px] block" title={bid.gem?.title || 'Gemstone'}>
                            {bid.gem?.title || 'Gemstone'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {partnerName}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500 line-through">
                        ${listPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isSeller ? 'text-emerald-700' : 'text-blue-700'}`}>
                            ${offeredPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold mt-0.5">
                              -{discountPct}% Under
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(bid.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {bid.status === 'Pending' ? (
                          isSeller ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 cursor-pointer h-8"
                                onClick={() => handleUpdateStatus(bid._id, 'Accepted')}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer h-8"
                                onClick={() => handleUpdateStatus(bid._id, 'Rejected')}
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer h-8"
                              onClick={() => handleUpdateStatus(bid._id, 'Cancelled')}
                            >
                              Cancel Bid
                            </Button>
                          )
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">No Actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
