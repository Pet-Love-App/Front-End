/**
 * 列表底部加载器 - 加载更多数据时显示
 */
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

import { primaryScale, neutralScale } from '@/src/design-system/tokens';

interface ListFooterProps {
  isLoadingMore: boolean;
}

export function ListFooter({ isLoadingMore }: ListFooterProps) {
  if (!isLoadingMore) return null;

  return (
    <YStack padding="$6" alignItems="center" gap="$3" backgroundColor="white" marginTop="$2">
      <YStack
        width={60}
        height={60}
        borderRadius="$12"
        backgroundColor={primaryScale.primary2}
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color={primaryScale.primary7} />
      </YStack>
      <Text fontSize={16} color="$foreground" fontWeight="700" letterSpacing={0.3}>
        加载更多猫粮中...
      </Text>
      <Text fontSize={14} color={neutralScale.neutral8} fontWeight="500">
        为您精选优质产品
      </Text>
    </YStack>
  );
}
