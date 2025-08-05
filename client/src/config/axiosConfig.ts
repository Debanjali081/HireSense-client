import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://hiresense-server.onrender.com',
  withCredentials: true, // Crucial for sending cookies
});

// Add response interceptor to handle 401s
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login'; // Force full page reload
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;