import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  post: (url, data) => api.post(`/auth${url}`, data),
  get: (url) => api.get(`/auth${url}`),
  put: (url, data) => api.put(`/auth${url}`, data),
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      // Intentionally hard reloading to clear out memory state on disconnect
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Products
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Entries
export const getEntries = (date) =>
  api.get('/entries', { params: date ? { date } : {} });
export const createEntry = (data) => api.post('/entries', data);
export const updateEntry = (id, data) => api.put(`/entries/${id}`, data);
export const deleteEntry = (id) => api.delete(`/entries/${id}`);
export const updateBillStatus = (billId, status) =>
  api.put(`/entries/bill/${billId}/status`, { status });
