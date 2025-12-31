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
import { logger } from '@/src/utils/logger';

/**
 * 处理 Supabase 认证相关的深度链接和 Auth State 变化
 */
export function useDeepLink() {
  const router = useRouter();
  const { fetchCurrentUser, setSession, setUser } = useUserStore();
  const hasShownWelcome = useRef(false);
  const isVerifyingEmail = useRef(false);

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

              // 只在邮箱验证时跳转到验证成功页面（避免普通登录也跳转）
              if (
                !hasShownWelcome.current &&
                isVerifyingEmail.current &&
                session.user.email_confirmed_at
              ) {
                hasShownWelcome.current = true;
                isVerifyingEmail.current = false;
                // 跳转到验证成功页面
                router.replace({
                  pathname: '/email-verify' as const,
                  params: { status: 'success' },
                } as any);
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
          // 注意：在密码重置流程中，updatePassword 成功后我们会立即清除 session
          // 所以这里需要检查 session 是否存在，以及用户是否仍然认证
          if (session) {
            const isAuthenticated = useUserStore.getState().isAuthenticated;
            // 只有在用户仍然认证时才更新 session 和获取用户信息
            // 如果是在密码重置流程中，isAuthenticated 可能已经被设置为 false
            if (isAuthenticated) {
              setSession(session);
              // 异步获取用户信息，不阻塞事件处理
              fetchCurrentUser().catch((err) => {
                logger.error('USER_UPDATED 获取用户信息失败', err);
              });
            }
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
        // 解析 URL - Supabase 验证回调可能使用 fragment (#) 或 query params (?)
        const parsedUrl = Linking.parse(url);
        let { queryParams } = parsedUrl;

        // 如果 URL 包含 fragment (#)，从 fragment 中解析参数
        // Supabase 默认使用 implicit flow，token 放在 # 后面
        if (url.includes('#')) {
          const fragmentString = url.split('#')[1];
          if (fragmentString) {
            const fragmentParams = new URLSearchParams(fragmentString);
            const fragmentObject: Record<string, string> = {};
            fragmentParams.forEach((value, key) => {
              fragmentObject[key] = value;
            });
            // 合并 fragment 参数到 queryParams
            queryParams = { ...queryParams, ...fragmentObject };
            logger.info('从 URL fragment 解析参数', { fragmentObject });
          }
        }

        // 检查是否包含 access_token（邮箱验证成功后的回调）
        if (queryParams?.access_token && queryParams?.refresh_token) {
          logger.info('检测到认证 token，设置 session');

          // 标记正在进行邮箱验证流程
          isVerifyingEmail.current = true;

          // 先跳转到验证中页面
          router.replace({
            pathname: '/email-verify' as const,
            params: { status: 'loading' },
          } as any);

          const { data, error } = await supabase.auth.setSession({
            access_token: queryParams.access_token as string,
            refresh_token: queryParams.refresh_token as string,
          });

          if (error) {
            logger.error('设置 session 失败', error);
            isVerifyingEmail.current = false;
            // 跳转到验证失败页面
            router.replace({
              pathname: '/email-verify' as const,
              params: {
                status: 'error',
                message: '邮箱验证失败，请重试',
              },
            } as any);
            return;
          }

          if (data.session) {
            logger.info('Session 设置成功，等待 Auth State 变化');
            // Auth State Change 会自动触发，不需要手动处理
          }
          return;
        }

        // 检查是否包含 token_hash（PKCE flow 使用）
        if (queryParams?.token_hash && queryParams?.type) {
          logger.info('检测到 token_hash，验证 OTP');

          isVerifyingEmail.current = true;

          router.replace({
            pathname: '/email-verify' as const,
            params: { status: 'loading' },
          } as any);

          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: queryParams.token_hash as string,
            type: queryParams.type as 'signup' | 'email' | 'recovery',
          });

          if (error) {
            logger.error('验证 OTP 失败', error);
            isVerifyingEmail.current = false;
            router.replace({
              pathname: '/email-verify' as const,
              params: {
                status: 'error',
                message: error.message || '验证失败，链接可能已过期',
              },
            } as any);
            return;
          }

          if (data.session) {
            logger.info('OTP 验证成功');
            // Auth State Change 会自动触发
          }
          return;
        }

        // 密码重置现在使用 OTP 流程，不再需要深度链接处理
        // 如果用户点击了旧的邮件链接，引导他们使用新的 OTP 流程
        if (queryParams?.type === 'recovery') {
          logger.info('检测到旧的密码重置链接，引导用户使用 OTP 流程');
          router.replace('/forgot-password');
          return;
        }

        // 检查是否有错误
        if (queryParams?.error) {
          const errorDescription = (queryParams.error_description as string) || '未知错误';
          logger.error('深度链接包含错误', new Error(errorDescription));
          // 跳转到验证失败页面
          router.replace({
            pathname: '/email-verify' as const,
            params: {
              status: 'error',
              message: decodeURIComponent(errorDescription),
            },
          } as any);
          return;
        }

        // 如果没有匹配任何验证参数，但 URL 是验证相关的路径
        // 可能是用户直接访问了验证页面
        logger.info('深度链接未包含认证参数', { queryParams });
      } catch (err) {
        logger.error('处理深度链接失败', err as Error);
        // 跳转到验证失败页面
        router.replace({
          pathname: '/email-verify' as const,
          params: {
            status: 'error',
            message: '验证过程发生错误',
          },
        } as any);
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
