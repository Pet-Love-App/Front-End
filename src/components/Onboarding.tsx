import React, { useRef, useState } from 'react';
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingSlide from './OnboardingSlide';
import { useRouter } from 'expo-router';

// 应用主题色
const BRAND_COLOR = '#FEBE98';
const BRAND_LIGHT = '#FFCCBC';

const SLIDES = [
  {
    id: '1',
    title: '欢迎使用 Pet Love',
    description: '猫粮成分分析、疫苗、喂养和更多功能',
    image: require('@/assets/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: '成分分析报告',
    description: '扫描配料表，告别过量添加剂，提供详细的猫粮成分分析',
    image: require('@/assets/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: '更多功能',
    description: '浏览论坛、分享帖子、记录宠物状态...更多精彩等你发现！',
    image: require('@/assets/onboarding/slide3.png'),
  },
];

export function Onboarding() {
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // 每次登录都显示欢迎界面，跳过直接进入主页
  const onSkip = () => {
    router.replace('/(tabs)/collect');
  };

  // 开始体验，进入主页
  const onStart = () => {
    router.replace('/(tabs)/collect');
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setIndex(page);
  };

  const goNext = () => {
    const next = Math.min(index + 1, SLIDES.length - 1);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: next * width, animated: true });
    }
  };

  // 计算可用内容高度（扣除顶部和底部大致空间），避免图片占用过多导致描述被裁切
  const estimatedHeaderHeight = 64; // 顶部 "跳过" 区域及内边距
  const estimatedFooterHeight = 140; // 底部分页点与按钮的高度与安全区
  const availableContentHeight = Math.max(
    200,
    height - estimatedHeaderHeight - estimatedFooterHeight
  );

  // 调整图片最大尺寸，让图片更大但基于可用内容区
  const slideImageMaxHeight = Math.round(availableContentHeight * 0.62);
  const slideImageMaxWidth = Math.round(width * 0.85);

  return (
    <YStack flex={1} backgroundColor="$background" justifyContent="space-between">
      <XStack justifyContent="flex-end" padding="$4">
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>跳过</Text>
        </TouchableOpacity>
      </XStack>

      <ScrollView
        ref={(r) => {
          scrollRef.current = r;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s) => (
          <View key={s.id} style={{ width, flex: 1 }}>
            <OnboardingSlide
              title={s.title}
              description={s.description}
              image={(s as any).image}
              maxImageHeight={slideImageMaxHeight}
              maxImageWidth={slideImageMaxWidth}
            />
          </View>
        ))}
      </ScrollView>

      {/* 底部固定间距以避免被系统导航栏或安全区遮挡 */}
      <YStack padding="$3" style={{ paddingBottom: (Platform.OS === 'ios' ? 34 : 20) + 8 }}>
        <XStack justifyContent="center" alignItems="center" gap="$2" marginBottom="$4">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </XStack>

        <XStack justifyContent="center" paddingHorizontal="$4">
          {index === SLIDES.length - 1 ? (
            <TouchableOpacity onPress={onStart} style={styles.buttonContainer} activeOpacity={0.9}>
              <LinearGradient
                colors={[BRAND_COLOR, BRAND_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>开始体验</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={goNext} style={styles.buttonContainer} activeOpacity={0.9}>
              <LinearGradient
                colors={[BRAND_COLOR, BRAND_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>下一页 →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: BRAND_COLOR,
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: '#E5E7EB',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default Onboarding;
