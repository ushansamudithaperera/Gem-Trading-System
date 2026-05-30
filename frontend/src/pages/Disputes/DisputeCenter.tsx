import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import * as disputeService from '../../services/dispute.service';
import {
  X,
  Plus,
  Upload,
  Check,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import '../DisputeCenter.css';

// Type definitions
interface Dispute {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    buyerId?: { firstName: string; lastName: string };
    sellerId?: { firstName: string; lastName: string };
    gemId?: { title: string };
  };
  raisedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  description: string;
  evidenceImages: string[];
  status: string;
  adminResolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const DISPUTE_REASONS = [
  { value: 'NOT_RECEIVED', label: 'Item Not Received' },
  { value: 'ITEM_MISMATCH', label: 'Item Mismatch' },
  { value: 'DAMAGED', label: 'Item Damaged' },
  { value: 'CUTTING_QUALITY', label: 'Cutting Quality Issue' },
  { value: 'OTHER', label: 'Other' },
];

const DISPUTE_STATUS_CONFIG = {
  OPEN: { color: 'bg-amber-100 text-amber-800', label: 'Open', icon: AlertCircle },
  UNDER_REVIEW: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Clock },
  RESOLVED_BUYER: { color: 'bg-green-100 text-green-800', label: 'Resolved - Buyer', icon: CheckCircle },
  RESOLVED_SELLER: { color: 'bg-purple-100 text-purple-800', label: 'Resolved - Seller', icon: CheckCircle },
  CLOSED: { color: 'bg-gray-100 text-gray-800', label: 'Closed', icon: XCircle },
};

export const DisputeCenter: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageToView, setSelectedImageToView] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDisputeToResolve, setSelectedDisputeToResolve] = useState<Dispute | null>(null);
  const [resolveDecision, setResolveDecision] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [formData, setFormData] = useState({
    orderId: '',
    reason: '',
    description: '',
  });

  // Fetch disputes
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await disputeService.getDisputes();
      const disputesList = Array.isArray(data) ? data : data.data || [];

      // Filter based on user role
      if (!isAdmin && user) {
        const filtered = disputesList.filter(
          (d: Dispute) => d.raisedBy._id === user._id
        );
        setDisputes(filtered);
      } else {
        setDisputes(disputesList);
      }
    } catch (error) {
      toast.error('Failed to fetch disputes', 'Could not load dispute data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file', `${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', `${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > 5) {
      toast.error('Too many files', 'Maximum 5 images allowed');
      return;
    }

    setSelectedImages([...selectedImages, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target as FileReader)?.result;
        if (result) {
          setImagePreview(prev => [...prev, result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  // Submit dispute
  const handleSubmitDispute = async () => {
    if (!formData.orderId || !formData.reason || !formData.description) {
      toast.error('Missing fields', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload: disputeService.OpenDisputePayload = {
        orderId: formData.orderId,
        reason: formData.reason,
        description: formData.description,
        evidenceImages: imagePreview,
      };

      await disputeService.openDispute(payload);
      toast.success('Dispute raised', 'Your dispute has been submitted for review');
      
      // Reset form
      setFormData({ orderId: '', reason: '', description: '' });
      setSelectedImages([]);
      setImagePreview([]);
      setShowModal(false);
      
      // Refresh disputes
      await fetchDisputes();
    } catch (error) {
      toast.error('Failed to submit dispute', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Resolve dispute (Admin only)
  const handleResolveDispute = async () => {
    if (!selectedDisputeToResolve || !resolutionNotes.trim()) {
      toast.error('Missing fields', 'Please provide resolution notes');
      return;
    }

    try {
      setLoading(true);
      const payload: disputeService.ResolveDisputePayload = {
        resolution: resolutionNotes,
        decision: resolveDecision,
      };

      await disputeService.resolveDispute(selectedDisputeToResolve._id, payload);
      toast.success('Dispute resolved', 'Resolution has been recorded');
      
      setResolveModalOpen(false);
      setSelectedDisputeToResolve(null);
      setResolutionNotes('');
      setResolveDecision('BUYER');
      
      // Refresh disputes
      await fetchDisputes();
    } catch (error) {
      toast.error('Failed to resolve dispute', 'Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return DISPUTE_STATUS_CONFIG[status as keyof typeof DISPUTE_STATUS_CONFIG] || 
           { color: 'bg-gray-100 text-gray-800', label: status, icon: AlertCircle };
  };

  const getReasonLabel = (reason: string) => {
    return DISPUTE_REASONS.find(r => r.value === reason)?.label || reason;
  };

  return (
    <div className="dispute-center-container">
      {/* Header */}
      <div className="dispute-header">
        <div>
          <h1 className="dispute-title">Dispute Center</h1>
          <p className="dispute-subtitle">
            {isAdmin 
              ? 'Manage all disputes across the platform' 
              : 'Manage your disputes and raise new ones'}
          </p>
        </div>
        {!isAdmin && (
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Raise New Dispute
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="dispute-content">
        {loading && !disputes.length ? (
          <div className="dispute-loading">
            <div className="spinner"></div>
            <p>Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="dispute-empty">
            <AlertCircle className="w-12 h-12" />
            <p>No disputes found</p>
            {!isAdmin && <p className="text-sm">Your disputes will appear here</p>}
          </div>
        ) : (
          <div className="disputes-grid">
            {disputes.map(dispute => {
              const statusConfig = getStatusConfig(dispute.status);
              const StatusIcon = statusConfig.icon;
              const isOpen = ['OPEN', 'UNDER_REVIEW'].includes(dispute.status);

              return (
                <Card key={dispute._id} className="dispute-card">
                  <CardHeader>
                    <div className="dispute-card-header">
                      <div className="dispute-card-title-section">
                        <CardTitle className="dispute-card-title">
                          Order #{dispute.orderId.orderNumber}
                        </CardTitle>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="dispute-card-meta">
                        <span className="dispute-meta-label">Reason:</span>
                        <span className="dispute-meta-value">{getReasonLabel(dispute.reason)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Dispute Details */}
                  <div className="dispute-card-body">
                    <div className="dispute-detail-row">
                      <span className="dispute-label">Raised By:</span>
                      <span className="dispute-value">
                        {dispute.raisedBy.firstName} {dispute.raisedBy.lastName}
                      </span>
                    </div>

                    <div className="dispute-detail-row">
                      <span className="dispute-label">Date:</span>
                      <span className="dispute-value">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {dispute.orderId.gemId && (
                      <div className="dispute-detail-row">
                        <span className="dispute-label">Gem:</span>
                        <span className="dispute-value">{dispute.orderId.gemId.title}</span>
                      </div>
                    )}

                    <div className="dispute-description">
                      <span className="dispute-label">Description:</span>
                      <p className="dispute-description-text">{dispute.description}</p>
                    </div>

                    {/* Evidence Images */}
                    {dispute.evidenceImages && dispute.evidenceImages.length > 0 && (
                      <div className="dispute-evidence">
                        <span className="dispute-label">Evidence ({dispute.evidenceImages.length}):</span>
                        <div className="evidence-thumbnails">
                          {dispute.evidenceImages.map((img, idx) => (
                            <button
                              key={idx}
                              className="evidence-thumbnail"
                              onClick={() => {
                                setSelectedImageToView(img);
                                setImageModalOpen(true);
                              }}
                            >
                              <img src={img} alt={`Evidence ${idx + 1}`} />
                              <div className="thumbnail-overlay">
                                <Eye className="w-5 h-5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {dispute.adminResolution && (
                      <div className="dispute-resolution">
                        <span className="dispute-label">Admin Resolution:</span>
                        <p className="resolution-text">{dispute.adminResolution}</p>
                        {dispute.resolvedAt && (
                          <span className="resolution-date">
                            Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && isOpen && (
                    <div className="dispute-card-footer">
                      <Button
                        onClick={() => {
                          setSelectedDisputeToResolve(dispute);
                          setResolveDecision('BUYER');
                          setResolveModalOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Raise Dispute Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <Card className="modal-content dispute-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Raise a New Dispute</h2>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {/* Order ID */}
              <div className="form-group">
                <label className="form-label">Order ID *</label>
                <Input
                  placeholder="Enter order ID"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason for Dispute *</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="form-input form-select"
                >
                  <option value="">Select a reason</option>
                  {DISPUTE_REASONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <Textarea
                  placeholder="Provide detailed information about the dispute"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="form-input"
                />
              </div>

              {/* Evidence Upload */}
              <div className="form-group">
                <label className="form-label">Evidence Images (up to 5)</label>
                
                <div
                  className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="evidence-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="evidence-upload" className="upload-label">
                    <Upload className="w-8 h-8" />
                    <p className="upload-text">
                      <span className="font-semibold">Drag and drop images here</span> or click to browse
                    </p>
                    <p className="upload-hint">PNG, JPG, GIF up to 5MB each</p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="image-preview-grid">
                    {imagePreview.map((preview, idx) => (
                      <div key={idx} className="image-preview-item">
                        <img src={preview} alt={`Preview ${idx + 1}`} />
                        <button
                          onClick={() => removeImage(idx)}
                          className="remove-image-btn"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDispute}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Admin Resolution Modal */}
      {resolveModalOpen && selectedDisputeToResolve && (
        <div className="modal-overlay" onClick={() => setResolveModalOpen(false)}>
          <Card className="modal-content resolve-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Resolve Dispute</h2>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="resolve-info">
                <p><strong>Order:</strong> #{selectedDisputeToResolve.orderId.orderNumber}</p>
                <p><strong>Reason:</strong> {getReasonLabel(selectedDisputeToResolve.reason)}</p>
              </div>

              {/* Decision */}
              <div className="form-group">
                <label className="form-label">Resolution Decision *</label>
                <div className="decision-options">
                  <label className="decision-option">
                    <input
                      type="radio"
                      name="decision"
                      value="BUYER"
                      checked={resolveDecision === 'BUYER'}
                      onChange={(e) => setResolveDecision(e.target.value as 'BUYER')}
                    />
                    <span>Resolve in Favor of Buyer</span>
                  </label>
                  <label className="decision-option">
                    <input
                      type="radio"
                      name="decision"
                      value="SELLER"
                      checked={resolveDecision === 'SELLER'}
                      onChange={(e) => setResolveDecision(e.target.value as 'SELLER')}
                    />
                    <span>Resolve in Favor of Seller</span>
                  </label>
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="form-group">
                <label className="form-label">Resolution Notes *</label>
                <Textarea
                  placeholder="Explain the resolution decision"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setResolveModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolveDispute}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {loading ? 'Resolving...' : 'Confirm Resolution'}
              </Button>
            </div>
          </Card>
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
            <img src={selectedImageToView} alt="Evidence" className="image-viewer-img" />
          </div>
        </div>
      )}
    </div>
  );
};
