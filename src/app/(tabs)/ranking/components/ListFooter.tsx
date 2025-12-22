/**
 * 列表底部加载器 - 加载更多数据时显示
 */
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ListFooterProps {
  isLoadingMore: boolean;
}

export function ListFooter({ isLoadingMore }: ListFooterProps) {
  const colors = useThemeColors();
  if (!isLoadingMore) return null;

  return (
    <YStack
      padding="$6"
      alignItems="center"
      gap="$3"
      backgroundColor={colors.background as any}
      marginTop="$2"
    >
      <YStack
        width={60}
        height={60}
        borderRadius="$12"
        backgroundColor={colors.primaryLight as any}
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
      <Text fontSize={16} color={colors.text as any} fontWeight="700" letterSpacing={0.3}>
        加载更多猫粮中...
      </Text>
      <Text fontSize={14} color={colors.textSecondary as any} fontWeight="500">
        为您精选优质产品
      </Text>
    </YStack>
  );
}
