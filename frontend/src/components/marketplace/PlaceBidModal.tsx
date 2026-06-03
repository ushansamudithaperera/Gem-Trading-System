import React, { useState } from 'react';
import { X, DollarSign, Gem, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { createBid } from '../../services/bid.service';
import { toast } from '../ui/Toast';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  gem: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ isOpen, onClose, gem }) => {
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(offeredPrice);

    if (!offeredPrice || priceNum <= 0) {
      toast.error('Invalid Price', 'Please enter a valid offered price.');
      return;
    }

    setLoading(true);
    try {
      await createBid({ gemId: gem._id, offeredPrice: priceNum });
      toast.success('Offer Placed', `Your offer of $${priceNum.toLocaleString()} for ${gem.title} has been submitted.`);
      onClose();
    } catch (error: any) {
      toast.error('Offer Failed', error.message || 'Could not place offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md my-auto rounded-2xl border border-white/60 bg-white shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Gem className="h-5 w-5" />
            <h3 className="text-lg font-bold text-slate-900">Make Price Offer</h3>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gemstone Info */}
        <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
          <img
            src={gem.images?.[0] || 'https://placehold.co/100x100?text=Gem'}
            alt={gem.title}
            className="w-14 h-14 object-cover rounded-lg border border-slate-200/80 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 truncate">{gem.title}</h4>
            <p className="text-xs text-slate-500 mt-1">
              Asking Price: <span className="font-bold text-slate-800">${gem.price.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Offered Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                <DollarSign className="h-4 w-4" />
              </span>
              <input
                required
                type="number"
                min="1"
                step="1"
                placeholder="Enter offer amount"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              Your offer is binding and funds are secured in escrow upon acceptance.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="rounded-xl h-10 px-5 text-sm font-semibold"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 h-10 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 transition-all cursor-pointer flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
