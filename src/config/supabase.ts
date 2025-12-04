import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 注意：这些值应该从环境变量中读取
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase URL 或 Anon Key 未配置');
}

/**
 * Supabase 客户端实例
 * 配置了 React Native 的持久化存储
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * 数据库类型定义
 * 提供 TypeScript 类型安全
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          is_admin?: boolean;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
        };
      };
      pets: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          species: string;
          breed: string | null;
          age: number | null;
          photo_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          species?: string;
          breed?: string | null;
          age?: number | null;
          photo_url?: string | null;
          description?: string | null;
        };
        Update: {
          name?: string;
          species?: string;
          breed?: string | null;
          age?: number | null;
          photo_url?: string | null;
          description?: string | null;
        };
      };
      catfoods: {
        Row: {
          id: number;
          name: string;
          brand: string | null;
          barcode: string | null;
          image_url: string | null;
          score: number;
          count_num: number;
          percentage: boolean;
          crude_protein: number | null;
          crude_fat: number | null;
          carbohydrates: number | null;
          crude_fiber: number | null;
          crude_ash: number | null;
          others: number | null;
          safety: string | null;
          nutrient: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          brand?: string | null;
          barcode?: string | null;
          image_url?: string | null;
          score?: number;
          count_num?: number;
          percentage?: boolean;
          crude_protein?: number | null;
          crude_fat?: number | null;
          carbohydrates?: number | null;
          crude_fiber?: number | null;
          crude_ash?: number | null;
          others?: number | null;
          safety?: string | null;
          nutrient?: string | null;
        };
        Update: {
          name?: string;
          brand?: string | null;
          image_url?: string | null;
          score?: number;
          percentage?: boolean;
          crude_protein?: number | null;
          crude_fat?: number | null;
          carbohydrates?: number | null;
          crude_fiber?: number | null;
          crude_ash?: number | null;
          others?: number | null;
          safety?: string | null;
          nutrient?: string | null;
        };
      };
      posts: {
        Row: {
          id: number;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          content?: string;
        };
        Update: {
          content?: string;
        };
      };
      comments: {
        Row: {
          id: number;
          content: string;
          author_id: string;
          target_type: 'post' | 'catfood' | 'report';
          target_id: number;
          parent_id: number | null;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          author_id: string;
          target_type: 'post' | 'catfood' | 'report';
          target_id: number;
          parent_id?: number | null;
        };
        Update: {
          content?: string;
          likes?: number;
        };
      };
      // 其他表的类型定义可以根据需要添加
    };
    Views: {
      // 视图类型定义
    };
    Functions: {
      // 函数类型定义
    };
    Enums: {
      // 枚举类型定义
    };
  };
};

/**
 * 类型化的 Supabase 客户端
 */
export type TypedSupabaseClient = typeof supabase;

/**
 * 获取公开 URL
 * @param bucket 存储桶名称
 * @param path 文件路径
 */
export function getPublicUrl(bucket: string, path: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

/**
 * 获取当前用户 ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

export default supabase;

