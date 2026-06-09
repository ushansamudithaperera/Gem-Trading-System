import api from './api';

export interface OpenDisputePayload {
  orderId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
  evidenceImages?: string[];
}

export interface ResolveDisputePayload {
  decision: string;
  resolutionAction: 'REFUND_BUYER' | 'PAY_SELLER';
}

export const openDispute = async (data: OpenDisputePayload) => {
  const response = await api.post('/disputes', data);
  return response.data;
};

export const resolveDispute = async (disputeId: string, data: ResolveDisputePayload) => {
  const response = await api.patch(`/disputes/${disputeId}/resolve`, data);
  return response.data;
};

export const getAdminDisputes = async () => {
  const response = await api.get('/disputes/all');
  return response.data;
};

export const getMyDisputes = async () => {
  const response = await api.get('/disputes/my-disputes');
  return response.data;
};
