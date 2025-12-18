/**
 * 操作按钮组件
 */
import { Text, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface ActionButtonsProps {
  onRetake?: () => void;
  onClose?: () => void;
}

export function ActionButtons({ onRetake, onClose }: ActionButtonsProps) {
  return (
    <YStack gap="$3" marginTop="$3">
      {onRetake && (
        <Button
          size="$5"
          height={48}
          onPress={onRetake}
          icon={<IconSymbol name="camera.fill" size={20} color="$color" />}
        >
          <Text fontSize="$4" fontWeight="500">
            重新拍照
          </Text>
        </Button>
      )}

      {onClose && (
        <Button size="lg" variant="ghost" onPress={onClose}>
          <Text fontSize="$4" color="$gray10">
            返回首页
          </Text>
        </Button>
      )}
    </YStack>
  );
}
