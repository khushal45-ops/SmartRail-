import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
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
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials: any) => {
  try {
     // Simulate network latency
     await new Promise(resolve => setTimeout(resolve, 800));
     localStorage.setItem('token', 'mock-jwt-token');
     return { success: true, token: 'mock-jwt-token', user: { role: 'admin' } };
  } catch (err) {
     throw err;
  }
};

export const fetchPNR = async (pnrNumber: string) => {
  try {
    const response = await api.get(`/api/pnr/${pnrNumber}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const fetchTrainStatus = async (trainId: string) => {
  try {
    const response = await api.get(`/api/trains/${trainId}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const requestReallocation = async (pnr: string, options: any) => {
  try {
    // In a real app this hits the backend, here we simulate for now
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Reallocation successful" };
  } catch (err) {
    throw err;
  }
};

export const sendChatMessage = async (message: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { reply: "I'm your AI assistant. How can I help you further with SmartRail?" };
  } catch (err) {
    throw err;
  }
};

export const submitComplaint = async (data: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, complaintId: `CMP-${Math.floor(Math.random()*10000)}` };
  } catch (err) {
    throw err;
  }
};

export const updateTrainStatus = async (id: string, data: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const sendAlert = async (data: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const generateReport = async (type: string, dateRange: any) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return new Blob(["Mock report data..."], { type: "text/csv" });
  } catch (err) {
    throw err;
  }
};

export default api;
