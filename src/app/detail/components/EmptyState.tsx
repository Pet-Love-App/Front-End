import { Text, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { neutralScale } from '@/src/design-system/tokens';

export function EmptyState() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$15">
      <IconSymbol name="exclamationmark.triangle" size={64} color={neutralScale.neutral8} />
      <Text fontSize="$4" color={neutralScale.neutral9} marginTop="$4" textAlign="center">
        数据加载失败
      </Text>
    </YStack>
  );
}
