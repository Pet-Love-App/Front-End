/**
 * 密码重置验证页面
 * 用户输入 OTP 验证码来验证邮箱，验证成功后可以设置新密码
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing, TextInput, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, Spinner } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/src/design-system';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { supabaseAuthService } from '@/src/lib/supabase/services/auth';
import { useUserStore } from '@/src/store/userStore';
import { toast } from '@/src/components/dialogs';
import { logger } from '@/src/utils/logger';
import {
  primaryScale,
  successScale,
  neutralScale,
  infoScale,
  errorScale,
} from '@/src/design-system/tokens';

// OTP 长度（Supabase 密码重置邮件发送 8 位验证码）
const OTP_LENGTH = 8;

export default function PasswordResetVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const email = params.email || '';

  // 状态
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Store
  const { setSession } = useUserStore();

  // 动画
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 页面进入动画
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeAnim]);

  // 重新发送验证码倒计时
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  // 如果没有邮箱，返回登录页
  useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  // 处理 OTP 输入
  const handleOtpChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtpCode(cleanedText);
    setOtpError(null);
  };

  // 验证 OTP
  const handleVerifyOtp = async () => {
    if (!email || otpCode.length !== OTP_LENGTH) {
      setOtpError(`请输入完整的 ${OTP_LENGTH} 位验证码`);
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    Keyboard.dismiss();

    try {
      logger.info('开始验证密码重置 OTP', { email, otpLength: otpCode.length });

      const { data, error, success } = await supabaseAuthService.verifyRecoveryOtp(email, otpCode);

      if (error || !success) {
        logger.warn('OTP 验证失败', { error: error?.message });
        setOtpError(error?.message || '验证失败，请重试');
        return;
      }

      if (data?.session) {
        logger.info('密码重置 OTP 验证成功');
        setSession(data.session);
        // 跳转到设置新密码页面
        router.replace({
          pathname: '/password-reset' as const,
          params: {},
        } as any);
      } else {
        setOtpError('验证失败，请重试');
      }
    } catch (error) {
      logger.error('OTP 验证异常', error as Error);
      setOtpError('验证出错，请重试');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 重新发送验证码
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      // 先设置倒计时，避免重复点击
      setResendCooldown(60); // 60秒倒计时
      const { error } = await supabaseAuthService.resetPassword({ email });

      if (error) {
        // 检查是否是速率限制错误
        const errorMessage = error.message || '';
        if (errorMessage.includes('after') && errorMessage.includes('seconds')) {
          // 提取等待时间（例如 "after 8 seconds"）
          const match = errorMessage.match(/after (\d+) seconds?/i);
          const waitSeconds = match ? parseInt(match[1], 10) : 8;

          // 设置倒计时为等待时间 + 一些缓冲
          setResendCooldown(waitSeconds + 2);
          toast.warning('发送过于频繁', `请等待 ${waitSeconds} 秒后再试`);
        } else {
          toast.error('发送失败', errorMessage);
          setResendCooldown(0);
        }
      } else {
        toast.success('已重新发送', '验证码已重新发送到您的邮箱');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '无法发送验证码，请稍后重试';

      // 检查是否是速率限制错误
      if (errorMessage.includes('after') && errorMessage.includes('seconds')) {
        const match = errorMessage.match(/after (\d+) seconds?/i);
        const waitSeconds = match ? parseInt(match[1], 10) : 8;
        setResendCooldown(waitSeconds + 2);
        toast.warning('发送过于频繁', `请等待 ${waitSeconds} 秒后再试`);
      } else {
        toast.error('发送失败', errorMessage);
        setResendCooldown(0);
      }
    }
  };

  // 返回登录
  const handleBackToLogin = () => {
    router.replace('/login');
  };

  if (!email) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <LinearGradient
          colors={[primaryScale.primary1, '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />

        <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
          {/* 图标 */}
          <YStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={primaryScale.primary2}
            alignItems="center"
            justifyContent="center"
            marginBottom="$6"
          >
            <IconSymbol name="envelope.fill" size={60} color={primaryScale.primary7} />
          </YStack>

          {/* 标题 */}
          <Text fontSize="$9" fontWeight="bold" marginBottom="$2" textAlign="center">
            验证邮箱
          </Text>
          <Text fontSize="$5" color={neutralScale.neutral9} marginBottom="$6" textAlign="center">
            请输入发送到 {email} 的验证码
          </Text>

          {/* OTP 输入框 */}
          <YStack width="100%" maxWidth={400} gap="$3" marginBottom="$4">
            <Input
              size="lg"
              placeholder={`请输入 ${OTP_LENGTH} 位验证码`}
              value={otpCode}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
              disabled={isVerifyingOtp}
              error={!!otpError}
              errorMessage={otpError || undefined}
              testID="password-reset-otp-input"
            />

            <Button
              size="lg"
              variant="primary"
              onPress={handleVerifyOtp}
              loading={isVerifyingOtp}
              disabled={otpCode.length !== OTP_LENGTH || isVerifyingOtp}
              fullWidth
              testID="password-reset-verify-button"
            >
              验证
            </Button>
          </YStack>

          {/* 重新发送 */}
          <YStack alignItems="center" gap="$2" marginTop="$4">
            <Text fontSize="$4" color={neutralScale.neutral7} textAlign="center">
              没有收到验证码？
            </Text>
            {resendCooldown > 0 ? (
              <Text fontSize="$4" color={neutralScale.neutral6}>
                {resendCooldown} 秒后可重新发送
              </Text>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onPress={handleResendOtp}
                disabled={isVerifyingOtp}
                testID="password-reset-resend-button"
              >
                重新发送验证码
              </Button>
            )}
          </YStack>

          {/* 返回登录 */}
          <YStack alignItems="center" marginTop="$6">
            <Button size="sm" variant="ghost" onPress={handleBackToLogin} disabled={isVerifyingOtp}>
              返回登录
            </Button>
          </YStack>
        </YStack>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
