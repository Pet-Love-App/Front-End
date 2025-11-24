import { PageHeader } from '@/src/components/PageHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';

/**
 * Forum 主屏幕组件
 * 论坛功能即将推出
 */
export function ForumScreen() {
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      {/* Header */}
      <PageHeader
        title="论坛"
        subtitle="社区交流即将开放"
        icon={{
          name: 'bubble.left.and.bubble.right.fill',
          size: 26,
          color: '#FEBE98',
          backgroundColor: '#FFF5ED',
          borderColor: '#FFE4D1',
        }}
        insets={insets}
      />

      {/* Content */}
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Text fontSize={24} fontWeight="900" color="#111827">
          论坛
        </Text>
        <Text fontSize={16} color="#6B7280" fontWeight="600">
          即将推出...
        </Text>
      </YStack>
    </YStack>
  );
}
