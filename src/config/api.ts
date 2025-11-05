// 根据环境选择 API 地址
const API_BASE_URL = __DEV__
  ? 'http://82.157.255.92' // 生产服务器地址
  : 'https://82.157.255.92';

export const API_ENDPOINTS = {
  // 认证相关（Djoser）
  REGISTER: `${API_BASE_URL}/api/auth/users/`,
  LOGIN: `${API_BASE_URL}/api/auth/jwt/create/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/jwt/refresh/`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/jwt/verify/`,
  SET_PASSWORD: `${API_BASE_URL}/api/auth/users/set_password/`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/users/reset_password/`,

  // 用户资料相关（自定义）
  USER_ME: '/api/user/me/', // 获取当前用户完整信息（含头像、宠物）
  USER_DETAIL: (userId: number) => `/api/user/${userId}/`, // 获取指定用户信息
  USER_AVATAR: '/api/user/avatar/', // 上传/删除头像

  // 宠物相关
  PETS: '/api/user/pets/', // 获取宠物列表、创建宠物
  PET_DETAIL: (petId: number) => `/api/user/pets/${petId}/`, // 获取/更新/删除宠物
  MY_PETS: '/api/user/pets/my_pets/', // 获取我的宠物列表
};

export default API_BASE_URL;
