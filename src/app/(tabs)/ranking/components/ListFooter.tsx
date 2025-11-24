import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

interface ListFooterProps {
  isLoadingMore: boolean;
}

/**
 * 列表底部加载器组件
 * 在加载更多数据时显示
 */
export function ListFooter({ isLoadingMore }: ListFooterProps) {
  if (!isLoadingMore) return null;

  return (
    <YStack padding="$6" alignItems="center" gap="$3" backgroundColor="white" marginTop="$2">
      <YStack
        width={60}
        height={60}
        borderRadius="$12"
        backgroundColor="#FFF5ED"
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color="#FEBE98" />
      </YStack>
      <Text fontSize={16} color="#1F2937" fontWeight="700" letterSpacing={0.3}>
        加载更多猫粮中...
      </Text>
      <Text fontSize={14} color="#6B7280" fontWeight="500">
        为您精选优质产品
      </Text>
    </YStack>
  );
}
