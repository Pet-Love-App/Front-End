import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

export function LoadingState() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$15">
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text fontSize="$4" color="$gray10" marginTop="$4">
        加载中...
      </Text>
    </YStack>
  );
}
