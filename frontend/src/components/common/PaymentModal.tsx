import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, Lock, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from '../ui/Toast';

// Initialize loadStripe once outside the component render cycle
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51O1234567890abcdefghijklmnopqrstuvwxyz';
const stripePromise = loadStripe(stripePublicKey);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string; // Can represent orderId or jobId
  isCuttingJob?: boolean;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  isCuttingJob = false,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState<boolean>(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setSecretError(null);
      return;
    }

    const fetchClientSecret = async () => {
      setLoadingSecret(true);
      setSecretError(null);
      try {
        const response = await api.post('/payments/create-intent', {
          amount,
          orderId: isCuttingJob ? undefined : orderId,
          jobId: isCuttingJob ? orderId : undefined,
        });

        if (response.data?.data?.clientSecret) {
          setClientSecret(response.data.data.clientSecret);
        } else {
          throw new Error('Client secret not returned from payment gateway');
        }
      } catch (err: any) {
        const errMsg = err.message || 'Failed to initialize payment';
        setSecretError(errMsg);
        toast.error('Payment Error', errMsg);
      } finally {
        setLoadingSecret(false);
      }
    };

    fetchClientSecret();
  }, [isOpen, amount, orderId, isCuttingJob]);

  if (!isOpen) return null;

  // Format LKR Currency
  const formatLKR = (val: number) => {
    return `Rs. ${val.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-55/30 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">Secure Escrow Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Order / Job Card Info */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Item Description</span>
              <span>Total Price</span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isCuttingJob ? 'Lapidary & Cutting Services' : 'Gemstone Purchase'}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Ref: {orderId}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 text-base">
                {formatLKR(amount)}
              </span>
            </div>
          </div>

          {/* Error State */}
          {secretError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Checkout Initialization Failed</span>
                <span className="text-xs opacity-90">{secretError}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingSecret && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
              <span className="text-sm font-semibold text-slate-600">
                Contacting payment gateway...
              </span>
            </div>
          )}

          {/* Stripe Elements Form */}
          {clientSecret && !loadingSecret && !secretError && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669', // Emerald 600
                    colorBackground: '#ffffff',
                    colorText: '#0f172a', // Slate 900
                    colorDanger: '#dc2626',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <CheckoutForm
                amount={amount}
                orderId={orderId}
                isCuttingJob={isCuttingJob}
                onSuccess={onSuccess}
                onClose={onClose}
                formatLKR={formatLKR}
              />
            </Elements>
          )}
        </div>

        {/* Footer Banner */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium leading-tight">
            Secured by Stripe. Funds are held safely in escrow and only released when you confirm delivery.
          </span>
        </div>
      </div>
    </div>
  );
};

interface CheckoutFormProps {
  amount: number;
  orderId: string;
  isCuttingJob: boolean;
  onSuccess: () => void;
  onClose: () => void;
  formatLKR: (val: number) => string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  orderId,
  isCuttingJob,
  onSuccess,
  onClose,
  formatLKR,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Trigger Stripe payment confirmation
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required', // Avoid redirect when possible for smoother SPA experience
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred during payment.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded with Stripe, now update local DB status
        await api.patch('/payments/confirm', {
          orderId: isCuttingJob ? undefined : orderId,
          jobId: isCuttingJob ? orderId : undefined,
        });

        toast.success(
          'Payment Successful',
          'Your payment is confirmed and funds are locked safely in escrow.'
        );
        onSuccess();
        onClose();
      } else {
        // Fallback for other statuses
        setError('Payment verification is pending or incomplete.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred processing your payment.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="min-h-[200px]">
        <PaymentElement />
      </div>

      {/* Local validation/Stripe Errors */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold px-5 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay {formatLKR(amount)}</span>
          </>
        )}
      </button>
    </form>
  );
};
