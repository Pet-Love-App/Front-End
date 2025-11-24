/**
 * BarcodeResultScreen - 条形码扫描结果页面
 *
 * 企业最佳实践：
 * - 单一职责：仅负责展示条形码扫描结果
 * - Props类型化：清晰的接口定义
 * - 可复用性：独立组件，易于测试
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
// @ts-ignore: expo-clipboard may not have type declarations
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, ScrollView } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, YStack } from 'tamagui';

/**
 * 组件 Props 接口
 */
interface BarcodeResultScreenProps {
  /** 扫描到的条形码内容 */
  scannedCode: string;
  /** 安全区域边距 */
  insets: EdgeInsets;
  /** 返回上一步回调 */
  onGoBack: () => void;
}

/**
 * 条形码扫描结果页面组件
 */
export function BarcodeResultScreen({ scannedCode, insets, onGoBack }: BarcodeResultScreenProps) {
  /**
   * 复制条形码到剪贴板
   */
  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(scannedCode);
      Alert.alert('已复制', '条码已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      Alert.alert('复制失败', '请重试');
    }
  };

  /**
   * 搜索商品（功能开发中）
   */
  const handleSearchProduct = () => {
    Alert.alert('功能开发中', `正在搜索条码: ${scannedCode}`);
  };

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 32,
          paddingTop: insets.top + 40,
          paddingBottom: Math.max(32, insets.bottom + 20),
        }}
      >
        <YStack alignItems="center" gap="$5" maxWidth={480} width="100%" alignSelf="center">
          {/* ==================== 成功图标 ==================== */}
          <YStack
            width={120}
            height={120}
            borderRadius="$12"
            backgroundColor="#D1FAE5"
            alignItems="center"
            justifyContent="center"
            borderWidth={3}
            borderColor="#A7F3D0"
          >
            <IconSymbol name="barcode.viewfinder" size={64} color="#10B981" />
          </YStack>

          {/* ==================== 标题 ==================== */}
          <YStack alignItems="center" gap="$2">
            <Text fontSize={28} fontWeight="900" color="#111827" letterSpacing={0.5}>
              扫描成功
            </Text>
            <Text fontSize={15} color="#6B7280" fontWeight="600">
              已识别条形码信息
            </Text>
          </YStack>

          {/* ==================== 条形码卡片 ==================== */}
          <Card
            backgroundColor="white"
            padding="$5"
            width="100%"
            borderRadius="$10"
            borderWidth={2}
            borderColor="#E5E7EB"
          >
            <YStack gap="$3" alignItems="center">
              <YStack
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                backgroundColor="#F3F4F6"
                borderRadius="$6"
              >
                <Text fontSize={13} color="#6B7280" fontWeight="700" letterSpacing={0.5}>
                  条形码内容
                </Text>
              </YStack>
              <Text
                fontSize={22}
                fontFamily="monospace"
                fontWeight="800"
                color="#111827"
                letterSpacing={1}
              >
                {scannedCode}
              </Text>
            </YStack>
          </Card>

          {/* ==================== 操作按钮 ==================== */}
          <YStack width="100%" gap="$3" marginTop="$2">
            {/* 搜索按钮 */}
            <Button
              size="$5"
              backgroundColor="#3B82F6"
              color="white"
              borderRadius="$10"
              borderWidth={2}
              borderColor="#2563EB"
              icon={<IconSymbol name="magnifyingglass" size={20} color="white" />}
              fontWeight="800"
              fontSize={16}
              letterSpacing={0.3}
              pressStyle={{ scale: 0.97, backgroundColor: '#2563EB' }}
              height={56}
              onPress={handleSearchProduct}
            >
              搜索此商品
            </Button>

            {/* 复制按钮 */}
            <Button
              size="$5"
              backgroundColor="white"
              color="#374151"
              borderRadius="$10"
              borderWidth={2}
              borderColor="#E5E7EB"
              icon={<IconSymbol name="doc.on.doc" size={20} color="#6B7280" />}
              fontWeight="700"
              fontSize={15}
              pressStyle={{ scale: 0.97, backgroundColor: '#F9FAFB' }}
              height={56}
              onPress={handleCopyCode}
            >
              复制条码
            </Button>

            {/* 重新扫描按钮 */}
            <Button
              size="$5"
              backgroundColor="transparent"
              color="#6B7280"
              fontWeight="700"
              fontSize={15}
              pressStyle={{ opacity: 0.6 }}
              onPress={onGoBack}
            >
              重新扫描
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
