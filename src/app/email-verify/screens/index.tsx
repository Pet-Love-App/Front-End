/**
 * 邮箱验证结果页面
 * 用于显示邮箱验证的结果状态：成功、失败、验证中
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { Button } from '@/src/design-system';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, successScale, errorScale, neutralScale } from '@/src/design-system/tokens';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function EmailVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: VerifyStatus;
    message?: string;
  }>();

  // 默认状态为验证中
  const status: VerifyStatus = (params.status as VerifyStatus) || 'loading';
  const errorMessage = params.message || '验证链接已失效或无效';

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // 页面进入动画
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  // 根据状态获取配置
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'checkmark.circle.fill' as const,
          iconColor: successScale.success6,
          title: '验证成功！',
          subtitle: '您的邮箱已成功验证',
          description: '欢迎加入 Pet Love 大家庭！\n现在开始探索为您的爱宠定制的健康服务吧',
          gradient: [successScale.success1, '#FFFFFF'] as const,
          accentColor: successScale.success6,
          showAnimation: true,
          animationSource: require('@/assets/animations/cat_playing.json'),
        };
      case 'error':
        return {
          icon: 'xmark.circle.fill' as const,
          iconColor: errorScale.error6,
          title: '验证失败',
          subtitle: errorMessage,
          description: '请检查验证链接是否正确，\n或重新发送验证邮件',
          gradient: [errorScale.error1, '#FFFFFF'] as const,
          accentColor: errorScale.error6,
          showAnimation: true,
          animationSource: require('@/assets/animations/scary_cat.json'),
        };
      case 'loading':
      default:
        return {
          icon: 'envelope.badge' as const,
          iconColor: primaryScale.primary7,
          title: '正在验证...',
          subtitle: '请稍候',
          description: '正在验证您的邮箱地址\n这可能需要几秒钟',
          gradient: [primaryScale.primary1, '#FFFFFF'] as const,
          accentColor: primaryScale.primary7,
          showAnimation: true,
          animationSource: require('@/assets/animations/cat_loader.json'),
        };
    }
  };

  const config = getStatusConfig();

  // 处理按钮点击
  const handlePrimaryAction = () => {
    if (status === 'success') {
      router.replace('/onboarding');
    } else if (status === 'error') {
      router.replace('/login');
    }
  };

  const handleSecondaryAction = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={config.gradient}
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
        {/* 动画/图标区域 */}
        <Animated.View
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {config.showAnimation ? (
            <LottieAnimation
              source={config.animationSource}
              width={220}
              height={180}
              loop={status === 'loading'}
              autoPlay
            />
          ) : (
            <View style={[styles.iconWrapper, { backgroundColor: `${config.accentColor}15` }]}>
              <IconSymbol name={config.icon} size={80} color={config.iconColor} />
            </View>
          )}
        </Animated.View>

        {/* 状态标签 */}
        {status === 'success' && (
          <Animated.View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${successScale.success6}15`,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="checkmark.seal.fill" size={18} color={successScale.success6} />
              <Text color={successScale.success7} fontSize="$3" fontWeight="600">
                邮箱已认证
              </Text>
            </XStack>
          </Animated.View>
        )}

        {/* 标题区域 */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text
            fontSize="$9"
            fontWeight="bold"
            color={neutralScale.neutral12}
            textAlign="center"
            marginBottom="$2"
          >
            {config.title}
          </Text>

          <Text
            fontSize="$6"
            color={config.accentColor}
            fontWeight="600"
            textAlign="center"
            marginBottom="$4"
          >
            {config.subtitle}
          </Text>

          <Text fontSize="$4" color={neutralScale.neutral8} textAlign="center" lineHeight={24}>
            {config.description}
          </Text>
        </Animated.View>

        {/* 按钮区域 */}
        {status !== 'loading' && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <YStack width="100%" maxWidth={320} gap="$3">
              <Button
                size="lg"
                variant="primary"
                onPress={handlePrimaryAction}
                fullWidth
                testID="verify-primary-button"
              >
                {status === 'success' ? '开始使用' : '返回登录'}
              </Button>

              {status === 'error' && (
                <Button
                  size="lg"
                  variant="outline"
                  onPress={handleSecondaryAction}
                  fullWidth
                  testID="verify-secondary-button"
                >
                  重新发送验证邮件
                </Button>
              )}
            </YStack>
          </Animated.View>
        )}

        {/* 验证中提示 */}
        {status === 'loading' && (
          <Animated.View
            style={[
              styles.loadingHint,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <XStack alignItems="center" gap="$2">
              <View style={styles.loadingDot} />
              <Text color={neutralScale.neutral7} fontSize="$3">
                验证完成后将自动跳转
              </Text>
            </XStack>
          </Animated.View>
        )}

        {/* 装饰元素 */}
        <View style={styles.decorContainer}>
          {[...Array(5)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.decorDot,
                {
                  backgroundColor: `${config.accentColor}${20 + index * 10}`,
                  left: `${15 + index * 18}%`,
                  top: `${75 + (index % 2) * 5}%`,
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: Animated.add(0.5, Animated.multiply(scaleAnim, 0.5 + index * 0.1)),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  animationContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 320,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingHint: {
    position: 'absolute',
    bottom: 100,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primaryScale.primary7,
    opacity: 0.6,
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decorDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
