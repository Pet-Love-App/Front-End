/**
 * 环境配置
 * 使用 Expo 的环境变量系统
 */

// 使用环境变量优先，其次默认服务器地址（如需本地调试请显式设置 EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000）
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://82.157.255.92';

// Sentry DSN（tsinghua-university-dp/react-native 项目）
export const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  'https://6628b98c87f10ff0df2e71641856fd14@o4510585188253696.ingest.us.sentry.io/4510585197756416';

export const ENV = {
  // API 配置
  API_BASE_URL,
  API_TIMEOUT: 30000, // 30秒超时

  // Sentry 配置
  SENTRY_DSN,

  // 调试配置
  DEBUG: __DEV__,
  LOG_API_CALLS: __DEV__,

  // 功能开关
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
};

export default ENV;

/**
 * 切换说明:
 * - 使用服务器: 不设置或设置 EXPO_PUBLIC_API_BASE_URL=http://82.157.255.92:8000
 * - 本地调试: 设置 EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 并确保后端监听 127.0.0.1:8000
 */
