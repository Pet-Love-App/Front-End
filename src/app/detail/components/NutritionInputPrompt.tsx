/**
 * NutritionInputPrompt Component
 *
 * 当猫粮缺少营养成分信息时，引导用户录入数据的提示组件
 */

import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { router } from 'expo-router';
import { Card, Text, XStack, YStack } from 'tamagui';

interface NutritionInputPromptProps {
  /** 猫粮ID，用于录入后关联数据 */
  catfoodId: number;
  /** 猫粮名称，用于传递给扫描页面 */
  catfoodName: string;
}

/**
 * 营养信息录入提示组件
 * 显示两个小按钮：录入成分信息和录入条形码
 */
export function NutritionInputPrompt({ catfoodId, catfoodName }: NutritionInputPromptProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  /**
   * 跳转到拍照扫描页面 - 录入配料表
   */
  const handleScanIngredients = () => {
    console.log('跳转到扫描页面 - 配料表模式', { catfoodId, catfoodName });
    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: String(catfoodId),
        catfoodName,
        scanType: 'ingredients',
      },
    });
  };

  /**
   * 跳转到拍照扫描页面 - 录入条形码
   */
  const handleScanBarcode = () => {
    console.log('跳转到扫描页面 - 条形码模式', { catfoodId, catfoodName });
    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: String(catfoodId),
        catfoodName,
        scanType: 'barcode',
      },
    });
  };

  return (
    <Card
      size="$2"
      bordered
      backgroundColor="$gray2"
      borderColor="$gray5"
      marginHorizontal="$3"
      marginBottom="$3"
      paddingVertical="$2.5"
      paddingHorizontal="$3"
      borderRadius="$4"
    >
      <YStack gap="$2">
        {/* 提示文字 */}
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="info.circle" size={16} color="$gray10" />
          <Text fontSize="$2" color="$gray11" fontWeight="500">
            暂无营养成分信息，帮助完善数据
          </Text>
        </XStack>

        {/* 操作按钮 */}
        <XStack gap="$2" flexWrap="wrap">
          {/* 录入配料表按钮 */}
          <XStack
            flex={1}
            minWidth={140}
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="white"
            borderRadius="$3"
            borderWidth={1.5}
            borderColor={colors.tint + '40'}
            alignItems="center"
            justifyContent="center"
            gap="$1.5"
            pressStyle={{
              opacity: 0.7,
              scale: 0.98,
            }}
            onPress={handleScanIngredients}
          >
            <IconSymbol name="camera.fill" size={16} color={colors.tint} />
            <Text fontSize="$2" color={colors.tint} fontWeight="600">
              拍摄配料表
            </Text>
          </XStack>

          {/* 录入条形码按钮 */}
          <XStack
            flex={1}
            minWidth={140}
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="white"
            borderRadius="$3"
            borderWidth={1.5}
            borderColor="$gray7"
            alignItems="center"
            justifyContent="center"
            gap="$1.5"
            pressStyle={{
              opacity: 0.7,
              scale: 0.98,
            }}
            onPress={handleScanBarcode}
          >
            <IconSymbol name="barcode.viewfinder" size={16} color="$gray11" />
            <Text fontSize="$2" color="$gray11" fontWeight="600">
              扫描条形码
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </Card>
  );
}
