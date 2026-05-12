import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Textarea } from '../../components/ui/Textarea';
import { getDisputes, resolveDispute } from '../../services/dispute.service';

import { toast } from '../../components/ui/Toast';

type Dispute = {
  _id: string;
  orderId: { orderNumber: string; amount: number };
  reason: string;
  description: string;
  evidenceImages: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'CLOSED';
  raisedBy: { firstName: string; lastName: string; email: string };
  createdAt: string;
  adminResolution?: string;
};

export const DisputeCenter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roles.includes('ADMIN');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [decision, setDecision] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const data = await getDisputes();
      setDisputes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string) => {
    if (!resolutionText.trim()) {
      toast.error('Resolution required', 'Please enter resolution details.');
      return;
    }
    setActionLoading(true);
    try {
      await resolveDispute(disputeId, { resolution: resolutionText, decision });
      toast.success('Dispute Resolved', `Decision made in favor of ${decision}.`);
      setSelectedDispute(null);
      setResolutionText('');
      await fetchDisputes();
    } catch (error: any) {
      toast.error('Resolution failed', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dispute Center</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disputes list */}
        <Card>
          <CardHeader>
            <CardTitle>All Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            {disputes.length === 0 ? (
              <p className="text-slate-500">No disputes found.</p>
            ) : (
              <div className="space-y-3">
                {disputes.map(dispute => (
                  <div
                    key={dispute._id}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedDispute?._id === dispute._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900">Order #{dispute.orderId.orderNumber.slice(-8)}</p>
                        <p className="text-sm text-slate-600">{dispute.reason}</p>
                      </div>
                      <Badge variant={dispute.status === 'OPEN' ? 'destructive' : 'secondary'}>
                        {dispute.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      by {dispute.raisedBy.firstName} {dispute.raisedBy.lastName} • {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispute details & resolution */}
        {selectedDispute && (
          <Card>
            <CardHeader>
              <CardTitle>Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-gray-700">{selectedDispute.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-gray-700">{selectedDispute.description}</p>
              </div>
              {selectedDispute.evidenceImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Evidence</p>
                  <div className="flex gap-2 mt-1">
                    {selectedDispute.evidenceImages.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                        Image {idx+1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && selectedDispute.status === 'OPEN' && (
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-semibold mb-2">Resolve Dispute</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="BUYER"
                          checked={decision === 'BUYER'}
                          onChange={() => setDecision('BUYER')}
                        />
                        In favor of Buyer
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="SELLER"
                          checked={decision === 'SELLER'}
                          onChange={() => setDecision('SELLER')}
                        />
                        In favor of Seller
                      </label>
                    </div>
                    <Textarea
                      placeholder="Resolution notes..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={() => handleResolve(selectedDispute._id)} disabled={actionLoading}>
                      {actionLoading ? 'Processing...' : 'Resolve Dispute'}
                    </Button>
                  </div>
                </div>
              )}

              {selectedDispute.adminResolution && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">Admin Resolution</p>
                  <p className="text-sm text-gray-700">{selectedDispute.adminResolution}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Decision: {selectedDispute.status === 'RESOLVED_BUYER' ? 'Buyer wins' : 'Seller wins'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};