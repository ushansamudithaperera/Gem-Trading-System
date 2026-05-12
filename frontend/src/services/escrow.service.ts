import api from './api';

export const releaseEscrow = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/escrow/release`);
  return response.data;
};

export const refundEscrow = async (orderId: string, reason: string) => {
  const response = await api.post(`/orders/${orderId}/escrow/refund`, { reason });
  return response.data;
};

export const getEscrowStatus = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}/escrow`);
  return response.data;
};
