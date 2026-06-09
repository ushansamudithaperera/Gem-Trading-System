import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import * as disputeService from '../../services/dispute.service';
import {
  X,
  Plus,
  Check,
  AlertTriangle,
  Calendar,
  Loader2,
  Search,
  Scale,
  ShieldAlert
} from 'lucide-react';

interface Dispute {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    amount: number;
    status: string;
    escrowStatus: string;
  };
  raisedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  against: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  adminDecision?: string;
  adminResolution?: string;
  createdAt: string;
  updatedAt: string;
}

const DISPUTE_REASONS = [
  { value: 'NOT_RECEIVED', label: 'Item Not Received' },
  { value: 'ITEM_MISMATCH', label: 'Item Mismatch' },
  { value: 'DAMAGED', label: 'Item Damaged' },
  { value: 'CUTTING_QUALITY', label: 'Cutting Quality Issue' },
  { value: 'OTHER', label: 'Other / Custom Reason' },
];

export const DisputeCenter: React.FC = () => {
  const { isAdmin } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Form states
  const [newDisputeData, setNewDisputeData] = useState({
    orderId: '',
    reason: '',
    description: '',
  });

  const [resolveData, setResolveData] = useState({
    decision: '',
    action: 'REFUND_BUYER' as 'REFUND_BUYER' | 'PAY_SELLER',
  });

  // Fetch disputes based on role
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await disputeService.getAdminDisputes();
      } else {
        data = await disputeService.getMyDisputes();
      }
      const list = data.data || [];
      setDisputes(list);
      setFilteredDisputes(list);
    } catch (error: any) {
      toast.error('Fetch Failed', error.message || 'Failed to retrieve dispute logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [isAdmin]);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredDisputes(disputes);
    } else {
      const filtered = disputes.filter(
        d =>
          d.orderId?.orderNumber.toLowerCase().includes(term) ||
          `${d.raisedBy.firstName} ${d.raisedBy.lastName}`.toLowerCase().includes(term) ||
          `${d.against.firstName} ${d.against.lastName}`.toLowerCase().includes(term) ||
          d.raisedBy.email.toLowerCase().includes(term) ||
          d.against.email.toLowerCase().includes(term) ||
          d.reason.toLowerCase().includes(term)
      );
      setFilteredDisputes(filtered);
    }
  }, [searchTerm, disputes]);

  // Submit New Dispute
  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisputeData.orderId.trim() || !newDisputeData.reason || !newDisputeData.description.trim()) {
      toast.error('Validation Error', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: newDisputeData.orderId.trim(),
        reason: newDisputeData.reason,
        description: newDisputeData.description.trim(),
      };

      await disputeService.openDispute(payload);
      toast.success('Dispute Raised', 'Your dispute request has been recorded. Escrow is locked.');
      
      // Reset form and modal
      setNewDisputeData({ orderId: '', reason: '', description: '' });
      setShowOpenModal(false);
      
      // Reload lists
      await fetchDisputes();
    } catch (error: any) {
      toast.error('Submission Failed', error.message || 'Could not raise dispute.');
    } finally {
      setLoading(false);
    }
  };

  // Resolve Dispute (Admin Action with Optimistic UI updates)
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    if (!resolveData.decision.trim()) {
      toast.error('Validation Error', 'Please provide a clear resolution decision.');
      return;
    }

    const disputeId = selectedDispute._id;
    const originalDisputes = [...disputes];

    // Optimistically update the list locally: change status and adminDecision instantly
    setDisputes(prev =>
      prev.map(d =>
        d._id === disputeId
          ? {
              ...d,
              status: 'Resolved',
              adminDecision: resolveData.decision.trim(),
              adminResolution: resolveData.decision.trim(),
              resolvedAt: new Date().toISOString(),
            }
          : d
      )
    );

    setShowResolveModal(false);
    toast.success('Dispute Resolved', ' Escrow action applied and dispute closed.');

    try {
      const payload: disputeService.ResolveDisputePayload = {
        decision: resolveData.decision.trim(),
        resolutionAction: resolveData.action,
      };

      await disputeService.resolveDispute(disputeId, payload);
    } catch (error: any) {
      // Rollback to original state on API failure
      setDisputes(originalDisputes);
      toast.error('Resolution Failed', error.message || 'Could not record dispute resolution.');
    } finally {
      setSelectedDispute(null);
      setResolveData({ decision: '', action: 'REFUND_BUYER' });
    }
  };

  // Status Badge styling helper (Red: Open, Yellow: Under Review, Green: Resolved)
  const getStatusBadge = (status: string) => {
    const norm = status.toUpperCase();
    if (norm === 'RESOLVED' || norm === 'RESOLVED_BUYER' || norm === 'RESOLVED_SELLER' || norm === 'CLOSED') {
      return (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-250 font-bold text-xs uppercase px-2 py-0.5">
          Resolved
        </Badge>
      );
    } else if (norm === 'UNDER_REVIEW') {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-250 font-bold text-xs uppercase px-2 py-0.5">
          Under Review
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-250 font-bold text-xs uppercase px-2 py-0.5">
          Open
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReasonLabel = (val: string) => {
    return DISPUTE_REASONS.find(r => r.value === val)?.label || val.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Scale className="w-8 h-8 text-blue-600" />
              Dispute Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin 
                ? 'Arbitrate platform conflicts, inspect evidence, and manage locked escrow funds.'
                : 'Raise disputes for order issues or inspect current conflict cases.'}
            </p>
          </div>
          
          {!isAdmin && (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Open New Dispute
            </button>
          )}
        </div>

        {/* Filter Card */}
        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Order number or user details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-350 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-505 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            
            <button
              onClick={fetchDisputes}
              disabled={loading}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Refresh Case List
            </button>
          </CardContent>
        </Card>

        {/* Disputes List Table */}
        <Card className="border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            {loading && disputes.length === 0 ? (
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
            ) : filteredDisputes.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-md font-bold text-slate-900">No Disputes Recorded</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  {searchTerm
                    ? 'No dispute records found matching the search criteria.'
                    : 'There are no active disputes or conflict logs registered.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Raised Date</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Raised By</th>
                    <th className="px-6 py-4">Against</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Admin Decision</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredDisputes.map(dispute => {
                    const isOpen = dispute.status === 'Open' || dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW' || dispute.status === 'Under Review';
                    
                    return (
                      <tr key={dispute._id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Order Number */}
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                          #{dispute.orderId?.orderNumber || 'N/A'}
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(dispute.createdAt)}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {getReasonLabel(dispute.reason)}
                        </td>

                        {/* Raised By */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {dispute.raisedBy.firstName} {dispute.raisedBy.lastName}
                            </span>
                            <span className="text-xs text-slate-450">{dispute.raisedBy.email}</span>
                          </div>
                        </td>

                        {/* Against */}
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {dispute.against.firstName} {dispute.against.lastName}
                            </span>
                            <span className="text-xs text-slate-455">{dispute.against.email}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(dispute.status)}
                        </td>

                        {/* Admin Decision */}
                        <td className="px-6 py-4">
                          {dispute.adminDecision || dispute.adminResolution ? (
                            <p className="text-xs text-slate-600 italic max-w-xs truncate" title={dispute.adminDecision || dispute.adminResolution}>
                              {dispute.adminDecision || dispute.adminResolution}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Pending arbitration</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isAdmin && isOpen ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setResolveData({ decision: '', action: 'REFUND_BUYER' });
                                setShowResolveModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-colors ml-auto flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Resolve Dispute
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDispute(dispute);
                              }}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors ml-auto"
                            >
                              View Details
                            </button>
                          )}
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

      {/* OPEN DISPUTE MODAL */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowOpenModal(false)}>
          <Card className="max-w-md w-full border border-slate-200 shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Raise a New Order Dispute
              </h2>
              <button onClick={() => setShowOpenModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleOpenDispute}>
              <div className="p-5 space-y-4">
                {/* Order ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Order Document Object ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 64b8a2e58c14f09d85aa0381"
                    value={newDisputeData.orderId}
                    onChange={e => setNewDisputeData({ ...newDisputeData, orderId: e.target.value })}
                    className="w-full text-slate-900 rounded-lg border border-slate-350 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                {/* Reason Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Dispute Reason <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newDisputeData.reason}
                    onChange={e => setNewDisputeData({ ...newDisputeData, reason: e.target.value })}
                    className="w-full text-slate-900 rounded-lg border border-slate-350 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">Select a reason category...</option>
                    {DISPUTE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Elaborate Dispute Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the issue. Include tracking numbers, quality details, or specific discrepancies."
                    value={newDisputeData.description}
                    onChange={e => setNewDisputeData({ ...newDisputeData, description: e.target.value })}
                    className="w-full text-slate-900 rounded-lg border border-slate-350 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-sm hover:shadow transition-colors"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* RESOLVE DISPUTE MODAL (ADMIN) */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResolveModal(false)}>
          <Card className="max-w-md w-full border border-slate-200 shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                Resolve Conflict Case
              </h2>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleResolveDispute}>
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 text-xs text-slate-650">
                  <span className="block"><strong>Case Ref:</strong> #{selectedDispute.orderId?.orderNumber}</span>
                  <span className="block"><strong>Raised By:</strong> {selectedDispute.raisedBy.firstName} {selectedDispute.raisedBy.lastName}</span>
                  <span className="block"><strong>Opposing Party:</strong> {selectedDispute.against.firstName} {selectedDispute.against.lastName}</span>
                  <span className="block"><strong>Discrepancy:</strong> {getReasonLabel(selectedDispute.reason)}</span>
                </div>

                {/* Resolution Action */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Adjudication Escrow Action <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <label className={`flex items-center justify-center gap-1.5 border rounded-lg p-3 text-xs font-semibold cursor-pointer transition-all ${
                      resolveData.action === 'REFUND_BUYER'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resolutionAction"
                        checked={resolveData.action === 'REFUND_BUYER'}
                        onChange={() => setResolveData({ ...resolveData, action: 'REFUND_BUYER' })}
                        className="sr-only"
                      />
                      Refund Buyer
                    </label>

                    <label className={`flex items-center justify-center gap-1.5 border rounded-lg p-3 text-xs font-semibold cursor-pointer transition-all ${
                      resolveData.action === 'PAY_SELLER'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resolutionAction"
                        checked={resolveData.action === 'PAY_SELLER'}
                        onChange={() => setResolveData({ ...resolveData, action: 'PAY_SELLER' })}
                        className="sr-only"
                      />
                      Pay Seller / Cutter
                    </label>
                  </div>
                </div>

                {/* Decision Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Arbitration Verdict / Explanation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="State the official platform decision explaining the ruling."
                    value={resolveData.decision}
                    onChange={e => setResolveData({ ...resolveData, decision: e.target.value })}
                    className="w-full text-slate-900 rounded-lg border border-slate-350 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-sm hover:shadow transition-colors"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DISPUTE DETAIL VIEW MODAL (FOR REGULAR USER OR VIEW DETAILS) */}
      {selectedDispute && !showResolveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDispute(null)}>
          <Card className="max-w-md w-full border border-slate-200 shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Case details
              </h2>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">#{selectedDispute.orderId?.orderNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Case Status</span>
                  <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Claimant</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedDispute.raisedBy.firstName} {selectedDispute.raisedBy.lastName} ({selectedDispute.raisedBy.email})</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Opponent</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedDispute.against.firstName} {selectedDispute.against.lastName} ({selectedDispute.against.email})</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Category Reason</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{getReasonLabel(selectedDispute.reason)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-semibold">Incident Details</span>
                <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed text-xs">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.adminDecision && (
                <div className="border-t border-slate-100 pt-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Platform Ruling Verdict</span>
                  <p className="text-slate-700 mt-1 text-xs italic font-medium">
                    "{selectedDispute.adminDecision}"
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
export default DisputeCenter;
