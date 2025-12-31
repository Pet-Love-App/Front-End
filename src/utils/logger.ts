/**
 * 统一的日志工具
 *
 * 功能特性:
 * - 开发环境记录所有日志
 * - 生产环境只记录错误
 * - 支持结构化日志
 * - 自动添加时间戳
 * - 可扩展到第三方日志服务 (Sentry, LogRocket 等)
 *
 * @example
 * ```typescript
 * import { logger } from '@/src/utils/logger';
 *
 * // 调试信息 (仅开发环境)
 * logger.debug('Debug message', { userId: 123 });
 *
 * // 普通信息 (仅开发环境)
 * logger.info('User logged in', { username: 'john' });
 *
 * // 警告信息 (仅开发环境)
 * logger.warn('Deprecated API used', { api: '/old-endpoint' });
 *
 * // 错误信息 (开发+生产环境)
 * logger.error('Failed to load data', error, { context: 'UserProfile' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

/**
 * Logger 类
 * 提供统一的日志记录接口
 */
class Logger {
  private isDev = __DEV__;

  /**
   * 格式化日志前缀
   */
  private formatPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getEmoji(level);
    return `${emoji} [${timestamp}] [${level.toUpperCase()}]`;
  }

  /**
   * 根据日志级别获取 emoji
   */
  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '🐛';
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  /**
   * 格式化上下文信息
   */
  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return '';
    }
    try {
      return JSON.stringify(context, null, 2);
    } catch {
      return String(context);
    }
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    const prefix = this.formatPrefix(level);
    const contextStr = this.formatContext(context);

    // 根据级别决定是否输出
    const shouldLog = level === 'error' || this.isDev;

    if (!shouldLog) return;

    // 构建日志参数
    const args: any[] = [prefix, message];
    if (context) args.push('\n', contextStr);
    if (error) args.push('\n', error);

    // 输出日志
    switch (level) {
      case 'debug':
      case 'info':
        console.log(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        // if (!this.isDev) {
        //   Sentry.captureException(error || new Error(message), {
        //     level: 'error',
        //     extra: context
        //   });
        // }
        break;
    }
  }

  /**
   * 调试日志 (仅开发环境)
   * @param message 日志消息
   * @param context 额外的上下文信息
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  /**
   * 信息日志 (仅开发环境)
   * @param message 日志消息
   * @param context 额外的上下文信息
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  /**
   * 警告日志 (仅开发环境)
   * @param message 日志消息
   * @param context 额外的上下文信息
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  /**
   * 错误日志 (开发+生产环境)
   * @param message 日志消息
   * @param error 错误对象 (可选)
   * @param context 额外的上下文信息
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }

  /**
   * 性能日志 - 记录函数执行时间
   * @param label 标签
   * @param fn 要执行的函数
   * @returns 函数执行结果
   */
  async performance<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isDev) {
      return fn();
    }

    const startTime = Date.now();
    this.debug(`⏱️ 开始: ${label}`);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.debug(`✅ 完成: ${label}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`❌ 失败: ${label}`, error as Error, { duration: `${duration}ms` });
      throw error;
    }
  }

  /**
   * 分组日志 (仅开发环境)
   * @param label 分组标签
   * @param fn 要执行的函数
   */
  group(label: string, fn: () => void) {
    if (!this.isDev) return;

    console.group(`📦 ${label}`);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }
}

/**
 * 全局 logger 实例
 */
export const logger = new Logger();

/**
 * 默认导出
 */
export default logger;
