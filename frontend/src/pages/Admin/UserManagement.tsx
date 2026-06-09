import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  Users,
  Check,
  X,
  Clock,
  Loader2,
  AlertTriangle,
  Search,
  ExternalLink,
  Calendar,
  Mail,
  Eye
} from 'lucide-react';

interface PendingKYC {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  phone?: string;
  companyName?: string;
  kycStatus: string;
  kycDetails?: {
    documentType?: string;
    idNumber?: string;
    dob?: string;
    documentUrls: string[];
  };
}

export const UserManagement: React.FC = () => {
  const [requests, setRequests] = useState<PendingKYC[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingKYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pending KYC list
  const fetchPendingKYC = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/kyc/pending');
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
          req.roles.some(role => role.toLowerCase().includes(term)) ||
          (req.kycDetails?.idNumber && req.kycDetails.idNumber.toLowerCase().includes(term))
      );
      setFilteredRequests(filtered);
    }
  }, [searchTerm, requests]);

  // Handle KYC Status update (Approve / Reject) with true Optimistic UI updates
  const handleUpdateStatus = async (userId: string, status: 'Verified' | 'Rejected') => {
    // Keep reference to previous state for potential rollback
    const originalRequests = [...requests];

    // Optimistically update the UI: remove the row instantly
    setRequests(prev => prev.filter(req => req._id !== userId));

    // Show success toast instantly
    if (status === 'Verified') {
      toast.success('KYC Approved', 'User verification completed successfully.');
    } else {
      toast.success('KYC Rejected', 'User verification request rejected.');
    }

    try {
      const payload: any = { status };
      if (status === 'Rejected') {
        payload.rejectionReason = 'Submitted identity documents were unreadable, expired, or invalid. Please resubmit valid credentials.';
      }

      await api.patch(`/admin/kyc/${userId}/status`, payload);
    } catch (error: any) {
      // Rollback to previous state on failure and show error toast
      setRequests(originalRequests);
      toast.error('Action Failed', error.message || 'Could not update verification status.');
    }
  };

  // Helper to format roles
  const renderRoleBadge = (roles: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map(role => {
          let color = 'bg-slate-100 text-slate-850';
          if (role === 'ADMIN') color = 'bg-amber-105 text-amber-900';
          else if (role === 'SELLER') color = 'bg-emerald-100 text-emerald-900';
          else if (role === 'BUYER') color = 'bg-sky-100 text-sky-900';
          else if (role === 'CUTTER') color = 'bg-purple-100 text-purple-900';

          return (
            <Badge key={role} className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 border-none ${color}`}>
              {role}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users className="w-8 h-8 text-emerald-600" />
              User KYC Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review legal document proof submissions and perform buyer & seller account verification clearance.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 self-start">
            <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
            <div>
              <span className="text-xs text-emerald-800 font-medium block">Awaiting Verification</span>
              <span className="text-lg font-bold text-emerald-900 leading-none">{requests.length} Submissions</span>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, role, or document ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-350 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <button
              onClick={fetchPendingKYC}
              disabled={loading}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Refresh List
            </button>
          </CardContent>
        </Card>

        {/* Data Table Card */}
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
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-md font-bold text-slate-900">All Requests Resolved</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  {searchTerm
                    ? 'No matching pending verifications found for this search query.'
                    : 'There are no pending KYC requests awaiting compliance review.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role (Buyer/Seller)</th>
                    <th className="px-6 py-4">ID Number</th>
                    <th className="px-6 py-4">DOB</th>
                    <th className="px-6 py-4">Document Links</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredRequests.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-650 font-bold shadow-inner flex-shrink-0">
                            {req.firstName[0]}
                            {req.lastName[0]}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {req.firstName} {req.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {req.email}
                        </span>
                      </td>

                      {/* Role (Buyer/Seller) */}
                      <td className="px-6 py-4">
                        {renderRoleBadge(req.roles)}
                      </td>

                      {/* ID Number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 px-1.5 border-slate-350 text-slate-650">
                            {req.kycDetails?.documentType || 'ID'}
                          </Badge>
                          <span className="font-semibold text-slate-800 font-mono">
                            {req.kycDetails?.idNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* DOB */}
                      <td className="px-6 py-4">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {req.kycDetails?.dob || 'N/A'}
                        </span>
                      </td>

                      {/* Document Links */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {req.kycDetails?.documentUrls && req.kycDetails.documentUrls.length > 0 ? (
                            req.kycDetails.documentUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {idx === 0 ? 'Document 1 (Front)' : idx === 1 ? 'Document 2 (Back)' : `Document ${idx + 1}`}
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-rose-500 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              No proof attached
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Document button */}
                          {req.kycDetails?.documentUrls && req.kycDetails.documentUrls.length > 0 && (
                            <button
                              type="button"
                              onClick={() => window.open(req.kycDetails!.documentUrls[0], '_blank')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1"
                              title="View first uploaded document proof in a new tab"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Document
                            </button>
                          )}

                          {/* Solid Emerald Approve button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req._id, 'Verified')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          
                          {/* Solid Red Reject button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
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
    </div>
  );
};
