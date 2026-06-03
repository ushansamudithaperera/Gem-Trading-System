import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useRoleTheme } from '../../utils/theme';
import { Gavel, Check, X, ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';

interface Bid {
  id: string;
  gemTitle: string;
  partnerName: string; // Buyer name for seller, Seller name for buyer
  originalPrice: number;
  offeredPrice: number;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  gemImage?: string;
}

const mockIncomingBids: Bid[] = [
  {
    id: 'bid-101',
    gemTitle: '3.2ct Royal Blue Ceylon Sapphire',
    partnerName: 'Aris Thorne',
    originalPrice: 4500,
    offeredPrice: 4200,
    date: '2026-06-02',
    status: 'PENDING',
    gemImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 'bid-102',
    gemTitle: '1.8ct Natural Red Ruby (Unheated)',
    partnerName: 'Sophia Lin',
    originalPrice: 3200,
    offeredPrice: 3200,
    date: '2026-05-30',
    status: 'ACCEPTED',
    gemImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 'bid-103',
    gemTitle: '2.5ct Cushion Cut Tsavorite Garnet',
    partnerName: 'Marcus Sterling',
    originalPrice: 1800,
    offeredPrice: 1500,
    date: '2026-05-28',
    status: 'REJECTED',
    gemImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

const mockPlacedBids: Bid[] = [
  {
    id: 'bid-201',
    gemTitle: '5.1ct Flawless Emerald Cut Aquamarine',
    partnerName: 'Ceylon Gem Exchange',
    originalPrice: 2800,
    offeredPrice: 2600,
    date: '2026-06-03',
    status: 'PENDING',
    gemImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 'bid-202',
    gemTitle: '1.2ct Vivid Pink Spinel',
    partnerName: 'Rathnapura Minerals',
    originalPrice: 1500,
    offeredPrice: 1500,
    date: '2026-05-29',
    status: 'ACCEPTED',
    gemImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

export const Bids: React.FC = () => {
  const { role: activeRole } = useRoleTheme();
  const isSeller = activeRole === 'SELLER';

  const [incomingBids, setIncomingBids] = useState<Bid[]>(mockIncomingBids);
  const [placedBids, setPlacedBids] = useState<Bid[]>(mockPlacedBids);

  const activeBids = isSeller ? incomingBids : placedBids;

  const handleAcceptBid = (id: string) => {
    setIncomingBids(prev =>
      prev.map(bid => (bid.id === id ? { ...bid, status: 'ACCEPTED' } : bid))
    );
  };

  const handleRejectBid = (id: string) => {
    setIncomingBids(prev =>
      prev.map(bid => (bid.id === id ? { ...bid, status: 'REJECTED' } : bid))
    );
  };

  const handleCancelBid = (id: string) => {
    setPlacedBids(prev =>
      prev.map(bid => (bid.id === id ? { ...bid, status: 'CANCELLED' } : bid))
    );
  };

  const getStatusBadge = (status: Bid['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge variant="success">Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'CANCELLED':
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
          <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-xl">
            {isSeller 
              ? 'Review and manage price offers submitted by verified buyers on your gemstone listings.'
              : 'Track and manage the price offers you have placed on marketplace listings.'}
          </p>
        </div>
      </div>

      {/* Main Table / Empty State Card */}
      {activeBids.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <CardContent className="py-20 text-center text-slate-700 flex flex-col items-center justify-center bg-white">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isSeller ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <Gavel className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 mb-1">No Offers Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              {isSeller
                ? 'Your listed gemstones have not received any offers yet. Make sure your pricing matches current market trends.'
                : 'You have not placed any bids on gemstones yet. Explore the marketplace to find precious gems.'}
            </p>
            {!isSeller && (
              <Link to="/marketplace">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl px-6 h-10 font-semibold">
                  Browse Marketplace
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
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
                {activeBids.map(bid => {
                  const hasDiscount = bid.offeredPrice < bid.originalPrice;
                  const discountPct = Math.round(((bid.originalPrice - bid.offeredPrice) / bid.originalPrice) * 100);

                  return (
                    <tr key={bid.id} className="hover:bg-slate-50/40 transition-colors text-sm text-slate-700">
                      {/* Gemstone */}
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img 
                            src={bid.gemImage || 'https://placehold.co/60x60?text=Gem'} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200/80 flex-shrink-0"
                          />
                          <span className="truncate max-w-[240px] block" title={bid.gemTitle}>
                            {bid.gemTitle}
                          </span>
                        </div>
                      </td>

                      {/* Partner */}
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {bid.partnerName}
                      </td>

                      {/* Original Price */}
                      <td className="px-6 py-4 text-right font-medium text-slate-500 line-through">
                        ${bid.originalPrice.toLocaleString()}
                      </td>

                      {/* Offered Price */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isSeller ? 'text-emerald-700' : 'text-blue-700'}`}>
                            ${bid.offeredPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold mt-0.5">
                              -{discountPct}% Under
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(bid.date).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(bid.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {bid.status === 'PENDING' ? (
                          isSeller ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 cursor-pointer h-8"
                                onClick={() => handleAcceptBid(bid.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer h-8"
                                onClick={() => handleRejectBid(bid.id)}
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
                              onClick={() => handleCancelBid(bid.id)}
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
