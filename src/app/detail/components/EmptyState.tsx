import { Text, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

export function EmptyState() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$15">
      <IconSymbol name="exclamationmark.triangle" size={64} color="$gray9" />
      <Text fontSize="$4" color="$gray10" marginTop="$4" textAlign="center">
        数据加载失败
      </Text>
    </YStack>
  );
}
