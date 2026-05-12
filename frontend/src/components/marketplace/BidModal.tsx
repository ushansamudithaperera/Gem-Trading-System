import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

import { createOrder } from '../../services/order.service';
import { toast } from '../ui/Toast';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  gem: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
}

export const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, gem }) => {
  const [amount, setAmount] = useState<number>(gem.price);
  const [loading, setLoading] = useState(false);

  const handleBid = async () => {
    if (amount < gem.price) {
      toast.error('Invalid Amount', `Bid amount must be at least $${gem.price}`);
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({ gemId: gem._id, amount });
      toast.success('Order Created', `Your order for ${gem.title} has been placed.`);
      onClose();
      // Redirect to payment or order page
      window.location.href = `/orders/${order._id}`;
    } catch (error: any) {
      toast.error('Order Failed', error.message || 'Could not create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Place Bid / Buy Now
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Gem preview */}
                <div className="flex gap-3 mb-4">
                  <img
                    src={gem.images?.[0] || 'https://placehold.co/100x100?text=Gem'}
                    alt={gem.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-medium">{gem.title}</h4>
                    <p className="text-sm text-gray-500">Asking price: ${gem.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Bid Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={gem.price}
                        step={10}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum: ${gem.price}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                    <p>💰 Funds will be held in <strong>escrow</strong> until you confirm delivery.</p>
                    <p>⚖️ Platform fee (5%) included in amount.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleBid} disabled={loading} className="flex-1">
                      {loading ? 'Processing...' : 'Confirm Purchase'}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};