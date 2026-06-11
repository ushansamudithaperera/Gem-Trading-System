import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Gem,
  Scissors,
  Info,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { toast } from '../ui/Toast';

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Initialisation
// loadStripe is called once at module-level to avoid re-initialising on
// every render. The promise is shared across all modal instances.
// ─────────────────────────────────────────────────────────────────────────────
const stripePublicKey =
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  'pk_test_51TW0OWCLTwBfeW9HXXXXXplaceholderXXXX';

const stripePromise = loadStripe(stripePublicKey);

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Elements Appearance — matches the GemTrade light-mode design system
// ─────────────────────────────────────────────────────────────────────────────
const STRIPE_APPEARANCE: import('@stripe/stripe-js').Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#059669',       // Emerald-600 — primary brand
    colorBackground: '#f8fafc',   // Slate-50
    colorText: '#0f172a',         // Slate-900
    colorTextSecondary: '#64748b', // Slate-500
    colorDanger: '#dc2626',        // Red-600
    colorSuccess: '#16a34a',       // Green-600
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    fontSizeBase: '14px',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1.5px solid #e2e8f0',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      padding: '10px 14px',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.Input:focus': {
      border: '1.5px solid #059669',
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.12)',
      outline: 'none',
    },
    '.Input--invalid': {
      border: '1.5px solid #dc2626',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.08)',
    },
    '.Label': {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px',
    },
    '.Error': {
      color: '#dc2626',
      fontSize: '12px',
      marginTop: '4px',
    },
    '.Tab': {
      border: '1.5px solid #e2e8f0',
      borderRadius: '10px',
      backgroundColor: '#ffffff',
    },
    '.Tab--selected': {
      border: '1.5px solid #059669',
      backgroundColor: '#f0fdf4',
    },
    '.Tab:focus': {
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.12)',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Payment amount in LKR (Rs.) */
  amount: number;
  /** MongoDB ObjectId — pass either orderId OR jobId (not both) */
  orderId?: string;
  jobId?: string;
  /** Human-readable description shown in the order summary card */
  itemDescription?: string;
  onSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────
const formatLKR = (val: number): string =>
  `Rs. ${val.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PLATFORM_FEE_PERCENT = 0.05;

// ─────────────────────────────────────────────────────────────────────────────
// PaymentModal — Outer wrapper that fetches the clientSecret and mounts
// the Stripe <Elements> provider once the secret is ready.
// ─────────────────────────────────────────────────────────────────────────────
export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  jobId,
  itemDescription,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  const isCuttingJob = Boolean(jobId && !orderId);
  const referenceId = (orderId || jobId)!;

  // Derived fee breakdown
  const adminFee = parseFloat((amount * PLATFORM_FEE_PERCENT).toFixed(2));
  const netAmount = parseFloat((amount - adminFee).toFixed(2));

  // ── Fetch PaymentIntent client secret ───────────────────────────────────────
  const fetchClientSecret = useCallback(async () => {
    if (!referenceId) return;
    setLoadingSecret(true);
    setSecretError(null);
    setClientSecret(null);
    setPaymentIntentId(null);

    try {
      const response = await api.post('/payments/create-intent', {
        amount,
        orderId: isCuttingJob ? undefined : orderId,
        jobId: isCuttingJob ? jobId : undefined,
      });

      const data = response.data?.data;
      if (!data?.clientSecret || !data?.paymentIntentId) {
        throw new Error('Invalid response from payment gateway. Please try again.');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err: any) {
      const msg = err.message || 'Failed to initialize payment session.';
      setSecretError(msg);
      toast.error('Checkout Error', msg);
    } finally {
      setLoadingSecret(false);
    }
  }, [amount, orderId, jobId, isCuttingJob, referenceId]);

  // Reset + fetch every time the modal opens
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setSecretError(null);
      return;
    }
    fetchClientSecret();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultDescription = isCuttingJob
    ? 'Lapidary & Cutting Services'
    : 'Gemstone Purchase';
  const displayDescription = itemDescription || defaultDescription;
  const TypeIcon = isCuttingJob ? Scissors : Gem;

  return (
    // Full-screen overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Secure Checkout"
    >
      {/* ── Animated Backdrop ── */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Panel ── */}
      <div className="relative z-10 w-full max-w-[480px] flex flex-col max-h-[92vh] animate-modal-in">

        {/* ── Decorative gradient ring (premium feel) ── */}
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 50%, #8b5cf6 100%)',
            opacity: 0.25,
          }}
        />

        {/* ── Panel Surface ── */}
        <div className="relative z-10 flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80">

          {/* ── Header ── */}
          <div className="relative px-6 py-5 border-b border-slate-100 overflow-hidden">
            {/* Subtle gradient wash */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(14,165,233,0.04) 100%)',
              }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-500/25">
                  <Lock className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Secure Escrow Checkout
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Powered by Stripe · Test Mode
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                aria-label="Close checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">

              {/* ── Order Summary Card ── */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <TypeIcon className="h-4.5 w-4.5 h-[18px] w-[18px] text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                        {displayDescription}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                        Ref: {referenceId}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 flex-shrink-0 tabular-nums">
                    {formatLKR(amount)}
                  </p>
                </div>

                {/* Fee Breakdown */}
                <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Platform Fee (5%)
                    </span>
                    <span className="font-medium tabular-nums">
                      − {formatLKR(adminFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>
                      {isCuttingJob ? 'Cutter Receives' : 'Seller Receives'}
                    </span>
                    <span className="tabular-nums">{formatLKR(netAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-extrabold text-slate-900">
                    <span>Total Charged</span>
                    <span className="tabular-nums">{formatLKR(amount)}</span>
                  </div>
                </div>
              </div>

              {/* ── Escrow Info Banner ── */}
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Your payment is held in{' '}
                  <strong>secure escrow</strong> until you confirm delivery.
                  No funds are released until you're satisfied.
                </p>
              </div>

              {/* ── Error State with Retry ── */}
              {secretError && !loadingSecret && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-rose-800">
                        Checkout Initialization Failed
                      </p>
                      <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
                        {secretError}
                      </p>
                      <button
                        onClick={fetchClientSecret}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Gateway Initialization Spinner ── */}
              {loadingSecret && (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full border-[3px] border-slate-100 border-t-emerald-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Contacting Payment Gateway…
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Establishing a secure connection
                    </p>
                  </div>
                </div>
              )}

              {/* ── Stripe Elements Form ── */}
              {clientSecret && paymentIntentId && !loadingSecret && !secretError && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: STRIPE_APPEARANCE,
                    loader: 'auto',
                  }}
                >
                  <CheckoutForm
                    amount={amount}
                    orderId={orderId}
                    jobId={jobId}
                    paymentIntentId={paymentIntentId}
                    isCuttingJob={isCuttingJob}
                    onSuccess={onSuccess}
                    onClose={onClose}
                  />
                </Elements>
              )}
            </div>
          </div>

          {/* ── Footer Trust Bar ── */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { icon: Lock, label: '256-bit SSL' },
                { icon: ShieldCheck, label: 'PCI DSS Compliant' },
                { icon: CreditCard, label: 'Stripe Secured' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Keyframe animation (inlined as a style tag) ── */}
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .animate-modal-in {
          animation: modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutForm — Mounted inside <Elements>; has access to stripe & elements hooks.
// Handles payment confirmation + DB confirm call + success state.
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutFormProps {
  amount: number;
  orderId?: string;
  jobId?: string;
  paymentIntentId: string;
  isCuttingJob: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

type FormPhase = 'idle' | 'processing' | 'confirming' | 'success' | 'error';

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  orderId,
  jobId,
  paymentIntentId,
  isCuttingJob,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [phase, setPhase] = useState<FormPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);

  const isProcessing = phase === 'processing' || phase === 'confirming';

  const phaseLabel: Record<FormPhase, string> = {
    idle: `Pay ${formatLKR(amount)}`,
    processing: 'Authorising…',
    confirming: 'Securing Funds…',
    success: 'Payment Complete!',
    error: `Pay ${formatLKR(amount)}`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setPhase('processing');
    setError(null);

    // ── Step 1: Stripe client-side confirmation ───────────────────────────────
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // return_url is only used if Stripe needs to redirect (3DS etc.).
        // With redirect:'if_required' it only redirects when absolutely necessary.
        return_url: `${window.location.origin}/orders`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      const msg =
        stripeError.type === 'card_error' || stripeError.type === 'validation_error'
          ? stripeError.message || 'Your card was declined. Please check your details.'
          : 'An unexpected payment error occurred. Please try again.';
      setError(msg);
      setPhase('error');
      return;
    }

    if (paymentIntent?.status !== 'succeeded') {
      setError(
        `Payment status is "${paymentIntent?.status}". Please complete any additional steps and try again.`
      );
      setPhase('error');
      return;
    }

    // ── Step 2: Server-side escrow confirm (passes paymentIntentId for verification) ──
    setPhase('confirming');
    try {
      await api.patch('/payments/confirm', {
        orderId: isCuttingJob ? undefined : orderId,
        jobId: isCuttingJob ? jobId : undefined,
        paymentIntentId,
      });

      setPhase('success');

      toast.success(
        'Payment Successful & Funds in Escrow',
        'Your payment is confirmed. Funds are safely locked until delivery.'
      );

      // Short success animation before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (confirmErr: any) {
      // Payment DID succeed with Stripe but DB update failed.
      // Show a warning instead of an error — the webhook will reconcile.
      setError(
        `Payment was charged but order update failed: ${confirmErr.message}. ` +
        'Please contact support with your payment reference.'
      );
      setPhase('error');
      toast.warning(
        'Payment Charged — Action Required',
        'Your card was charged but the order update failed. Contact support.'
      );
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center animate-modal-in">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2} />
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-20" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-[260px]">
            {formatLKR(amount)} is now held in escrow and will be released upon delivery confirmation.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">Funds Secured in Escrow</span>
        </div>
      </div>
    );
  }

  // ── Payment Form ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* PaymentElement loading skeleton */}
      {!elementsReady && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="flex gap-3">
            <div className="h-11 flex-1 rounded-xl bg-slate-100" />
            <div className="h-11 flex-1 rounded-xl bg-slate-100" />
          </div>
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-11 rounded-xl bg-slate-100" />
        </div>
      )}

      {/* Stripe PaymentElement — auto-detects card, wallets, etc. */}
      <div className={elementsReady ? 'block' : 'sr-only'}>
        <PaymentElement
          onReady={() => setElementsReady(true)}
          options={{
            layout: { type: 'tabs', defaultCollapsed: false },
            fields: {
              billingDetails: {
                address: 'never', // Don't ask for full address in test mode
              },
            },
          }}
        />
      </div>

      {/* Stripe Error / Confirm Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <AlertCircle className="h-4.5 w-4.5 h-[18px] w-[18px] text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-rose-700 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Processing Phase hint */}
      {phase === 'confirming' && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2.5">
          <div className="h-3.5 w-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
          <p className="text-xs font-medium text-blue-700">
            Securing funds in escrow…
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="payment-submit-btn"
        disabled={isProcessing || !stripe || !elements || !elementsReady}
        className={`
          w-full flex items-center justify-center gap-2.5
          px-5 py-3.5 rounded-xl text-sm font-bold
          transition-all duration-200 shadow-md
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          ${isProcessing
            ? 'bg-emerald-700 text-white cursor-wait shadow-emerald-500/20'
            : phase === 'error'
            ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-500/20'
            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:shadow-lg'
          }
          disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none
        `}
      >
        {isProcessing ? (
          <>
            <div className="h-4.5 h-[18px] w-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{phaseLabel[phase]}</span>
          </>
        ) : (
          <>
            {phase === 'error' ? (
              <RefreshCw className="h-4.5 h-[18px] w-[18px]" />
            ) : (
              <CreditCard className="h-4.5 h-[18px] w-[18px]" />
            )}
            <span>{phaseLabel[phase]}</span>
            {phase !== 'error' && (
              <ArrowRight className="h-4 w-4 ml-auto opacity-70" />
            )}
          </>
        )}
      </button>

      {/* Test Mode Helper */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Info className="h-3 w-3 flex-shrink-0" />
        <span>
          Test mode: Use card{' '}
          <span className="font-mono font-semibold text-slate-500">4242 4242 4242 4242</span>
          , any future date & any CVC
        </span>
      </div>
    </form>
  );
};
