// src/utils/api.js
import axios from 'axios';

// Sử dụng URL của backend trên Render hoặc biến môi trường
const baseURL = process.env.REACT_APP_API_URL || 'https://taphoaanha-com.onrender.com';

// Tạo instance với baseURL
const api = axios.create({ baseURL });

// Thêm interceptor để xử lý token nếu cần
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;