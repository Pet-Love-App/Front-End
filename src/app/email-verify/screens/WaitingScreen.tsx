/**
 * 等待邮箱验证页面
 * 用户注册后跳转到此页面等待验证
 * 支持 OTP 验证码输入和轮询检查验证状态
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  AppState,
  AppStateStatus,
  TextInput,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, Spinner } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/src/design-system';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { supabase } from '@/src/lib/supabase/client';
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

// 轮询配置
const POLL_INTERVAL = 5000; // 每5秒检查一次
const MAX_POLL_ATTEMPTS = 120; // 最多轮询10分钟

// 临时存储密码的 key
const TEMP_PASSWORD_KEY = 'temp_register_password';

// OTP 长度（Supabase 默认发送 8 位验证码）
const OTP_LENGTH = 8;

export default function WaitingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const email = params.email || '';

  // 状态
  const [isPolling, setIsPolling] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP 相关状态
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // 引用
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const pollCountRef = useRef(0);

  // Store
  const { fetchCurrentUser, setSession } = useUserStore();

  // 动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 页面进入动画
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeAnim]);

  // 旋转动画（检查中）
  useEffect(() => {
    if (isChecking) {
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
      rotate.start();
      return () => rotate.stop();
    }
    rotateAnim.setValue(0);
    return undefined;
  }, [isChecking, rotateAnim]);

  // 检查邮箱验证状态
  const checkEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!email) return false;

    try {
      setIsChecking(true);

      // 方法1：尝试获取当前 session（如果用户已经通过深链接验证并登录）
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const user = sessionData.session.user;
        if (user.email_confirmed_at) {
          logger.info('邮箱已验证，自动登录');
          setSession(sessionData.session);
          await fetchCurrentUser();
          // 清除临时保存的密码
          await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY).catch(() => {});
          return true;
        }
      }

      // 方法2：尝试刷新 session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (!refreshError && refreshData.session) {
        const user = refreshData.session.user;
        if (user.email_confirmed_at) {
          logger.info('刷新后检测到邮箱已验证');
          setSession(refreshData.session);
          await fetchCurrentUser();
          await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY).catch(() => {});
          return true;
        }
      }

      // 方法3：尝试使用保存的密码登录（用于在浏览器中验证的情况）
      const savedPassword = await SecureStore.getItemAsync(TEMP_PASSWORD_KEY).catch(() => null);

      if (savedPassword) {
        logger.info('尝试使用保存的密码登录验证');

        const result = await supabaseAuthService.checkEmailVerificationByLogin(
          email,
          savedPassword
        );

        if (result.verified && result.session) {
          // 登录成功，说明邮箱已验证
          logger.info('登录成功，邮箱已验证');
          setSession(result.session);
          await fetchCurrentUser();
          // 清除临时保存的密码
          await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY).catch(() => {});
          return true;
        }

        if (result.errorCode === 'email_not_confirmed') {
          // 邮箱尚未验证，这是正常状态
          logger.info('邮箱尚未验证');
          return false;
        }

        if (result.errorCode === 'invalid_credentials') {
          // 密码可能不正确，或者保存的密码已损坏
          // 不显示错误提示，用户应使用 OTP 验证
          logger.info('保存的密码不匹配，用户需使用 OTP 验证');
          // 清除无效的密码
          await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY).catch(() => {});
          return false;
        }

        // 其他错误
        if (result.error) {
          logger.warn('登录验证失败', { error: result.error, code: result.errorCode });
        }
      } else {
        // 没有保存的密码，无法自动验证
        logger.info('没有保存的密码，等待深链接验证');
      }

      return false;
    } catch (error) {
      logger.error('检查邮箱验证状态失败', error as Error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [email, fetchCurrentUser, setSession]);

  // 处理验证成功
  const handleVerificationSuccess = useCallback(() => {
    // 停止轮询
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);

    // 跳转到成功页面
    router.replace({
      pathname: '/email-verify' as const,
      params: { status: 'success' },
    } as any);
  }, [router]);

  // 轮询检查
  useEffect(() => {
    if (!isPolling || !email) return;

    const poll = async () => {
      pollCountRef.current += 1;
      setPollCount(pollCountRef.current);

      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        toast.info('轮询超时', '请点击下方按钮手动检查验证状态');
        return;
      }

      const isVerified = await checkEmailVerification();
      if (isVerified) {
        handleVerificationSuccess();
      }
    };

    // 立即检查一次
    poll();

    // 设置定时轮询
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isPolling, email, checkEmailVerification, handleVerificationSuccess]);

  // 监听应用状态变化（从后台返回时重新检查）
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // 应用从后台回到前台，立即检查验证状态
        logger.info('应用回到前台，检查验证状态');
        const isVerified = await checkEmailVerification();
        if (isVerified) {
          handleVerificationSuccess();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkEmailVerification, handleVerificationSuccess]);

  // 发送 OTP 验证码
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      logger.info('发送 OTP 验证码', { email });

      const { error, success } = await supabaseAuthService.sendOtp(email);

      if (error || !success) {
        toast.error('发送失败', error?.message || '请稍后重试');
        return;
      }

      toast.success('验证码已发送', '请查收您的邮箱');
      setResendCooldown(60);
      // 清空之前的 OTP
      setOtpCode('');
      setOtpError(null);
    } catch (error) {
      toast.error('发送失败', '请稍后重试');
    }
  };

  // 冷却倒计时
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 处理 OTP 输入变化
  const handleOtpChange = (text: string) => {
    // 只允许数字
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
      logger.info('开始验证 OTP', { email, otpLength: otpCode.length });

      const { data, error, success } = await supabaseAuthService.verifyOtp(email, otpCode);

      if (error || !success) {
        logger.warn('OTP 验证失败', { error: error?.message });
        setOtpError(error?.message || '验证失败，请重试');
        return;
      }

      if (data?.session) {
        logger.info('OTP 验证成功');
        setSession(data.session);
        await fetchCurrentUser();
        // 清除临时密码
        await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY).catch(() => {});
        // 跳转到成功页面
        handleVerificationSuccess();
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

  // 移除自动验证：只有用户点击验证按钮时才验证

  // 手动检查验证状态（通过登录方式，作为备用）
  const handleManualCheck = async () => {
    const isVerified = await checkEmailVerification();
    if (isVerified) {
      handleVerificationSuccess();
    } else {
      // 提示用户使用 OTP 验证
      toast.info('请输入验证码', `请在上方输入邮件中的 ${OTP_LENGTH} 位验证码`);
    }
  };

  // 返回登录
  const handleBackToLogin = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    router.replace('/login');
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[primaryScale.primary1, infoScale.info1, '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$6"
        paddingTop={insets.top + 40}
        paddingBottom={insets.bottom + 40}
      >
        {/* 邮件图标状态 */}
        <Animated.View
          style={[
            styles.emailIconContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.emailIconBg}>
            <IconSymbol name="envelope.fill" size={36} color={infoScale.info6} />
            {isChecking && (
              <Animated.View
                style={[styles.checkingIndicator, { transform: [{ rotate: rotateInterpolate }] }]}
              >
                <IconSymbol
                  name="arrow.trianglehead.2.counterclockwise"
                  size={16}
                  color={successScale.success6}
                />
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* 文本内容 */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text
            fontSize="$8"
            fontWeight="bold"
            color={neutralScale.neutral12}
            textAlign="center"
            marginBottom="$2"
          >
            验证您的邮箱
          </Text>

          <Text
            fontSize="$4"
            color={neutralScale.neutral8}
            textAlign="center"
            lineHeight={22}
            marginBottom="$4"
          >
            我们已向您的邮箱发送了验证链接
          </Text>

          {email && (
            <View style={styles.emailBadge}>
              <IconSymbol name="envelope.badge.fill" size={16} color={infoScale.info7} />
              <Text fontSize="$4" fontWeight="600" color={infoScale.info8} marginLeft="$2">
                {email}
              </Text>
            </View>
          )}

          <Text
            fontSize="$3"
            color={neutralScale.neutral7}
            textAlign="center"
            lineHeight={20}
            marginTop="$4"
          >
            请输入邮件中的 {OTP_LENGTH} 位验证码{'\n'}
            或点击邮件中的验证链接
          </Text>
        </Animated.View>

        {/* OTP 输入区域 */}
        <Animated.View style={[styles.otpContainer, { opacity: fadeAnim }]}>
          <View style={styles.otpInputWrapper}>
            <TextInput
              style={[
                styles.otpInput,
                otpError ? styles.otpInputError : null,
                isVerifyingOtp ? styles.otpInputDisabled : null,
              ]}
              value={otpCode}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              placeholder="00000000"
              placeholderTextColor={neutralScale.neutral5}
              editable={!isVerifyingOtp}
              autoFocus={false}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
            />
            {isVerifyingOtp && (
              <View style={styles.otpSpinner}>
                <Spinner size="small" color={primaryScale.primary6} />
              </View>
            )}
          </View>

          {otpError && (
            <Text fontSize="$2" color={errorScale.error8} textAlign="center" marginTop="$2">
              {otpError}
            </Text>
          )}

          <Text fontSize="$2" color={neutralScale.neutral6} textAlign="center" marginTop="$2">
            输入完成后点击验证按钮
          </Text>
        </Animated.View>

        {/* 状态指示器 */}
        <Animated.View style={[styles.statusContainer, { opacity: fadeAnim }]}>
          <XStack alignItems="center" gap="$2">
            {isPolling ? (
              <>
                <Spinner size="small" color={successScale.success6} />
                <Text fontSize="$3" color={successScale.success7}>
                  正在等待验证...
                </Text>
              </>
            ) : (
              <>
                <View style={styles.pauseIndicator} />
                <Text fontSize="$3" color={neutralScale.neutral7}>
                  自动检测已暂停
                </Text>
              </>
            )}
          </XStack>
        </Animated.View>

        {/* 操作按钮 */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <YStack width="100%" maxWidth={320} gap="$3">
            <Button
              size="lg"
              variant="primary"
              onPress={handleVerifyOtp}
              loading={isVerifyingOtp}
              disabled={otpCode.length !== OTP_LENGTH}
              fullWidth
              testID="verify-otp-button"
            >
              {isVerifyingOtp ? '验证中...' : '验证'}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={handleResendEmail}
              disabled={resendCooldown > 0}
              fullWidth
              testID="resend-email-button"
            >
              {resendCooldown > 0 ? `重新发送 (${resendCooldown}s)` : '重新发送验证码'}
            </Button>

            <Button
              size="md"
              variant="ghost"
              onPress={handleBackToLogin}
              fullWidth
              testID="back-to-login-button"
            >
              返回登录页面
            </Button>
          </YStack>
        </Animated.View>

        {/* 提示信息 */}
        <Animated.View style={[styles.tipsContainer, { opacity: fadeAnim }]}>
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <IconSymbol name="lightbulb.fill" size={14} color={primaryScale.primary8} />
            <Text fontSize="$2" color={neutralScale.neutral7} fontWeight="600">
              小贴士
            </Text>
          </XStack>
          <Text fontSize="$2" color={neutralScale.neutral6} textAlign="center" lineHeight={18}>
            如果没有收到邮件，请检查垃圾邮件文件夹{'\n'}
            验证链接有效期为 24 小时
          </Text>
        </Animated.View>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emailIconContainer: {
    marginBottom: 24,
  },
  emailIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${infoScale.info6}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 320,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${infoScale.info6}10`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${infoScale.info6}20`,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 320,
  },
  otpInputWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: 56,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 12,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: neutralScale.neutral4,
    borderRadius: 12,
    color: neutralScale.neutral12,
    paddingHorizontal: 16,
  },
  otpInputError: {
    borderColor: errorScale.error6,
    backgroundColor: `${errorScale.error6}08`,
  },
  otpInputDisabled: {
    backgroundColor: neutralScale.neutral2,
    color: neutralScale.neutral6,
  },
  otpSpinner: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  statusContainer: {
    marginBottom: 24,
  },
  pauseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: neutralScale.neutral5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  tipsContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: `${primaryScale.primary7}08`,
    borderRadius: 12,
    maxWidth: 320,
  },
});
