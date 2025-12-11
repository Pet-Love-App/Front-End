/**
 * Scanner 初始欢迎页面
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { AppHeader } from '@/src/components/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { LottieAnimation } from '@/src/components/LottieAnimation';
import { primaryScale, warningScale, successScale, neutralScale } from '@/src/design-system/tokens';

interface InitialScreenProps {
  insets: EdgeInsets;
  onStartScan: () => void;
}

// 功能步骤数据
const SCAN_STEPS = [
  {
    icon: 'camera.fill' as const,
    title: '拍摄成分表',
    desc: '对准猫粮包装上的配料表',
    bgColor: primaryScale.primary2,
    iconColor: primaryScale.primary7,
  },
  {
    icon: 'doc.text.viewfinder' as const,
    title: '智能识别',
    desc: 'AI 自动提取成分信息',
    bgColor: warningScale.warning2,
    iconColor: warningScale.warning8,
  },
  {
    icon: 'chart.bar.doc.horizontal.fill' as const,
    title: '生成报告',
    desc: '获得专业的分析结果',
    bgColor: successScale.success2,
    iconColor: successScale.success8,
  },
];

export function InitialScreen({ insets, onStartScan }: InitialScreenProps) {
  // 动画值
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepAnims = useRef(SCAN_STEPS.map(() => new Animated.Value(0))).current;

  // 主图标脉冲动画
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // 步骤卡片依次进入动画
  useEffect(() => {
    const animations = stepAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 150,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, [stepAnims]);

  return (
    <YStack flex={1} backgroundColor={neutralScale.neutral1}>
      {/* Header 区域 */}
      <AppHeader title="智能扫描" insets={insets} />

      {/* 内容区域 */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(32, insets.bottom + 24),
        }}
      >
        <YStack alignItems="center" gap="$4" maxWidth={400} width="100%" alignSelf="center">
          {/* 顶部动画图标区域 */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              shadowColor: primaryScale.primary7,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <YStack
              width={120}
              height={120}
              borderRadius={60}
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
            >
              <LinearGradient
                colors={[primaryScale.primary5, primaryScale.primary7, primaryScale.primary8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <LottieAnimation
                source={require('@/assets/animations/scan_face.json')}
                autoPlay
                loop
                width={80}
                height={80}
              />
            </YStack>
          </Animated.View>

          {/* 主标题和描述 */}
          <YStack alignItems="center" gap="$2" paddingHorizontal="$2">
            <Text
              fontSize={26}
              fontWeight="900"
              textAlign="center"
              color={neutralScale.neutral12}
              letterSpacing={0.5}
            >
              猫粮成分智能分析
            </Text>
            <Text
              fontSize={14}
              color={neutralScale.neutral8}
              textAlign="center"
              fontWeight="500"
              lineHeight={20}
            >
              拍照即可获得专业的添加剂成分分析报告
            </Text>
          </YStack>

          {/* 功能步骤卡片 */}
          <YStack width="100%" gap="$3" marginTop="$2">
            {SCAN_STEPS.map((step, index) => {
              const translateY = stepAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              });
              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: stepAnims[index],
                    transform: [{ translateY }],
                  }}
                >
                  <XStack
                    backgroundColor="white"
                    borderRadius="$5"
                    padding="$3.5"
                    alignItems="center"
                    gap="$3"
                    borderWidth={1.5}
                    borderColor={neutralScale.neutral3}
                  >
                    {/* 步骤序号 */}
                    <YStack
                      width={28}
                      height={28}
                      borderRadius={14}
                      backgroundColor={primaryScale.primary7}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={14} fontWeight="800" color="white">
                        {index + 1}
                      </Text>
                    </YStack>

                    {/* 图标 */}
                    <YStack
                      width={44}
                      height={44}
                      borderRadius={12}
                      backgroundColor={step.bgColor}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconSymbol name={step.icon} size={22} color={step.iconColor} />
                    </YStack>

                    {/* 文字内容 */}
                    <YStack flex={1} gap="$0.5">
                      <Text fontSize={15} fontWeight="700" color={neutralScale.neutral11}>
                        {step.title}
                      </Text>
                      <Text fontSize={12} color={neutralScale.neutral7} fontWeight="500">
                        {step.desc}
                      </Text>
                    </YStack>

                    {/* 箭头指示 */}
                    {index < SCAN_STEPS.length - 1 && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: -14,
                          left: '50%',
                          marginLeft: -8,
                          zIndex: 1,
                        }}
                      >
                        <IconSymbol name="chevron.down" size={16} color={neutralScale.neutral5} />
                      </View>
                    )}
                  </XStack>
                </Animated.View>
              );
            })}
          </YStack>

          {/* 提示信息 */}
          <XStack
            backgroundColor={primaryScale.primary1}
            borderRadius="$4"
            paddingHorizontal="$3"
            paddingVertical="$2.5"
            alignItems="center"
            gap="$2"
            width="100%"
            borderWidth={1}
            borderColor={primaryScale.primary3}
          >
            <IconSymbol name="lightbulb.fill" size={18} color={primaryScale.primary8} />
            <Text fontSize={12} color={primaryScale.primary9} fontWeight="600" flex={1}>
              建议在光线充足的环境下拍摄，确保文字清晰可见
            </Text>
          </XStack>

          {/* 开始按钮 */}
          <YStack width="100%" marginTop="$2">
            <TouchableOpacity onPress={onStartScan} activeOpacity={0.9} style={{ width: '100%' }}>
              <LinearGradient
                colors={[primaryScale.primary6, primaryScale.primary7, primaryScale.primary8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 56,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <IconSymbol name="camera.viewfinder" size={24} color="white" />
                <Text fontSize={17} fontWeight="800" color="white" letterSpacing={0.5}>
                  开始扫描
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
