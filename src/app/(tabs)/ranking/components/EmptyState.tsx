import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface EmptyStateProps {
  type: 'search' | 'complete' | 'default';
  searchQuery?: string;
  onReset?: () => void;
  onRefresh?: () => void;
}

/**
 * 空状态组件
 * 根据不同情况显示不同的空状态
 */
export function EmptyState({ type, searchQuery, onReset, onRefresh }: EmptyStateProps) {
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
          backgroundColor="#FFF5ED"
          alignItems="center"
          justifyContent="center"
          marginBottom="$5"
          borderWidth={3}
          borderColor="#FFE4D1"
        >
          <IconSymbol name="magnifyingglass" size={64} color="#FEBE98" />
        </YStack>
        <Text
          fontSize={24}
          fontWeight="900"
          color="#111827"
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          未找到相关猫粮
        </Text>
        <Text
          fontSize={15}
          color="#6B7280"
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
            backgroundColor="#FEBE98"
            gap="$2.5"
            alignItems="center"
            borderWidth={2}
            borderColor="#FCA574"
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
          backgroundColor="#D1FAE5"
          alignItems="center"
          justifyContent="center"
          marginBottom="$4"
          borderWidth={3}
          borderColor="#A7F3D0"
        >
          <IconSymbol name="checkmark.circle.fill" size={64} color="#10B981" />
        </YStack>
        <Text
          fontSize={22}
          fontWeight="900"
          color="#111827"
          marginBottom="$2.5"
          letterSpacing={0.5}
        >
          已显示全部猫粮
        </Text>
        <Text fontSize={15} color="#6B7280" textAlign="center" lineHeight={24} fontWeight="500">
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
        backgroundColor="#F3F4F6"
        alignItems="center"
        justifyContent="center"
        marginBottom="$5"
        borderWidth={3}
        borderColor="#E5E7EB"
      >
        <IconSymbol name="tray.fill" size={64} color="#9CA3AF" />
      </YStack>
      <Text fontSize={24} fontWeight="900" color="#111827" marginBottom="$2.5" letterSpacing={0.5}>
        暂无猫粮数据
      </Text>
      <Text
        fontSize={15}
        color="#6B7280"
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
          backgroundColor="#FEBE98"
          gap="$2.5"
          alignItems="center"
          borderWidth={2}
          borderColor="#FCA574"
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
