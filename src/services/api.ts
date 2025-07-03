import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const venueAPI = {
  create: (data: any) => api.post('/venues', data),
  getAll: () => api.get('/venues'),
  getById: (id: string) => api.get(`/venues/${id}`),
  update: (id: string, data: any) => api.put(`/venues/${id}`, data),
  getAnalytics: (id: string) => api.get(`/venues/${id}/analytics`),
};

export const musicAPI = {
  search: (query: string) => api.get(`/music/search?q=${query}`),
  getTrack: (id: string) => api.get(`/music/tracks/${id}`),
  createPlaylist: (data: any) => api.post('/music/playlists', data),
  getPlaylists: () => api.get('/music/playlists'),
  updatePlaylist: (id: string, data: any) => api.put(`/music/playlists/${id}`, data),
};

export const paymentAPI = {
  createSubscription: (priceId: string) => api.post('/payments/create-subscription', { priceId }),
};

export const commercialAPI = {
  upload: (formData: FormData) => api.post('/commercials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/commercials'),
  update: (id: string, data: any) => api.put(`/commercials/${id}`, data),
  delete: (id: string) => api.delete(`/commercials/${id}`),
};

export default api;