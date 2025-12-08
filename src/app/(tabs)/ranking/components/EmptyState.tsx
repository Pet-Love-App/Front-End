/**
 * 空状态组件 - 根据情况显示不同空状态
 */
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, successScale, neutralScale } from '@/src/design-system/tokens';

interface EmptyStateProps {
  type: 'search' | 'complete' | 'default';
  searchQuery?: string;
  onReset?: () => void;
  onRefresh?: () => void;
}

export function EmptyState({ type, onReset, onRefresh }: EmptyStateProps) {
  // 搜索结果为空
  if (type === 'search') {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$8"
        minHeight={400}
        backgroundColor="white"
      >
        <YStack
          width={140}
          height={140}
          borderRadius="$12"
          backgroundColor={primaryScale.primary2}
          alignItems="center"
          justifyContent="center"
          marginBottom="$5"
          borderWidth={3}
          borderColor={primaryScale.primary3}
        >
          <IconSymbol name="magnifyingglass" size={64} color={primaryScale.primary7} />
        </YStack>
        <Text
          fontSize={24}
          fontWeight="900"
          color="$foreground"
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          未找到相关猫粮
        </Text>
        <Text
          fontSize={15}
          color={neutralScale.neutral8}
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
            backgroundColor={primaryScale.primary7}
            gap="$2.5"
            alignItems="center"
            borderWidth={2}
            borderColor={primaryScale.primary6}
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
        backgroundColor="white"
      >
        <YStack
          width={120}
          height={120}
          borderRadius="$12"
          backgroundColor={successScale.success2}
          alignItems="center"
          justifyContent="center"
          marginBottom="$4"
          borderWidth={3}
          borderColor={successScale.success3}
        >
          <IconSymbol name="checkmark.circle.fill" size={64} color={successScale.success8} />
        </YStack>
        <Text
          fontSize={22}
          fontWeight="900"
          color="$foreground"
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          已显示全部猫粮
        </Text>
        <Text
          fontSize={15}
          color={neutralScale.neutral8}
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
      backgroundColor="white"
    >
      <YStack
        width={140}
        height={140}
        borderRadius="$12"
        backgroundColor={neutralScale.neutral2}
        alignItems="center"
        justifyContent="center"
        marginBottom="$5"
        borderWidth={3}
        borderColor={neutralScale.neutral3}
      >
        <IconSymbol name="tray.fill" size={64} color={neutralScale.neutral7} />
      </YStack>
      <Text
        fontSize={24}
        fontWeight="900"
        color="$foreground"
        marginBottom="$2.5"
        letterSpacing={0.5}
      >
        暂无猫粮数据
      </Text>
      <Text
        fontSize={15}
        color={neutralScale.neutral8}
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
          backgroundColor={primaryScale.primary7}
          gap="$2.5"
          alignItems="center"
          borderWidth={2}
          borderColor={primaryScale.primary6}
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
