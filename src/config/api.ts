// 根据环境选择 API 地址
const API_BASE_URL = __DEV__
  ? 'http://82.157.255.92:8000' // 您的服务器地址
  : 'https://127.0.0.1';

export const API_ENDPOINTS = {
  // 认证相关
  REGISTER: `${API_BASE_URL}/api/auth/users/`,
  LOGIN: `${API_BASE_URL}/api/auth/jwt/create/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/jwt/refresh/`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/jwt/verify/`,

  // 用户相关
  USER_ME: `${API_BASE_URL}/api/auth/users/me/`,
  USER_LIST: `${API_BASE_URL}/api/auth/users/`,
  SET_PASSWORD: `${API_BASE_URL}/api/auth/users/set_password/`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/users/reset_password/`,
};

export default API_BASE_URL;
