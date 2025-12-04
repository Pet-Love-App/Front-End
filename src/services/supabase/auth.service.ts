import { supabase } from '@/src/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
}

/**
 * 认证服务
 * 封装 Supabase Auth 相关操作
 */
export const authService = {
  /**
   * 用户注册
   */
  async signUp({ email, password, username }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * 用户登录
   */
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * 用户登出
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * 获取当前会话
   */
  async getSession(): Promise<Session | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * 获取当前用户的完整资料
   */
  async getCurrentUserProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { ...user, profile: data };
  },

  /**
   * 更新用户资料
   */
  async updateProfile(updates: UpdateProfileData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * 重置密码（发送邮件）
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'yourapp://reset-password',
    });
    if (error) throw error;
  },

  /**
   * 更新密码
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * 更新邮箱
   */
  async updateEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) throw error;
  },

  /**
   * 刷新会话
   */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  },
};

export default authService;

