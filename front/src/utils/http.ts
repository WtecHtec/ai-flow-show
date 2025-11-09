import axios from 'axios';
import { getToken, removeToken } from './auth';

const http = axios.create({
  baseURL: (window as any).__API_BASE__ || 'http://localhost:3000',
  timeout: 15000,
  withCredentials: false,
});

// 请求拦截：添加 token
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截：处理错误和 token 过期
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      removeToken();
      window.location.href = '/#/login';
    }
    return Promise.reject(err);
  }
);

export default http;