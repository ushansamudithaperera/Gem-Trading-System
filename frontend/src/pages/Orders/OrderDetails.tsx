import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DisputeForm } from '../../components/orders/DisputeForm';
import {
  ArrowLeft,
  Truck,
  XCircle,
  AlertCircle,
  CheckCircle,
  Shield,
  Lock,
  Scissors,
  Package,
  Home,
  DollarSign,
  Clock,
  Copy,
  MapPin,
  User,
  Hash,
  CalendarDays,
  Send,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────

type EscrowState = 'HELD' | 'RELEASED' | 'REFUNDED';

type OrderStatus =
  | 'PENDING_DISPATCH'
  | 'IN_CUTTING_PROCESS'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

interface OrderDetail {
  _id: string;
  orderNumber: string;
  amount: number;
  adminFee: number;
  sellerAmount: number;
  status: OrderStatus;
  escrowStatus: EscrowState;
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
}

// ─── Mock Data ────────────────────────────────────────────

const MOCK_ORDER: OrderDetail = {
  _id: 'ord_mock_001',
  orderNumber: 'GTS-2026-00482',
  amount: 12500,
  adminFee: 625,
  sellerAmount: 11875,
  status: 'SHIPPED',
  escrowStatus: 'HELD',
  createdAt: '2026-05-22T09:15:00Z',
  deliveryInfo: {
    courierCompany: 'DHL Express',
    trackingNumber: 'DHL-9482716305',
    shippedAt: '2026-05-24T14:30:00Z',
    deliveredAt: undefined,
    autoReleaseDate: '2026-06-07T14:30:00Z',
  },
  gemId: {
    _id: 'gem_mock_001',
    title: 'Ceylon Royal Blue Sapphire — 4.2ct Oval',
    images: ['https://placehold.co/600x400/1e3a5f/white?text=Blue+Sapphire'],
    type: 'POLISHED',
    weightCarats: 4.2,
  },
  buyerId: { _id: 'user_buyer_001', firstName: 'Kavinda', lastName: 'Perera' },
  sellerId: { _id: 'user_seller_001', firstName: 'Mahesh', lastName: 'Fernando', businessName: 'Lanka Gem House' },
  cutterId: { _id: 'user_cutter_001', firstName: 'Ruwan', lastName: 'Silva' },
};

// ─── Perspective Helper ───────────────────────────────────

const getActiveRole = (): string => localStorage.getItem('activeSidebarRole') || 'BUYER';

// ─── Escrow Timeline ─────────────────────────────────────

interface TimelineStepDef {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  /** statuses at which this step is considered complete */
  completedAt: OrderStatus[];
}

const TIMELINE_STEPS: TimelineStepDef[] = [
  {
    key: 'payment',
    label: 'Payment Secured',
    description: 'Funds held in escrow',
    icon: Shield,
    completedAt: ['PENDING_DISPATCH', 'IN_CUTTING_PROCESS', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
  },
  {
    key: 'cutting',
    label: 'Cutting',
    description: 'Gem being cut (optional)',
    icon: Scissors,
    completedAt: ['IN_CUTTING_PROCESS', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
  },
  {
    key: 'shipped',
    label: 'Shipped',
    description: 'Dispatched via courier',
    icon: Truck,
    completedAt: ['SHIPPED', 'DELIVERED', 'COMPLETED'],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Received by buyer',
    icon: Home,
    completedAt: ['DELIVERED', 'COMPLETED'],
  },
  {
    key: 'released',
    label: 'Escrow Released',
    description: 'Funds transferred to seller',
    icon: DollarSign,
    completedAt: ['COMPLETED'],
  },
];

const STATUS_ORDER: OrderStatus[] = [
  'PENDING_DISPATCH',
  'IN_CUTTING_PROCESS',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
];

const getStepState = (step: TimelineStepDef, currentStatus: OrderStatus): 'completed' | 'current' | 'pending' => {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  // Find the *earliest* status that marks this step done
  const stepIdxList = step.completedAt.map(s => STATUS_ORDER.indexOf(s)).filter(i => i !== -1);
  if (stepIdxList.length === 0) return 'pending';
  const minStepIdx = Math.min(...stepIdxList);
  if (currentIdx > minStepIdx) return 'completed';
  if (currentIdx === minStepIdx) return 'current';
  return 'pending';
};

interface EscrowTimelineProps {
  currentStatus: OrderStatus;
  isDisputed?: boolean;
  hasCutter?: boolean;
}

const EscrowTimeline: React.FC<EscrowTimelineProps> = ({ currentStatus, isDisputed, hasCutter }) => {
  const steps = hasCutter ? TIMELINE_STEPS : TIMELINE_STEPS.filter(s => s.key !== 'cutting');

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-rose-200/60 bg-rose-50/40 backdrop-blur-xl">
        <XCircle className="h-10 w-10 text-rose-500 mb-2" />
        <p className="font-semibold text-rose-700">Order Cancelled</p>
        <p className="text-sm text-rose-500 mt-1">Escrow has been refunded to the buyer.</p>
      </div>
    );
  }

  if (isDisputed) {
    return (
      <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xl">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
        <p className="font-semibold text-amber-700">Dispute Active — Escrow Frozen</p>
        <p className="text-sm text-amber-500 mt-1">Awaiting admin resolution. Funds are safe.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* ── Horizontal Timeline (Desktop) ── */}
      <div className="hidden md:flex items-start justify-between relative px-4 py-6">
        {/* Connecting Line */}
        <div className="absolute top-[2.65rem] left-[calc(2rem+10px)] right-[calc(2rem+10px)] h-0.5 bg-slate-200/80 z-0" />
        <div
          className="absolute top-[2.65rem] left-[calc(2rem+10px)] h-0.5 bg-teal-500 z-[1] transition-all duration-700"
          style={{
            width: `${(STATUS_ORDER.indexOf(currentStatus) / (steps.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 4rem - 20px)',
          }}
        />

        {steps.map((step) => {
          const state = getStepState(step, currentStatus);
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center flex-1">
              {/* Circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  state === 'completed'
                    ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/25'
                    : state === 'current'
                    ? 'bg-teal-600 border-teal-600 text-white ring-[3px] ring-teal-500/20 shadow-lg shadow-teal-500/30'
                    : 'bg-white/60 border-slate-300 text-slate-400'
                }`}
              >
                {state === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {/* Label */}
              <p className={`mt-2.5 text-xs font-semibold ${state === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                {step.label}
              </p>
              <p className={`mt-0.5 text-[10px] max-w-[100px] ${state === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Vertical Timeline (Mobile) ── */}
      <div className="md:hidden px-2 py-4">
        <div className="relative">
          <div className="absolute left-[1.19rem] top-0 bottom-0 w-0.5 bg-slate-200/80" />
          {steps.map((step) => {
            const state = getStepState(step, currentStatus);
            const Icon = step.icon;
            return (
              <div key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                    state === 'completed'
                      ? 'bg-teal-600 text-white'
                      : state === 'current'
                      ? 'bg-teal-600 text-white ring-4 ring-teal-500/15'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${state === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${state === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Info Row Helper ──────────────────────────────────────

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string; mono?: boolean; copyable?: boolean }> = ({
  icon: Icon,
  label,
  value,
  mono,
  copyable,
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-medium text-slate-800 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
          {copyable && (
            <button onClick={handleCopy} className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer">
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tracking Update Modal (Seller) ───────────────────────

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courier: string, tracking: string) => void;
  currentCourier?: string;
  currentTracking?: string;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, onSubmit, currentCourier, currentTracking }) => {
  const [courier, setCourier] = useState(currentCourier || '');
  const [tracking, setTracking] = useState(currentTracking || '');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-teal-600" />
            Update Tracking
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Courier Company</label>
            <input
              type="text"
              value={courier}
              onChange={e => setCourier(e.target.value)}
              placeholder="e.g., DHL Express"
              className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
            <input
              type="text"
              value={tracking}
              onChange={e => setTracking(e.target.value)}
              placeholder="e.g., DHL-9482716305"
              className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-mono"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <button
              onClick={() => { onSubmit(courier, tracking); onClose(); }}
              disabled={!courier.trim() || !tracking.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSelector((state: RootState) => state.auth);

  // ── State ────────────────────────────────────────────────
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(getActiveRole);

  // ── Role perspective sync ────────────────────────────────
  useEffect(() => {
    const sync = () => setActiveRole(getActiveRole());
    window.addEventListener('activeRoleChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('activeRoleChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // ── Fetch / mock data ────────────────────────────────────
  useEffect(() => {
    // Simulate network delay then load mock data
    const timer = setTimeout(() => {
      setOrder({ ...MOCK_ORDER, _id: id || MOCK_ORDER._id });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  // ── Derived role booleans ────────────────────────────────
  const isBuyerView = activeRole === 'BUYER' || activeRole === 'CUTTER';
  const isSellerView = activeRole === 'SELLER';
  const isAdminView = activeRole === 'ADMIN';

  // ── Action handlers (mock) ───────────────────────────────
  const handleReleaseEscrow = async () => {
    setActionLoading(true);
    await fakeSleep(800);
    setOrder(prev => prev ? { ...prev, escrowStatus: 'RELEASED', status: 'COMPLETED' } : prev);
    setActionLoading(false);
  };

  const handleConfirmDelivery = async () => {
    setActionLoading(true);
    await fakeSleep(800);
    setOrder(prev => prev ? { ...prev, status: 'DELIVERED' } : prev);
    setActionLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Cancel this order? The escrow will be refunded.')) return;
    setActionLoading(true);
    await fakeSleep(800);
    setOrder(prev => prev ? { ...prev, status: 'CANCELLED', escrowStatus: 'REFUNDED' } : prev);
    setActionLoading(false);
  };

  const handleUpdateTracking = (courier: string, tracking: string) => {
    setOrder(prev =>
      prev
        ? {
            ...prev,
            deliveryInfo: { ...prev.deliveryInfo, courierCompany: courier, trackingNumber: tracking, shippedAt: new Date().toISOString() },
            status: 'SHIPPED',
          }
        : prev
    );
  };

  // ── Render guards ────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="text-center py-12 text-slate-500">Order not found</div>;

  // ── Conditional action flags ─────────────────────────────
  const canCancel = order.status === 'PENDING_DISPATCH' && (isBuyerView || isAdminView);
  const canDispute = !['CANCELLED', 'COMPLETED', 'DISPUTED'].includes(order.status) && (isBuyerView || isSellerView);
  const canConfirmDelivery = order.status === 'DELIVERED' && isBuyerView && order.escrowStatus === 'HELD';
  const canReleaseEscrow = (order.status === 'COMPLETED' || order.status === 'DELIVERED') && order.escrowStatus === 'HELD' && isBuyerView;
  const canUpdateTracking = ['PENDING_DISPATCH', 'IN_CUTTING_PROCESS'].includes(order.status) && isSellerView;

  // ── Status badge variant map ─────────────────────────────
  const statusVariant = (s: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'info' => {
    switch (s) {
      case 'COMPLETED': return 'success';
      case 'SHIPPED': return 'info';
      case 'DELIVERED': return 'secondary';
      case 'PENDING_DISPATCH':
      case 'IN_CUTTING_PROCESS': return 'warning';
      case 'CANCELLED':
      case 'DISPUTED': return 'destructive';
      default: return 'default';
    }
  };

  // ── Escrow label ─────────────────────────────────────────
  const escrowLabel = order.escrowStatus === 'HELD' ? 'Locked in Escrow' : order.escrowStatus === 'RELEASED' ? 'Released to Seller' : 'Refunded to Buyer';
  const escrowColor = order.escrowStatus === 'HELD' ? 'text-amber-600' : order.escrowStatus === 'RELEASED' ? 'text-emerald-600' : 'text-rose-600';
  const EscrowIcon = order.escrowStatus === 'HELD' ? Lock : order.escrowStatus === 'RELEASED' ? CheckCircle : AlertCircle;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-5">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════════════════════ */}
        {/*  LEFT COLUMN — Main Info                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Order Header Card ── */}
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(order.status)} className="text-xs">
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Gem Preview */}
            <div className="flex gap-4 mt-5 pt-5 border-t border-white/40">
              <img
                src={order.gemId.images?.[0] || 'https://placehold.co/120x120?text=Gem'}
                alt={order.gemId.title}
                className="w-24 h-24 rounded-xl object-cover border border-white/50 shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <Link to={`/gems/${order.gemId._id}`} className="font-semibold text-slate-900 hover:text-teal-600 transition-colors line-clamp-1">
                  {order.gemId.title}
                </Link>
                <p className="text-sm text-slate-500 mt-0.5">{order.gemId.weightCarats} ct · {order.gemId.type}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">${order.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ── Escrow Timeline Card ── */}
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                Escrow Timeline
              </h2>
            </div>
            <EscrowTimeline
              currentStatus={order.status}
              isDisputed={order.status === 'DISPUTED'}
              hasCutter={!!order.cutterId}
            />
          </div>

          {/* ── Role-Based Action Cards ── */}
          {/* BUYER ACTIONS */}
          {isBuyerView && (
            <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Buyer Actions</h2>
              <div className="flex flex-wrap gap-3">
                {canConfirmDelivery && (
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Truck className="h-4 w-4" />
                    {actionLoading ? 'Processing…' : 'Confirm Delivery'}
                  </button>
                )}
                {canReleaseEscrow && (
                  <button
                    onClick={handleReleaseEscrow}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {actionLoading ? 'Releasing…' : 'Release Escrow'}
                  </button>
                )}
                {canCancel && (
                  <Button variant="destructive" onClick={handleCancelOrder} disabled={actionLoading}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                )}
                {canDispute && !showDisputeForm && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100/60 hover:text-rose-700 transition-all cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Raise Dispute
                  </button>
                )}
                {!canConfirmDelivery && !canReleaseEscrow && !canCancel && !canDispute && (
                  <p className="text-sm text-slate-500 italic">No actions available for this order state.</p>
                )}
              </div>
            </div>
          )}

          {/* SELLER ACTIONS */}
          {isSellerView && (
            <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Seller Actions</h2>
              <div className="flex flex-wrap gap-3">
                {canUpdateTracking && (
                  <button
                    onClick={() => setShowTrackingModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 transition-all cursor-pointer"
                  >
                    <Truck className="h-4 w-4" />
                    Update Tracking Info
                  </button>
                )}
                {canDispute && !showDisputeForm && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100/60 hover:text-rose-700 transition-all cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Raise Dispute
                  </button>
                )}
                {!canUpdateTracking && !canDispute && (
                  <p className="text-sm text-slate-500 italic">No actions available for this order state.</p>
                )}
              </div>
            </div>
          )}

          {/* Dispute Form (shared) */}
          {showDisputeForm && (
            <DisputeForm
              orderId={order._id}
              orderNumber={order.orderNumber}
              onSuccess={() => {
                setShowDisputeForm(false);
                setOrder(prev => prev ? { ...prev, status: 'DISPUTED' } : prev);
              }}
              onCancel={() => setShowDisputeForm(false)}
            />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  RIGHT COLUMN — Sidebar Cards                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── Escrow Status Card ── */}
          <div className={`rounded-2xl border shadow-lg p-5 ${
            order.escrowStatus === 'HELD'
              ? 'border-amber-200/60 bg-amber-50/40 backdrop-blur-xl'
              : order.escrowStatus === 'RELEASED'
              ? 'border-emerald-200/60 bg-emerald-50/40 backdrop-blur-xl'
              : 'border-rose-200/60 bg-rose-50/40 backdrop-blur-xl'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Escrow Protection
              </h3>
              <EscrowIcon className={`h-5 w-5 ${escrowColor}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">${order.amount.toLocaleString()}</p>
            <p className={`text-sm font-medium mt-1 ${escrowColor}`}>{escrowLabel}</p>

            {/* Price breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-200/40 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-medium text-slate-800">-${order.adminFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Seller Receives</span>
                <span className="font-bold text-emerald-600">${order.sellerAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Auto-release countdown (Seller sees "Locked" label) */}
            {order.escrowStatus === 'HELD' && order.deliveryInfo.autoReleaseDate && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {isSellerView
                  ? <span className="font-semibold text-amber-600">Escrow Status: Locked</span>
                  : <span>Auto-release: {new Date(order.deliveryInfo.autoReleaseDate).toLocaleDateString()}</span>
                }
              </div>
            )}
          </div>

          {/* ── Shipping Info Card ── */}
          {order.deliveryInfo.trackingNumber && (
            <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg p-5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                <Package className="h-4 w-4 text-teal-600" />
                Shipping Details
              </h3>
              <div className="space-y-0.5">
                <InfoRow icon={Truck} label="Courier" value={order.deliveryInfo.courierCompany || 'N/A'} />
                <InfoRow icon={Hash} label="Tracking No." value={order.deliveryInfo.trackingNumber} mono copyable />
                {order.deliveryInfo.shippedAt && (
                  <InfoRow icon={CalendarDays} label="Shipped" value={new Date(order.deliveryInfo.shippedAt).toLocaleDateString()} />
                )}
                {order.deliveryInfo.deliveredAt && (
                  <InfoRow icon={Home} label="Delivered" value={new Date(order.deliveryInfo.deliveredAt).toLocaleDateString()} />
                )}
              </div>
            </div>
          )}

          {/* ── Parties Card ── */}
          <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg p-5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <User className="h-4 w-4 text-teal-600" />
              Involved Parties
            </h3>
            <div className="space-y-0.5">
              <InfoRow icon={User} label="Buyer" value={`${order.buyerId.firstName} ${order.buyerId.lastName}`} />
              <InfoRow
                icon={MapPin}
                label="Seller"
                value={order.sellerId.businessName || `${order.sellerId.firstName} ${order.sellerId.lastName}`}
              />
              {order.cutterId && (
                <InfoRow icon={Scissors} label="Cutter" value={`${order.cutterId.firstName} ${order.cutterId.lastName}`} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tracking Modal (Seller only) ── */}
      <TrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSubmit={handleUpdateTracking}
        currentCourier={order.deliveryInfo.courierCompany}
        currentTracking={order.deliveryInfo.trackingNumber}
      />
    </div>
  );
};

// ── Utility ───────────────────────────────────────────────

const fakeSleep = (ms: number) => new Promise(r => setTimeout(r, ms));