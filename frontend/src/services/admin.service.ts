import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/users/admin/stats');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders/admin/all');
  return response.data;
};

export const getAdminDisputes = async () => {
  const response = await api.get('/disputes/admin/all');
  return response.data;
};
