import axios from 'axios';

const http = axios.create({
  baseURL: (window as any).__API_BASE__ || 'http://localhost:3000',
  timeout: 15000,
  withCredentials: false,
});

// 响应拦截：仅返回 data
http.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default http;