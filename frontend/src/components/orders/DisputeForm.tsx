import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { AlertTriangle, Upload, X } from 'lucide-react';

import { openDispute } from '../../services/dispute.service';
import { toast } from '../ui/Toast';

export type DisputeReason = 'NOT_RECEIVED' | 'ITEM_MISMATCH' | 'DAMAGED' | 'CUTTING_QUALITY' | 'OTHER';

interface DisputeFormProps {
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const reasonLabels: Record<DisputeReason, string> = {
  NOT_RECEIVED: 'Item not received',
  ITEM_MISMATCH: 'Item doesn\'t match description',
  DAMAGED: 'Item damaged',
  CUTTING_QUALITY: 'Poor cutting quality',
  OTHER: 'Other',
};

export const DisputeForm: React.FC<DisputeFormProps> = ({ orderId, orderNumber: _orderNumber, onSuccess, onCancel }) => {
  const [reason, setReason] = useState<DisputeReason>('OTHER');
  const [description, setDescription] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceImages(prev => [...prev, ...files]);
    // Create preview URLs
    const newUrls = files.map(f => URL.createObjectURL(f));
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Description required', 'Please provide details about the issue.');
      return;
    }

    setLoading(true);
    try {
      // In real app, upload images first to server and get URLs
      const uploadedUrls = await uploadImages(evidenceImages);
      await openDispute({
        orderId,
        reason,
        description,
        evidenceImages: uploadedUrls,
      });
      toast.success('Dispute opened', 'Escrow frozen. Admin will review within 48 hours.');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed', error.message || 'Could not open dispute');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    // Mock upload - in real app send to /api/v1/upload
    return files.map((_, idx) => `https://example.com/evidence-${Date.now()}-${idx}.jpg`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Open Dispute
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <strong>Important:</strong> Opening a dispute will immediately freeze the escrow.
            You will need to provide evidence. Admin will review and decide within 48 hours.
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason for dispute *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              {Object.entries(reasonLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Textarea
              rows={4}
              placeholder="Explain what went wrong, include order details, etc."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Evidence (Images)</label>
            <div className="flex items-center gap-2 flex-wrap">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20">
                  <img src={url} alt={`Evidence ${idx}`} className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="destructive" className="flex-1">
              {loading ? 'Opening...' : 'Open Dispute'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};