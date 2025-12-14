/**
 * Deep Link 处理钩子
 * 用于处理邮箱验证、密码重置等回调链接
 */

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase/client';
import { useUserStore } from '@/src/store/userStore';
import { Alert } from 'react-native';

/**
 * 处理 Supabase 认证相关的深度链接
 */
export function useDeepLink() {
  const router = useRouter();
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    // 处理应用启动时的深度链接
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // 处理应用运行时收到的深度链接
    const handleDeepLink = async (url: string) => {
      console.log('收到深度链接:', url);

      try {
        // 解析 URL 中的认证参数
        const parsedUrl = Linking.parse(url);
        const { queryParams } = parsedUrl;

        // 检查是否包含 access_token（邮箱验证成功后的回调）
        if (queryParams?.access_token && queryParams?.refresh_token) {
          // 使用 token 设置 session
          const { data, error } = await supabase.auth.setSession({
            access_token: queryParams.access_token as string,
            refresh_token: queryParams.refresh_token as string,
          });

          if (error) {
            console.error('设置 session 失败:', error);
            Alert.alert('验证失败', '邮箱验证失败，请重试');
            return;
          }

          if (data.session) {
            // 获取用户信息并更新状态
            await fetchCurrentUser();
            Alert.alert('验证成功', '邮箱验证成功！欢迎使用 Pet Love！', [
              {
                text: '确定',
                onPress: () => router.replace('/(tabs)/collect'),
              },
            ]);
          }
        }

        // 检查是否是密码重置回调
        if (queryParams?.type === 'recovery') {
          // 跳转到密码重置页面（如果有的话）
          // router.push('/reset-password');
          Alert.alert('密码重置', '请设置新密码');
        }

        // 检查是否有错误
        if (queryParams?.error) {
          const errorDescription = (queryParams.error_description as string) || '未知错误';
          Alert.alert('验证失败', decodeURIComponent(errorDescription));
        }
      } catch (err) {
        console.error('处理深度链接失败:', err);
      }
    };

    handleInitialURL();

    // 监听深度链接事件
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router, fetchCurrentUser]);
}
