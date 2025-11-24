/**
 * 操作按钮组件
 */
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Button, Spinner, YStack } from 'tamagui';

interface ActionButtonsProps {
  onSave?: () => void;
  onRetake?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
}

export function ActionButtons({ onSave, onRetake, onClose, isSaving }: ActionButtonsProps) {
  return (
    <YStack gap="$3" marginTop="$3">
      {onSave && (
        <Button
          size="$5"
          themeInverse
          onPress={onSave}
          disabled={isSaving}
          icon={<IconSymbol name="heart.fill" size={20} color="white" />}
        >
          {isSaving ? <Spinner size="small" color="$color" /> : '收藏报告'}
        </Button>
      )}

      {onRetake && (
        <Button size="$5" onPress={onRetake} icon={<IconSymbol name="camera.fill" size={20} />}>
          重新拍照
        </Button>
      )}

      {onClose && (
        <Button size="$5" chromeless onPress={onClose}>
          返回首页
        </Button>
      )}
    </YStack>
  );
}
