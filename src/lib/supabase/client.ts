/**
 * Supabase 客户端配置
 *
 * 支持 SSR 环境（Expo Web）
 */

import { createClient } from '@supabase/supabase-js';

import { logger } from '@/src/utils/logger';

// Supabase 配置（从环境变量读取）
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查是否在服务端运行（SSR）
const isServer = typeof window === 'undefined';

// 配置验证（只在客户端环境打印）
if (!isServer && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error('❌ Supabase 配置缺失！');
  console.error('请在 .env 文件中添加：');
  console.error('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('然后重启: npm start -- --clear');
}

// URL 格式验证
if (!isServer && SUPABASE_URL && !SUPABASE_URL.startsWith('https://')) {
  console.error('❌ SUPABASE_URL 格式错误，应该以 https:// 开头');
}

/**
 * 内存存储 - 用于 SSR 环境（服务端没有 AsyncStorage）
 */
class MemoryStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * 创建 Supabase 客户端
 * - 服务端：使用内存存储，禁用自动刷新
 * - 客户端：使用 AsyncStorage，启用自动刷新
 */
const createSupabaseClient = () => {
  if (isServer) {
    // 服务端：使用简化配置，避免 AsyncStorage
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: new MemoryStorage(),
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Type': 'pet-love-mobile',
        },
      },
    });
  }

  // 客户端：使用 AsyncStorage

  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Type': 'pet-love-mobile',
      },
    },
  });
};

/** Supabase 客户端实例 */
export const supabase = createSupabaseClient();

/** 检查 Supabase 是否已正确配置 */
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/** 获取当前 Session */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('获取 Session 失败', error as Error);
      return null;
    }
    return data.session;
  } catch (error) {
    logger.error('获取 Session 异常', error as Error);
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
      logger.error('设置 Supabase Session 失败', error as Error);
      return false;
    }

    logger.info('Supabase 认证已同步');
    return true;
  } catch (error) {
    logger.error('设置 Supabase Session 异常', error as Error);
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
    logger.info('Supabase Session 已清除');
  } catch (error) {
    logger.error('清除 Supabase Session 失败', error as Error);
  }
};

/**
 * @deprecated 不再需要手动初始化，Session 会自动从 AsyncStorage 恢复
 * 初始化 Supabase 认证（兼容旧代码）
 */
export const initSupabaseAuth = async (): Promise<void> => {
  // Session 会自动从 AsyncStorage 恢复，无需手动操作
  const session = await getSession();
  logger.info('Supabase Session 状态', { isLoggedIn: !!session });
};

export default supabase;
