import api from './api';

export interface CreateOrderData {
  gemId: string;
  amount: number;
}

export const createOrder = async (data: CreateOrderData) => {
  const response = await api.post('/orders', data);
  return response.data.data;
};

export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data.data;
};

export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.put(`/orders/${orderId}/cancel`);
  return response.data.data;
};

export const confirmDelivery = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/confirm-delivery`);
  return response.data.data;
};