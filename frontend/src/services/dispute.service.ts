import api from './api';

export interface OpenDisputePayload {
  orderId: string;
  reason: string;
  description: string;
  evidenceImages?: string[];
}

export interface ResolveDisputePayload {
  resolution: string;
  decision: 'BUYER' | 'SELLER';
}

export const openDispute = async (data: OpenDisputePayload) => {
  const response = await api.post('/disputes', data);
  return response.data;
};

export const resolveDispute = async (disputeId: string, data: ResolveDisputePayload) => {
  const response = await api.put(`/disputes/${disputeId}/resolve`, data);
  return response.data;
};

export const getDisputes = async () => {
  const response = await api.get('/disputes');
  return response.data;
};
