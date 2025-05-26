import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API || 'https://teste2-icp3.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Adicione um log mais detalhado do erro
    console.error('Erro na requisição:', {
      config: error.config,
      response: error.response,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add error logging for development
if (process.env.NODE_ENV !== 'production') {
  API.interceptors.request.use(request => {
    console.log('Starting API Request:', request.url);
    return request;
  });

  API.interceptors.response.use(
    response => {
      console.log('API Response:', response.status);
      return response;
    },
    error => {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return Promise.reject(error);
    }
  );
}

export default API;
