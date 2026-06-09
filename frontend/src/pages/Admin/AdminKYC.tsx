import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  Shield,
  Check,
  X,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  Search,
  UserCheck,
  UserX,
  ExternalLink,
  Calendar,
  Building,
  Mail
} from 'lucide-react';

interface PendingKYC {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  kycStatus: string;
  kycDetails?: {
    documentType?: string;
    idNumber?: string;
    dob?: string;
    documentUrls: string[];
  };
  createdAt: string;
}

export const AdminKYC: React.FC = () => {
  const [requests, setRequests] = useState<PendingKYC[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingKYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Action state (to show loading spinners inside specific action buttons)
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Document Modal Viewer state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Rejection Dialog state
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending KYC list
  const fetchPendingKYC = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/kyc/pending');
      // Backend returns ApiResponse: { statusCode, data, message }
      const data = response.data.data || [];
      setRequests(data);
      setFilteredRequests(data);
    } catch (error: any) {
      toast.error('Fetch Failed', error.message || 'Failed to retrieve pending KYC requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  // Filter pending list based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(
        req =>
          `${req.firstName} ${req.lastName}`.toLowerCase().includes(term) ||
          req.email.toLowerCase().includes(term) ||
          (req.companyName && req.companyName.toLowerCase().includes(term)) ||
          (req.kycDetails?.idNumber && req.kycDetails.idNumber.toLowerCase().includes(term))
      );
      setFilteredRequests(filtered);
    }
  }, [searchTerm, requests]);

  // Handle Approve Action
  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/kyc/${userId}/status`, { status: 'Verified' });
      
      // Optimistically filter out the verified user
      setRequests(prev => prev.filter(req => req._id !== userId));
      toast.success('KYC Approved', 'The user identity has been verified successfully.');
    } catch (error: any) {
      toast.error('Approval Failed', error.message || 'Could not verify user.');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (userId: string) => {
    setRejectUserId(userId);
    setRejectionReason('');
  };

  // Submit Rejection Action
  const handleReject = async () => {
    if (!rejectUserId) return;
    if (!rejectionReason.trim()) {
      toast.error('Validation Error', 'Please provide a reason for rejecting the submission.');
      return;
    }

    setActionLoading(rejectUserId);
    const targetUserId = rejectUserId;
    
    // Close dialog immediately
    setRejectUserId(null);

    try {
      await api.patch(`/admin/kyc/${targetUserId}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReason.trim(),
      });

      // Optimistically filter out the rejected user
      setRequests(prev => prev.filter(req => req._id !== targetUserId));
      toast.success('KYC Rejected', 'The verification request has been rejected and user notified.');
    } catch (error: any) {
      toast.error('Rejection Failed', error.message || 'Could not reject user.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-emerald-600" />
              KYC Verification Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify legal identity documents and business registrations for platform compliance.
            </p>
          </div>
          
          {/* Stats Badge */}
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 self-start">
            <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
            <div>
              <span className="text-xs text-emerald-800 font-medium block">Awaiting Review</span>
              <span className="text-lg font-bold text-emerald-900 leading-none">{requests.length} Requests</span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Card */}
        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, company, or ID number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
            
            {/* Refresh queue indicator */}
            <button
              onClick={fetchPendingKYC}
              disabled={loading}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Refresh Queue
            </button>
          </CardContent>
        </Card>

        {/* Main Table Panel */}
        <Card className="border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              // Loading Skeleton State
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
            ) : filteredRequests.length === 0 ? (
              // Empty State
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-md font-bold text-slate-900">Queue is Empty</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  {searchTerm
                    ? 'No matching pending requests found. Try adjusting your search keywords.'
                    : 'All submitted KYC compliance verification requests have been resolved.'}
                </p>
              </div>
            ) : (
              // Pending KYC Requests Table
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Applicant & Account</th>
                    <th className="px-6 py-4">Company Details</th>
                    <th className="px-6 py-4">Identity Details</th>
                    <th className="px-6 py-4">Verification Proofs</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredRequests.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name & Account */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-semibold shadow-inner flex-shrink-0">
                            {req.firstName[0]}
                            {req.lastName[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {req.firstName} {req.lastName}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {req.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company representation */}
                      <td className="px-6 py-4">
                        {req.companyName ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{req.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None Provided</span>
                        )}
                      </td>

                      {/* ID Details (Number & DOB) */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 px-1.5">
                              {req.kycDetails?.documentType || 'ID'}
                            </Badge>
                            <span className="font-semibold text-slate-800 font-mono">
                              {req.kycDetails?.idNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            DOB: {req.kycDetails?.dob || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Document Verification Proofs */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {req.kycDetails?.documentUrls && req.kycDetails.documentUrls.length > 0 ? (
                            req.kycDetails.documentUrls.map((url, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedImage(url)}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-md text-xs font-semibold text-emerald-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                {index === 0 ? 'Front View' : index === 1 ? 'Back View' : `Proof #${index + 1}`}
                              </button>
                            ))
                          ) : (
                            <span className="text-rose-500 font-semibold text-xs flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Missing Documents
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(req._id)}
                            disabled={actionLoading === req._id}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1"
                          >
                            {actionLoading === req._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Approve
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => openRejectDialog(req._id)}
                            disabled={actionLoading === req._id}
                            className="border border-rose-200 hover:border-rose-300 bg-white hover:bg-rose-50/50 disabled:opacity-50 text-rose-600 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2.5 overflow-hidden shadow-2xl flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <img
              src={selectedImage}
              alt="Verification Document Proof"
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            
            <div className="p-3 bg-slate-50 flex justify-between items-center mt-2.5 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Identity Document Proof View</span>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Original in New Tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG */}
      {rejectUserId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRejectUserId(null)}>
          <Card className="max-w-md w-full border border-slate-200 shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-rose-500" />
                  Reject Verification Request
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  Specify why this submission is being rejected. The user will be notified.
                </CardDescription>
              </div>
              <button onClick={() => setRejectUserId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="e.g. Uploaded documents are blurred and text is illegible. Please submit high-resolution photos of your NIC."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full text-slate-900 rounded-lg border border-slate-350 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-slate-400 transition-all"
                />
              </div>
            </CardContent>
            <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setRejectUserId(null)}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-sm hover:shadow transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
