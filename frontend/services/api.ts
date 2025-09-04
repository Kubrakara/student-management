import axios from 'axios';
import { store } from '@/lib/store';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Öğrenci profil yönetimi API fonksiyonları
export const studentProfileAPI = {
  // Kendi profilini getir
  getOwnProfile: async () => {
    const response = await api.get('/students/profile/me');
    return response.data;
  },

  // Kendi profilini güncelle
  updateOwnProfile: async (profileData: {
    firstName: string;
    lastName: string;
    birthDate: string;
  }) => {
    const response = await api.put('/students/profile/me', profileData);
    return response.data;
  },

  // Kendi kayıtlarını getir
  getOwnEnrollments: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/students/enrollments/me', { params });
    return response.data as {
      enrollments: Array<{ _id: string; course: { _id: string; name: string }; student: { _id: string; firstName: string; lastName: string }; createdAt: string }>;
      totalCount: number;
      page: number;
      totalPages: number;
    };
  }
};

export default api;