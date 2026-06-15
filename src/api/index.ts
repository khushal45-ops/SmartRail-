import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

let memoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
};

api.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       setAuthToken(null);
       // Dispatch custom event for App to handle logout
       window.dispatchEvent(new Event('auth:unauthorized'));
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
    const response = await api.post('/api/chat', { message });
    return { reply: response.data.response };
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
