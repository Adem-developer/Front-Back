import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL de votre backend
});

// Intercepteur pour ajouter le token d'authentification si nécessaire
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 