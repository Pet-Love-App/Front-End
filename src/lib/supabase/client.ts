/**
 * Supabase 客户端配置
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase 配置（从环境变量读取）
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 开发环境下的配置检查
if (__DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Supabase 配置缺失。请在 .env 文件中设置:\n' +
      'EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key'
  );
}

/** Supabase 客户端实例 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 使用 AsyncStorage 持久化 Session
    storage: AsyncStorage,
    // 自动刷新 Token
    autoRefreshToken: true,
    // 持久化 Session（应用重启后保持登录）
    persistSession: true,
    // React Native 不需要检测 URL 中的 Session
    detectSessionInUrl: false,
  },
  // 全局配置
  global: {
    headers: {
      'X-Client-Type': 'pet-love-mobile',
    },
  },
});

/** 检查 Supabase 是否已正确配置 */
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/** 获取当前 Session */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ 获取 Session 失败:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('❌ 获取 Session 异常:', error);
    return null;
  }
};

/** 检查用户是否已登录 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

/** 获取当前用户 ID */
export const getCurrentUserId = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.user?.id || null;
};

// ==================== 兼容旧代码的导出 ====================
// 注意：以下函数主要用于兼容旧代码，新代码应直接使用 supabaseAuthService

/**
 * @deprecated 使用 supabaseAuthService.login() 替代
 * 设置 Supabase 认证 Session（兼容旧代码）
 */
export const setSupabaseAuth = async (
  accessToken: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('❌ 设置 Supabase Session 失败:', error);
      return false;
    }

    if (__DEV__) {
      console.log('✅ Supabase 认证已同步');
    }
    return true;
  } catch (error) {
    console.error('❌ 设置 Supabase Session 异常:', error);
    return false;
  }
};

/**
 * @deprecated 使用 supabaseAuthService.logout() 替代
 * 清除 Supabase 认证 Session（兼容旧代码）
 */
export const clearSupabaseAuth = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    if (__DEV__) {
      console.log('✅ Supabase Session 已清除');
    }
  } catch (error) {
    console.error('❌ 清除 Supabase Session 失败:', error);
  }
};

/**
 * @deprecated 不再需要手动初始化，Session 会自动从 AsyncStorage 恢复
 * 初始化 Supabase 认证（兼容旧代码）
 */
export const initSupabaseAuth = async (): Promise<void> => {
  // Session 会自动从 AsyncStorage 恢复，无需手动操作
  if (__DEV__) {
    const session = await getSession();
    console.log('🔄 Supabase Session 状态:', session ? '已登录' : '未登录');
  }
};

export default supabase;
