import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { SENTRY_DSN } from '@/src/config/env';

/**
 * Sentry 配置模块
 * 用于错误追踪和性能监控
 */

// 判断是否为开发环境
const isDevelopment = __DEV__;

/**
 * 初始化 Sentry
 * 应在应用启动时尽早调用
 */
export function initSentry() {
  Sentry.init({
    // 从环境变量获取 DSN（在 .env 中配置 EXPO_PUBLIC_SENTRY_DSN）
    dsn: SENTRY_DSN,

    // 环境标识
    environment: isDevelopment ? 'development' : 'production',

    // 仅在生产环境启用
    enabled: !isDevelopment,

    // 发布版本，用于关联 source maps
    release: `${Constants.expoConfig?.name}@${Constants.expoConfig?.version}`,

    // 分发标识
    dist: Constants.expoConfig?.version,

    // 采样率配置
    tracesSampleRate: isDevelopment ? 1.0 : 0.2, // 开发环境 100%，生产环境 20%
    profilesSampleRate: isDevelopment ? 1.0 : 0.1, // 性能分析采样率

    // 会话重放采样率（可选）
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // 调试模式（关闭以抑制控制台错误输出）
    debug: false,

    // 集成配置
    integrations: [
      // 自动捕获导航相关事件
      Sentry.reactNavigationIntegration({
        enableTimeToInitialDisplay: true,
      }),
    ],

    // 在发送前过滤/修改事件
    beforeSend(event, hint) {
      // 开发环境不发送（也不打印，保持控制台干净）
      if (isDevelopment) {
        return null;
      }

      // 过滤敏感信息
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      return event;
    },

    // 面包屑过滤
    beforeBreadcrumb(breadcrumb) {
      // 过滤 console 类型的面包屑（可选）
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });
}

/**
 * 设置用户上下文
 * 用户登录后调用
 */
export function setSentryUser(user: { id: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
  });
}

/**
 * 清除用户上下文
 * 用户登出时调用
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * 设置额外上下文
 */
export function setSentryContext(key: string, context: Record<string, unknown>) {
  Sentry.setContext(key, context);
}

/**
 * 添加面包屑
 */
export function addSentryBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * 捕获异常的上下文选项
 */
export interface CaptureExceptionContext {
  /** 标签 - 用于分类和搜索 */
  tags?: Record<string, string>;
  /** 额外数据 - 详细的调试信息 */
  extra?: Record<string, unknown>;
  /** 严重级别 */
  level?: Sentry.SeverityLevel;
}

/**
 * 手动捕获异常
 * @param error 错误对象
 * @param context 上下文信息（tags 用于分类，extra 用于详情）
 */
export function captureException(error: Error, context?: CaptureExceptionContext) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level,
  });
}

/**
 * 手动捕获消息
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * 包装组件以捕获渲染错误
 */
export const SentryErrorBoundary = Sentry.wrap;

// 导出 Sentry 原始模块以便高级使用
export { Sentry };
