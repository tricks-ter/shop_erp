import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  register: async (shopData) => {
    const response = await api.post('/auth/register', shopData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

// Products service
export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },
  
  add: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Sales service
export const salesService = {
  record: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  
  getAll: async (params) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },
  
  getAnalytics: async (params) => {
    const response = await api.get('/sales/analytics/summary', { params });
    return response.data;
  },
  
  getTopProducts: async (limit = 10) => {
    const response = await api.get('/sales/analytics/top-products', { params: { limit } });
    return response.data;
  },
  
  getTrend: async (period = 'daily', days = 30) => {
    const response = await api.get('/sales/analytics/trend', { params: { period, days } });
    return response.data;
  }
};

// Customers service
export const customersService = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  add: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  getLedger: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/ledger`);
    return response.data;
  },
  
  recordPayment: async (customerId, paymentData) => {
    const response = await api.post(`/customers/${customerId}/payment`, paymentData);
    return response.data;
  },
  
  getOutstandingDues: async () => {
    const response = await api.get('/customers/dues/outstanding');
    return response.data;
  }
};

// Purchases service
export const purchasesService = {
  record: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },
  
  getAll: async (params) => {
    const response = await api.get('/purchases', { params });
    return response.data;
  }
};

export default api;
