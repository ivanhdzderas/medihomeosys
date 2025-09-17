// src/axiosConfig.js
import axios from 'axios';
import config from './confi';

// ⚠️ COMENTA ESTA LÍNEA PARA DESARROLLO (ES EL PROBLEMA)
// axios.defaults.baseURL = config.API_BASE_URL;

axios.defaults.withCredentials = true;

// Interceptor para requests
axios.interceptors.request.use(
  (config) => {
    console.log('🌐 Enviando request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta:', error.response?.status);
    return Promise.reject(error);
  }
);

export default axios;