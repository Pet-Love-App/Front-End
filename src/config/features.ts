/**
 * 功能开关配置
 * 用于控制是否启用新功能
 */

import { isSupabaseConfigured } from '@/src/lib/supabase';

/**
 * 功能开关
 */
export const FEATURES = {
  /**
   * 使用Supabase直连替代Django API
   *
   * 环境变量控制：EXPO_PUBLIC_USE_SUPABASE=true
   * 优先级：环境变量 > 自动检测（是否配置了Supabase）
   */
  USE_SUPABASE: (() => {
    const envValue = process.env.EXPO_PUBLIC_USE_SUPABASE;

    // 如果环境变量明确设置了，使用环境变量
    if (envValue !== undefined) {
      return envValue === 'true' || envValue === '1';
    }

    // 否则，根据是否配置了Supabase自动决定
    // 在开发环境下，如果配置了Supabase就使用它
    if (__DEV__ && isSupabaseConfigured()) {
      return true;
    }

    // 生产环境默认使用Django API（稳定）
    return false;
  })(),

  /**
   * 启用Supabase实时订阅
   */
  ENABLE_REALTIME: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',

  /**
   * 启用性能监控
   */
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
};

export default FEATURES;
