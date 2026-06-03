import api from './api';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
      avatar?: string;
    };
    token: string;
  };
  message: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse['data']> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  const { token, user } = response.data.data;
  sessionStorage.setItem('token', token);
  return { token, user };
};

export const login = async (data: LoginData): Promise<AuthResponse['data']> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  const { token, user } = response.data.data;
  sessionStorage.setItem('token', token);
  return { token, user };
};

export const logout = (): void => {
  sessionStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const updateUserProfile = async (data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  businessName?: string;
}) => {
  const response = await api.put('/users/profile', data);
  return response.data.data;
};

export const submitKYCDocuments = async (documentUrls: string[]) => {
  const response = await api.put('/users/kyc/submit', { documentUrls });
  return response.data.data;
};