import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

import { primaryScale, neutralScale } from '@/src/design-system/tokens';

export function LoadingState() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$15">
      <ActivityIndicator size="large" color={primaryScale.primary7} />
      <Text fontSize="$4" color={neutralScale.neutral9} marginTop="$4">
        加载中...
      </Text>
    </YStack>
  );
}
