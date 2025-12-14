/**
 * Deep Link 处理钩子
 * 用于处理邮箱验证、密码重置等回调链接
 *
 * 支持:
 * - 邮箱验证自动登录
 * - 密码重置
 * - Auth State 变化监听
 */

import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase/client';
import { useUserStore } from '@/src/store/userStore';
import { Alert } from 'react-native';
import { logger } from '@/src/utils/logger';

/**
 * 处理 Supabase 认证相关的深度链接和 Auth State 变化
 */
export function useDeepLink() {
  const router = useRouter();
  const { fetchCurrentUser, setSession, setUser } = useUserStore();
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    // 1. 监听 Supabase Auth State 变化（最重要！）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth State 变化', { event, hasSession: !!session });

      switch (event) {
        case 'SIGNED_IN':
          // 用户登录成功（包括邮箱验证后的自动登录）
          if (session) {
            setSession(session);
            try {
              await fetchCurrentUser();

              // 只在邮箱验证时显示欢迎消息（避免普通登录也显示）
              if (!hasShownWelcome.current && session.user.email_confirmed_at) {
                hasShownWelcome.current = true;
                Alert.alert('验证成功', '邮箱验证成功！欢迎使用 Pet Love！', [
                  {
                    text: '确定',
                    onPress: () => router.replace('/(tabs)/collect'),
                  },
                ]);
              }
            } catch (error) {
              logger.error('获取用户信息失败', error as Error);
            }
          }
          break;

        case 'SIGNED_OUT':
          // 用户登出
          setUser(null);
          setSession(null);
          break;

        case 'TOKEN_REFRESHED':
          // Token 刷新成功
          if (session) {
            setSession(session);
          }
          break;

        case 'USER_UPDATED':
          // 用户信息更新
          if (session) {
            setSession(session);
            await fetchCurrentUser();
          }
          break;
      }
    });

    // 2. 处理应用启动时的深度链接
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink(initialUrl);
      }
    };

    // 3. 处理深度链接
    const handleDeepLink = async (url: string) => {
      logger.info('收到深度链接', { url });

      try {
        // 解析 URL 中的认证参数
        const parsedUrl = Linking.parse(url);
        const { queryParams } = parsedUrl;

        // 检查是否包含 access_token（邮箱验证成功后的回调）
        if (queryParams?.access_token && queryParams?.refresh_token) {
          logger.info('检测到认证 token，设置 session');

          const { data, error } = await supabase.auth.setSession({
            access_token: queryParams.access_token as string,
            refresh_token: queryParams.refresh_token as string,
          });

          if (error) {
            logger.error('设置 session 失败', error);
            Alert.alert('验证失败', '邮箱验证失败，请重试');
            return;
          }

          if (data.session) {
            logger.info('Session 设置成功，等待 Auth State 变化');
            // Auth State Change 会自动触发，不需要手动处理
          }
        }

        // 检查是否是密码重置回调
        if (queryParams?.type === 'recovery') {
          logger.info('检测到密码重置回调');
          // TODO: 跳转到密码重置页面
          Alert.alert('密码重置', '请设置新密码');
        }

        // 检查是否有错误
        if (queryParams?.error) {
          const errorDescription = (queryParams.error_description as string) || '未知错误';
          logger.error('深度链接包含错误', new Error(errorDescription));
          Alert.alert('验证失败', decodeURIComponent(errorDescription));
        }
      } catch (err) {
        logger.error('处理深度链接失败', err as Error);
      }
    };

    handleInitialURL();

    // 4. 监听深度链接事件
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 清理函数
    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [router, fetchCurrentUser, setSession, setUser]);
}
