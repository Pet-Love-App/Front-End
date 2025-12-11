/**
 * Scanner 初始欢迎页面
 */
import React from 'react';
import { ScrollView } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Button, Text, XStack, YStack } from 'tamagui';
import { AppHeader } from '@/src/components/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, warningScale, successScale, neutralScale } from '@/src/design-system/tokens';

interface InitialScreenProps {
  insets: EdgeInsets;
  onStartScan: () => void;
}

export function InitialScreen({ insets, onStartScan }: InitialScreenProps) {
  return (
    <YStack flex={1} backgroundColor={neutralScale.neutral1}>
      {/* Header 区域 - 统一头部样式 */}
      <AppHeader title="智能扫描" insets={insets} />

      {/* 内容区域 */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 32,
          paddingBottom: Math.max(32, insets.bottom + 20),
        }}
      >
        <YStack alignItems="center" gap="$5" maxWidth={480} width="100%" alignSelf="center">
          {/* 主图标 */}
          <YStack
            width={100}
            height={100}
            borderRadius="$12"
            backgroundColor={primaryScale.primary2}
            alignItems="center"
            justifyContent="center"
            borderWidth={3}
            borderColor={primaryScale.primary3}
          >
            <IconSymbol name="camera.fill" size={50} color={primaryScale.primary7} />
          </YStack>

          {/* 主标题和描述 */}
          <YStack alignItems="center" gap="$2.5">
            <Text
              fontSize={24}
              fontWeight="900"
              textAlign="center"
              color="$foreground"
              letterSpacing={0.5}
            >
              猫粮成分智能分析
            </Text>
            <Text
              fontSize={15}
              color={neutralScale.neutral8}
              textAlign="center"
              fontWeight="600"
              lineHeight={22}
              paddingHorizontal="$2"
            >
              拍照即可获得专业的添加剂成分分析报告
            </Text>
          </YStack>

          {/* 功能说明卡片 */}
          <YStack width="100%" gap="$3">
            <YStack
              backgroundColor="white"
              borderRadius="$10"
              padding="$4"
              gap="$3"
              borderWidth={1.5}
              borderColor={neutralScale.neutral3}
            >
              <Text fontSize={15} fontWeight="800" color="$foreground" letterSpacing={0.3}>
                扫描功能
              </Text>

              <YStack gap="$2.5">
                {/* 功能 1：拍摄 */}
                <XStack alignItems="center" gap="$2.5">
                  <YStack
                    width={34}
                    height={34}
                    borderRadius="$8"
                    backgroundColor={primaryScale.primary2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IconSymbol name="camera.fill" size={17} color={primaryScale.primary7} />
                  </YStack>
                  <Text fontSize={13} color={neutralScale.neutral9} fontWeight="600" flex={1}>
                    拍摄猫粮成分表
                  </Text>
                </XStack>

                {/* 功能 2：识别 */}
                <XStack alignItems="center" gap="$2.5">
                  <YStack
                    width={34}
                    height={34}
                    borderRadius="$8"
                    backgroundColor={warningScale.warning2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IconSymbol
                      name="doc.text.viewfinder"
                      size={17}
                      color={warningScale.warning8}
                    />
                  </YStack>
                  <Text fontSize={13} color={neutralScale.neutral9} fontWeight="600" flex={1}>
                    智能识别成分信息
                  </Text>
                </XStack>

                {/* 功能 3：生成报告 */}
                <XStack alignItems="center" gap="$2.5">
                  <YStack
                    width={34}
                    height={34}
                    borderRadius="$8"
                    backgroundColor={successScale.success2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <IconSymbol
                      name="chart.bar.doc.horizontal.fill"
                      size={17}
                      color={successScale.success8}
                    />
                  </YStack>
                  <Text fontSize={13} color={neutralScale.neutral9} fontWeight="600" flex={1}>
                    生成专业分析报告
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </YStack>

          {/* 开始按钮 */}
          <YStack width="100%" marginTop="$3">
            <Button
              size="$6"
              backgroundColor={primaryScale.primary7}
              color="white"
              borderRadius="$12"
              borderWidth={2}
              borderColor={primaryScale.primary6}
              onPress={onStartScan}
              icon={<IconSymbol name="camera.fill" size={26} color="white" />}
              fontWeight="800"
              fontSize={18}
              letterSpacing={0.5}
              pressStyle={{ scale: 0.97, backgroundColor: primaryScale.primary6 }}
              height={64}
            >
              开始扫描
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
