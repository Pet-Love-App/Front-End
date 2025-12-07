/**
 * 营养成分进度条组件
 */

import { Text, XStack, YStack } from 'tamagui';

interface NutrientBarProps {
  /** 营养成分名称 */
  label: string;
  /** 百分比值 */
  value: number;
  /** 进度条颜色（Tamagui token） */
  color: string;
}

export function NutrientBar({ label, value, color }: NutrientBarProps) {
  return (
    <YStack gap="$1.5">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color="$gray11" fontWeight="600">
          {label}
        </Text>
        <Text fontSize="$5" color={color} fontWeight="800" letterSpacing={-0.5}>
          {value.toFixed(1)}%
        </Text>
      </XStack>
      <YStack
        height={10}
        backgroundColor="$gray3"
        borderRadius="$3"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack
          height="100%"
          width={`${Math.min(value, 100)}%`}
          backgroundColor={color}
          borderRadius="$3"
        />
      </YStack>
    </YStack>
  );
}
