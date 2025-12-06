/**
 * BarcodeResultScreen - 条形码扫描结果页面
 */

// @ts-ignore: expo-clipboard may not have type declarations
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Button, Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { supabase } from '@/src/lib/supabase';

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
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [catFoodFound, setCatFoodFound] = useState(false);
  const [catFoodName, setCatFoodName] = useState('');

  /**
   * 自动查询条形码对应的猫粮
   */
  useEffect(() => {
    const searchCatFood = async () => {
      setIsSearching(true);
      try {
        // 使用 Supabase 直接查询条形码
        const { data, error } = await supabase
          .from('catfoods')
          .select('id, name')
          .eq('barcode', scannedCode)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setCatFoodFound(true);
          setCatFoodName(data.name);
        } else {
          setCatFoodFound(false);
        }
      } catch (error) {
        console.error('查询条形码失败:', error);
        setCatFoodFound(false);
      } finally {
        setIsSearching(false);
      }
    };

    searchCatFood();
  }, [scannedCode]);

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
   * 查看猫粮详情
   */
  const handleViewCatFood = async () => {
    try {
      // 使用 Supabase 直接查询条形码
      const { data, error } = await supabase
        .from('catfoods')
        .select('id')
        .eq('barcode', scannedCode)
        .single();

      if (error) throw error;

      if (data) {
        router.push({
          pathname: '/detail',
          params: { id: data.id },
        } as any);
      }
    } catch (error) {
      Alert.alert('错误', '无法打开猫粮详情');
    }
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

              {/* 查询状态显示 */}
              {isSearching && (
                <XStack gap="$2" alignItems="center" marginTop="$2">
                  <ActivityIndicator size="small" color="#FEBE98" />
                  <Text fontSize={14} color="#6B7280" fontWeight="600">
                    正在查询猫粮信息...
                  </Text>
                </XStack>
              )}

              {!isSearching && catFoodFound && (
                <YStack
                  backgroundColor="#D1FAE5"
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  borderRadius="$6"
                  borderWidth={1.5}
                  borderColor="#A7F3D0"
                  marginTop="$2"
                >
                  <XStack gap="$2" alignItems="center">
                    <IconSymbol name="checkmark.circle.fill" size={18} color="#10B981" />
                    <Text fontSize={14} color="#059669" fontWeight="700">
                      已找到: {catFoodName}
                    </Text>
                  </XStack>
                </YStack>
              )}

              {!isSearching && !catFoodFound && (
                <YStack
                  backgroundColor="#FFF5ED"
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  borderRadius="$6"
                  borderWidth={1.5}
                  borderColor="#FFE4D1"
                  marginTop="$2"
                >
                  <XStack gap="$2" alignItems="center">
                    <IconSymbol name="exclamationmark.circle.fill" size={18} color="#F59E0B" />
                    <Text fontSize={14} color="#D97706" fontWeight="700">
                      数据库中暂无此猫粮
                    </Text>
                  </XStack>
                </YStack>
              )}
            </YStack>
          </Card>

          {/* ==================== 操作按钮 ==================== */}
          <YStack width="100%" gap="$3" marginTop="$2">
            {/* 查看猫粮详情按钮 - 仅在找到猫粮时显示 */}
            {catFoodFound && !isSearching && (
              <Button
                size="$5"
                backgroundColor="#10B981"
                color="white"
                borderRadius="$10"
                borderWidth={2}
                borderColor="#059669"
                icon={<IconSymbol name="arrow.right.circle.fill" size={20} color="white" />}
                fontWeight="800"
                fontSize={16}
                letterSpacing={0.3}
                pressStyle={{ scale: 0.97, backgroundColor: '#059669' }}
                height={56}
                onPress={handleViewCatFood}
              >
                查看猫粮详情
              </Button>
            )}

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
