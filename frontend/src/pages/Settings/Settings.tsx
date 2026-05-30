import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import {
  Upload,
  Check,
  AlertCircle,
  Clock,
  X,
  Download,
  Eye,
  FileCheck,
  AlertTriangle,
  User,
  Lock,
  Bell,
  Shield,
} from 'lucide-react';
import '../Settings.css';

// Types
interface KYCDocument {
  _id?: string;
  type: 'BUSINESS_REGISTRATION' | 'NATIONAL_ID' | 'PASSPORT';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

interface KYCData {
  userId: string;
  kycStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  documents: KYCDocument[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PendingKYCReview {
  userId: string;
  userName: string;
  userEmail: string;
  kycStatus: string;
  documents: KYCDocument[];
  submittedAt: string;
}

type SettingsTab = 'kyc' | 'profile' | 'security' | 'notifications';

export const Settings: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('kyc');
  const [loading, setLoading] = useState(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingKYCReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PendingKYCReview | null>(null);
  const [isDragging, setIsDragging] = useState<'BUSINESS_REGISTRATION' | 'NATIONAL_ID' | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<'BUSINESS_REGISTRATION' | 'NATIONAL_ID' | null>(null);
  const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageToView, setSelectedImageToView] = useState<string | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDocToApprove, setSelectedDocToApprove] = useState<KYCDocument | null>(null);

  // Fetch KYC data
  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Admin view: fetch pending reviews
        // Mock data for now - replace with actual API call
        setPendingReviews([
          {
            userId: '1',
            userName: 'John Buyer',
            userEmail: 'john@example.com',
            kycStatus: 'PENDING_REVIEW',
            documents: [
              {
                type: 'BUSINESS_REGISTRATION',
                fileName: 'business_reg.pdf',
                fileUrl: 'https://example.com/doc1.pdf',
                uploadedAt: new Date().toISOString(),
                status: 'PENDING',
              },
            ],
            submittedAt: new Date().toISOString(),
          },
        ]);
      } else {
        // User view: fetch their KYC data
        // Mock data for now - replace with actual API call
        setKycData({
          userId: user?._id || '',
          kycStatus: 'UNVERIFIED',
          documents: [],
        });
      }
    } catch (error) {
      toast.error('Failed to fetch KYC data', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (
    files: FileList,
    docType: 'BUSINESS_REGISTRATION' | 'NATIONAL_ID'
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/pdf', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', 'Only PDF, JPG, and PNG files are allowed');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File too large', 'Maximum file size is 10MB');
      return;
    }

    setUploadingDoc(docType);

    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreview(prev => ({
              ...prev,
              [docType]: e.target.result as string,
            }));
          }
        };
        reader.readAsDataURL(file);
      }

      // Here you would upload to the server
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add to KYC documents
      const newDoc: KYCDocument = {
        type: docType,
        fileName: file.name,
        fileUrl: 'https://example.com/uploaded-doc.pdf',
        uploadedAt: new Date().toISOString(),
        status: 'PENDING',
      };

      setKycData(prev => {
        if (!prev) return prev;
        const existingDocIndex = prev.documents.findIndex(d => d.type === docType);
        const updatedDocs = [...prev.documents];
        if (existingDocIndex >= 0) {
          updatedDocs[existingDocIndex] = newDoc;
        } else {
          updatedDocs.push(newDoc);
        }
        return { ...prev, documents: updatedDocs };
      });

      toast.success('Document uploaded', `${docType.replace('_', ' ')} has been uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed', 'Please try again');
      console.error(error);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, docType: 'BUSINESS_REGISTRATION' | 'NATIONAL_ID') => {
    e.preventDefault();
    setIsDragging(docType);
  };

  const handleDragLeave = () => {
    setIsDragging(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    docType: 'BUSINESS_REGISTRATION' | 'NATIONAL_ID'
  ) => {
    e.preventDefault();
    setIsDragging(null);
    if (e.dataTransfer.files) {
      handleDocumentUpload(e.dataTransfer.files, docType);
    }
  };

  const handleApproveDocument = async () => {
    if (!selectedDocToApprove || (approvalDecision === 'REJECTED' && !rejectionReason.trim())) {
      toast.error('Missing information', 'Please provide rejection reason if rejecting');
      return;
    }

    try {
      setLoading(true);
      // Call API to approve/reject document
      // await approveKYCDocument(selectedDocToApprove._id, { status: approvalDecision, rejectionReason });
      
      toast.success(
        `Document ${approvalDecision.toLowerCase()}`,
        `The document has been ${approvalDecision.toLowerCase()}`
      );

      // Update the review
      setSelectedReview(null);
      setShowApprovalModal(false);
      setApprovalDecision('APPROVED');
      setRejectionReason('');
      setSelectedDocToApprove(null);
    } catch (error) {
      toast.error('Failed to process document', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusConfig = (status: string) => {
    switch (status) {
      case 'UNVERIFIED':
        return {
          color: 'bg-red-100 text-red-900',
          bgGlass: 'bg-red-50/30 backdrop-blur-xl border-red-200/30',
          icon: AlertCircle,
          label: 'Unverified',
          description: 'Your KYC verification is incomplete. Please upload required documents.',
        };
      case 'PENDING_REVIEW':
        return {
          color: 'bg-yellow-100 text-yellow-900',
          bgGlass: 'bg-yellow-50/30 backdrop-blur-xl border-yellow-200/30',
          icon: Clock,
          label: 'Pending Review',
          description: 'Your documents are under review. This typically takes 24-48 hours.',
        };
      case 'VERIFIED':
        return {
          color: 'bg-green-100 text-green-900',
          bgGlass: 'bg-green-50/30 backdrop-blur-xl border-green-200/30',
          icon: Check,
          label: 'Verified',
          description: 'Your KYC verification is complete. You can now trade freely.',
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-900',
          bgGlass: 'bg-red-50/30 backdrop-blur-xl border-red-200/30',
          icon: AlertTriangle,
          label: 'Rejected',
          description: 'Your KYC verification was rejected. Please resubmit with correct documents.',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-900',
          bgGlass: 'bg-gray-50/30 backdrop-blur-xl border-gray-200/30',
          icon: AlertCircle,
          label: 'Unknown',
          description: 'KYC status unknown',
        };
    }
  };

  if (isAdmin) {
    return <AdminKYCDashboard pendingReviews={pendingReviews} />;
  }

  if (!kycData) {
    return (
      <div className="settings-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const statusConfig = getKYCStatusConfig(kycData.kycStatus);
  const StatusIcon = statusConfig.icon;

  const businessRegDoc = kycData.documents.find(d => d.type === 'BUSINESS_REGISTRATION');
  const nationalIdDoc = kycData.documents.find(d => d.type === 'NATIONAL_ID');

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings & KYC Verification</h1>
        <p className="settings-subtitle">Manage your account and complete KYC verification to unlock all features</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`settings-tab ${activeTab === 'kyc' ? 'active' : ''}`}
        >
          <Shield className="w-4 h-4" />
          KYC Verification
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
        >
          <Lock className="w-4 h-4" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
      </div>

      {/* KYC Section */}
      {activeTab === 'kyc' && (
        <div className="kyc-section">
          {/* Status Banner */}
          <div className={`kyc-status-banner ${statusConfig.bgGlass}`}>
            <div className="banner-content">
              <div className="banner-icon">
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="banner-text">
                <h2 className="banner-title">{statusConfig.label}</h2>
                <p className="banner-description">{statusConfig.description}</p>
              </div>
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Documents Section */}
          <div className="documents-section">
            <h3 className="section-title">Required Documents</h3>
            <p className="section-description">
              Please upload clear photos or scans of your identity documents. Documents should be valid and not expired.
            </p>

            <div className="documents-grid">
              {/* Business Registration */}
              <Card className="document-card">
                <CardHeader>
                  <CardTitle className="document-card-title">
                    Business Registration Certificate
                  </CardTitle>
                </CardHeader>
                <div className="document-card-body">
                  {businessRegDoc ? (
                    <div className="document-uploaded">
                      <div className="document-status-icon approved">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <p className="document-file-name">{businessRegDoc.fileName}</p>
                      <p className="document-uploaded-date">
                        Uploaded {new Date(businessRegDoc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="document-status">
                        <Badge className={
                          businessRegDoc.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : businessRegDoc.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {businessRegDoc.status}
                        </Badge>
                      </div>
                      <div className="document-actions">
                        <button
                          onClick={() => {
                            setSelectedImageToView(businessRegDoc.fileUrl);
                            setImageModalOpen(true);
                          }}
                          className="doc-action-btn"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => window.open(businessRegDoc.fileUrl, '_blank')}
                          className="doc-action-btn"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-zone ${isDragging === 'BUSINESS_REGISTRATION' ? 'drag-active' : ''}`}
                      onDragOver={(e) => handleDragOver(e, 'BUSINESS_REGISTRATION')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'BUSINESS_REGISTRATION')}
                    >
                      <input
                        type="file"
                        id="business-reg-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files, 'BUSINESS_REGISTRATION')}
                        className="hidden"
                      />
                      <label htmlFor="business-reg-upload" className="upload-label">
                        <Upload className="w-8 h-8" />
                        <p className="upload-text">
                          <span className="font-semibold">Drag and drop your document</span> or click to browse
                        </p>
                        <p className="upload-hint">PDF, JPG, PNG up to 10MB</p>
                      </label>
                    </div>
                  )}
                </div>
              </Card>

              {/* National ID / Passport */}
              <Card className="document-card">
                <CardHeader>
                  <CardTitle className="document-card-title">
                    National ID or Passport
                  </CardTitle>
                </CardHeader>
                <div className="document-card-body">
                  {nationalIdDoc ? (
                    <div className="document-uploaded">
                      <div className="document-status-icon approved">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <p className="document-file-name">{nationalIdDoc.fileName}</p>
                      <p className="document-uploaded-date">
                        Uploaded {new Date(nationalIdDoc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="document-status">
                        <Badge className={
                          nationalIdDoc.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : nationalIdDoc.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {nationalIdDoc.status}
                        </Badge>
                      </div>
                      <div className="document-actions">
                        <button
                          onClick={() => {
                            setSelectedImageToView(nationalIdDoc.fileUrl);
                            setImageModalOpen(true);
                          }}
                          className="doc-action-btn"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => window.open(nationalIdDoc.fileUrl, '_blank')}
                          className="doc-action-btn"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-zone ${isDragging === 'NATIONAL_ID' ? 'drag-active' : ''}`}
                      onDragOver={(e) => handleDragOver(e, 'NATIONAL_ID')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'NATIONAL_ID')}
                    >
                      <input
                        type="file"
                        id="national-id-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleDocumentUpload(e.target.files, 'NATIONAL_ID')}
                        className="hidden"
                      />
                      <label htmlFor="national-id-upload" className="upload-label">
                        <Upload className="w-8 h-8" />
                        <p className="upload-text">
                          <span className="font-semibold">Drag and drop your document</span> or click to browse
                        </p>
                        <p className="upload-hint">PDF, JPG, PNG up to 10MB</p>
                      </label>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Submit Button */}
            {kycData.documents.length > 0 && kycData.kycStatus === 'UNVERIFIED' && (
              <div className="submit-section">
                <Button
                  onClick={() => toast.success('Documents submitted', 'Your KYC documents have been submitted for review')}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white w-full py-3 text-lg font-semibold"
                  disabled={loading || kycData.documents.length === 0}
                >
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageModalOpen && selectedImageToView && (
        <div className="modal-overlay" onClick={() => setImageModalOpen(false)}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setImageModalOpen(false)}
              className="image-viewer-close"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImageToView} alt="Document" className="image-viewer-img" />
          </div>
        </div>
      )}
    </div>
  );
};

// Admin KYC Dashboard Component
const AdminKYCDashboard: React.FC<{ pendingReviews: PendingKYCReview[] }> = ({ pendingReviews }) => {
  const [selectedReview, setSelectedReview] = useState<PendingKYCReview | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDocToApprove, setSelectedDocToApprove] = useState<KYCDocument | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApproveDocument = async () => {
    if (!selectedDocToApprove || (approvalDecision === 'REJECTED' && !rejectionReason.trim())) {
      toast.error('Missing information', 'Please provide rejection reason if rejecting');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(
        `Document ${approvalDecision.toLowerCase()}`,
        `The document has been ${approvalDecision.toLowerCase()}`
      );
      setShowApprovalModal(false);
      setApprovalDecision('APPROVED');
      setRejectionReason('');
      setSelectedDocToApprove(null);
    } catch (error) {
      toast.error('Failed to process document', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      {/* Admin Header */}
      <div className="settings-header">
        <h1 className="settings-title">KYC Approval Dashboard</h1>
        <p className="settings-subtitle">Review and approve pending KYC submissions</p>
      </div>

      {/* Dashboard Content */}
      <div className="admin-dashboard">
        <div className="admin-grid">
          {/* Pending List */}
          <div className="pending-list-section">
            <Card className="pending-list-card">
              <CardHeader>
                <CardTitle>Pending Reviews ({pendingReviews.length})</CardTitle>
              </CardHeader>
              <div className="pending-list">
                {pendingReviews.length === 0 ? (
                  <div className="empty-state">
                    <Check className="w-12 h-12" />
                    <p>All KYC submissions have been reviewed</p>
                  </div>
                ) : (
                  pendingReviews.map(review => (
                    <div
                      key={review.userId}
                      className={`pending-item ${selectedReview?.userId === review.userId ? 'selected' : ''}`}
                      onClick={() => setSelectedReview(review)}
                    >
                      <div className="pending-item-header">
                        <h3 className="pending-item-name">{review.userName}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                      </div>
                      <p className="pending-item-email">{review.userEmail}</p>
                      <p className="pending-item-date">
                        Submitted {new Date(review.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Review Details */}
          {selectedReview && (
            <div className="review-details-section">
              <Card className="review-details-card">
                <CardHeader>
                  <CardTitle>Review Details: {selectedReview.userName}</CardTitle>
                </CardHeader>
                <div className="review-details-body">
                  <div className="review-user-info">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedReview.userName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedReview.userEmail}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Submitted:</span>
                      <span className="info-value">
                        {new Date(selectedReview.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Documents to Review */}
                  <div className="documents-to-review">
                    <h4 className="review-subtitle">Documents Submitted</h4>
                    <div className="review-documents-list">
                      {selectedReview.documents.map((doc, idx) => (
                        <div key={idx} className="review-document-item">
                          <div className="review-doc-header">
                            <span className="review-doc-type">
                              {doc.type.replace(/_/g, ' ')}
                            </span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {doc.status}
                            </Badge>
                          </div>
                          <p className="review-doc-filename">{doc.fileName}</p>
                          <div className="review-doc-actions">
                            <button
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                              className="review-action-btn preview"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocToApprove(doc);
                                setShowApprovalModal(true);
                              }}
                              className="review-action-btn approve"
                            >
                              <Check className="w-4 h-4" />
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedDocToApprove && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <Card className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Review Document</h2>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="approval-doc-info">
                <p className="approval-doc-label">
                  {selectedDocToApprove.type.replace(/_/g, ' ')}
                </p>
                <p className="approval-doc-filename">{selectedDocToApprove.fileName}</p>
              </div>

              {/* Decision Options */}
              <div className="form-group">
                <label className="form-label">Decision</label>
                <div className="decision-options">
                  <label className="decision-option">
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={approvalDecision === 'APPROVED'}
                      onChange={(e) => setApprovalDecision(e.target.value as 'APPROVED')}
                    />
                    <span>Approve Document</span>
                  </label>
                  <label className="decision-option">
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={approvalDecision === 'REJECTED'}
                      onChange={(e) => setApprovalDecision(e.target.value as 'REJECTED')}
                    />
                    <span>Reject Document</span>
                  </label>
                </div>
              </div>

              {/* Rejection Reason */}
              {approvalDecision === 'REJECTED' && (
                <div className="form-group">
                  <label className="form-label">Reason for Rejection *</label>
                  <Textarea
                    placeholder="Please explain why this document is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="form-input"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveDocument}
                disabled={loading}
                className={`flex-1 ${
                  approvalDecision === 'APPROVED'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                } text-white`}
              >
                {loading ? 'Processing...' : `Confirm ${approvalDecision}`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
