import React, { useRef, useState } from 'react';
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import OnboardingSlide from './OnboardingSlide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// 当你改动引导内容时把版本号提升，已看过旧版的用户会再次看到新版
const ONBOARDING_VERSION = 'v1';

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

  const storageKey = `hasSeenOnboarding:${ONBOARDING_VERSION}`;

  const onSkip = async () => {
    await AsyncStorage.setItem(storageKey, 'true');
    router.replace('/(tabs)/collect');
  };

  const onStart = async () => {
    await AsyncStorage.setItem(storageKey, 'true');
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
        <TouchableOpacity onPress={onSkip}>
          <Text color="$gray10">跳过</Text>
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
        <XStack justifyContent="center" alignItems="center" gap="$2" marginBottom="$1">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: i === index ? '#333' : '#ccc',
              }}
            />
          ))}
        </XStack>

        <XStack justifyContent="center">
          {index === SLIDES.length - 1 ? (
            <Button
              size="$4"
              onPress={onStart}
              style={{ minHeight: 44, paddingHorizontal: 20, paddingVertical: 8 }}
            >
              开始体验
            </Button>
          ) : (
            <Button
              size="$4"
              onPress={goNext}
              style={{ minHeight: 44, paddingHorizontal: 20, paddingVertical: 8 }}
            >
              下一页
            </Button>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
}

export default Onboarding;
