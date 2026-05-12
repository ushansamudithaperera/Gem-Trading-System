import api from './api';

export interface HireCutterData {
  orderId: string;
  cutterId: string;
  instructions: string;
  expectedFinishDate: string;
  cutterFee: number;
}

export const hireCutter = async (data: HireCutterData) => {
  const response = await api.post('/cutting/hire', data);
  return response.data.data;
};

export const getCutterJobs = async () => {
  const response = await api.get('/cutting/my-jobs');
  return response.data.data;
};

export const getBuyerCuttingJobs = async () => {
  const response = await api.get('/cutting/buyer-jobs');
  return response.data.data;
};

export const getCuttingJob = async (jobId: string) => {
  const response = await api.get(`/cutting/jobs/${jobId}`);
  return response.data.data;
};

export const updateCuttingProgress = async (jobId: string, data: { progressImages?: File[]; status?: string }) => {
  const formData = new FormData();
  if (data.progressImages) {
    data.progressImages.forEach(img => formData.append('images', img));
  }
  if (data.status) formData.append('status', data.status);
  const response = await api.put(`/cutting/jobs/${jobId}/progress`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getAvailableCutters = async () => {
  const response = await api.get('/cutting/available-cutters');
  return response.data.data;
};

export const getCutterDetails = async (cutterId: string) => {
  const response = await api.get(`/cutting/cutters/${cutterId}`);
  return response.data.data;
};