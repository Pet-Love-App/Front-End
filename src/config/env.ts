/**
 * 环境配置
 * 使用 Expo 的环境变量系统
 */

// 从环境变量获取 API 地址，如果没有则使用默认值
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (__DEV__ ? 'http://82.157.255.92:8000' : 'https://your-production-api.com');

export const ENV = {
  // API 配置
  API_BASE_URL,
  API_TIMEOUT: 30000, // 30秒超时

  // 调试配置
  DEBUG: __DEV__,
  LOG_API_CALLS: __DEV__,

  // 功能开关
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
};

export default ENV;
