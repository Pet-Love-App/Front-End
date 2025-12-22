/**
 * 空状态组件 - 根据情况显示不同空状态
 */
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

interface EmptyStateProps {
  type: 'search' | 'complete' | 'default';
  searchQuery?: string;
  onReset?: () => void;
  onRefresh?: () => void;
}

export function EmptyState({ type, onReset, onRefresh }: EmptyStateProps) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // 搜索结果为空
  if (type === 'search') {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$8"
        minHeight={400}
        backgroundColor={colors.background as any}
      >
        <YStack
          width={140}
          height={140}
          borderRadius="$12"
          backgroundColor={(isDark ? '#3D2A1F' : colors.primaryLight) as any}
          alignItems="center"
          justifyContent="center"
          marginBottom="$5"
          borderWidth={3}
          borderColor={(isDark ? '#4D3A2F' : colors.primaryLight) as any}
        >
          <IconSymbol name="magnifyingglass" size={64} color={colors.primary} />
        </YStack>
        <Text
          fontSize={24}
          fontWeight="900"
          color={colors.text as any}
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          未找到相关猫粮
        </Text>
        <Text
          fontSize={15}
          color={colors.textSecondary as any}
          textAlign="center"
          lineHeight={24}
          marginBottom="$5"
          fontWeight="500"
        >
          试试搜索其他品牌或关键词
        </Text>
        <Pressable onPress={onReset}>
          <XStack
            paddingHorizontal="$5"
            paddingVertical="$3.5"
            borderRadius="$12"
            backgroundColor={colors.primary as any}
            gap="$2.5"
            alignItems="center"
            borderWidth={2}
            borderColor={colors.primaryDark as any}
          >
            <IconSymbol name="arrow.counterclockwise" size={18} color="white" />
            <Text fontSize={16} color="white" fontWeight="800" letterSpacing={0.3}>
              重置筛选
            </Text>
          </XStack>
        </Pressable>
      </YStack>
    );
  }

  // 列表为空但有轮播图
  if (type === 'complete') {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$8"
        minHeight={300}
        backgroundColor={colors.background as any}
      >
        <YStack
          width={120}
          height={120}
          borderRadius="$12"
          backgroundColor={(isDark ? '#0D2818' : colors.successMuted) as any}
          alignItems="center"
          justifyContent="center"
          marginBottom="$4"
          borderWidth={3}
          borderColor={(isDark ? '#143D20' : colors.successMuted) as any}
        >
          <IconSymbol name="checkmark.circle.fill" size={64} color={colors.success} />
        </YStack>
        <Text
          fontSize={22}
          fontWeight="900"
          color={colors.text as any}
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          已显示全部猫粮
        </Text>
        <Text
          fontSize={15}
          color={colors.textSecondary as any}
          textAlign="center"
          lineHeight={24}
          fontWeight="500"
        >
          以上是为您精选的热门推荐
        </Text>
      </YStack>
    );
  }

  // 原始空状态
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$8"
      minHeight={400}
      backgroundColor={colors.background as any}
    >
      <YStack
        width={140}
        height={140}
        borderRadius="$12"
        backgroundColor={colors.backgroundMuted as any}
        alignItems="center"
        justifyContent="center"
        marginBottom="$5"
        borderWidth={3}
        borderColor={colors.border as any}
      >
        <IconSymbol name="tray.fill" size={64} color={colors.textTertiary} />
      </YStack>
      <Text
        fontSize={24}
        fontWeight="900"
        color={colors.text as any}
        marginBottom="$2.5"
        letterSpacing={0.5}
      >
        暂无猫粮数据
      </Text>
      <Text
        fontSize={15}
        color={colors.textSecondary as any}
        textAlign="center"
        lineHeight={24}
        marginBottom="$5"
        fontWeight="500"
      >
        还没有猫粮信息，敬请期待
      </Text>
      <Pressable onPress={onRefresh}>
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$3.5"
          borderRadius="$12"
          backgroundColor={colors.primary as any}
          gap="$2.5"
          alignItems="center"
          borderWidth={2}
          borderColor={colors.primaryDark as any}
        >
          <IconSymbol name="arrow.clockwise" size={18} color="white" />
          <Text fontSize={16} color="white" fontWeight="800" letterSpacing={0.3}>
            刷新页面
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}
