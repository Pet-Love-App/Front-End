/**
 * 操作按钮组件
 */
import { Spinner, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface ActionButtonsProps {
  onSave?: () => void;
  onRetake?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  isAdmin?: boolean; // 是否为管理员用户
  hasExistingReport?: boolean; // 猫粮是否已有报告
}

export function ActionButtons({
  onSave,
  onRetake,
  onClose,
  isSaving,
  isAdmin = false,
  hasExistingReport = false,
}: ActionButtonsProps) {
  // 确定按钮文本和提示
  const saveButtonText = hasExistingReport
    ? isAdmin
      ? '更新报告（管理员）'
      : '保存报告到猫粮'
    : '保存报告到猫粮';

  return (
    <YStack gap="$3" marginTop="$3">
      {onSave && (
        <YStack gap="$2">
          <Button
            size="$5"
            height={52}
            themeInverse
            onPress={onSave}
            disabled={isSaving}
            icon={<IconSymbol name="checkmark.circle.fill" size={22} color="white" />}
          >
            <Text fontSize="$5" fontWeight="600" color="white">
              {isSaving ? '保存中...' : saveButtonText}
            </Text>
          </Button>

          {/* 管理员标识提示 */}
          {isAdmin && hasExistingReport && (
            <XStack
              backgroundColor="$orange2"
              padding="$3"
              borderRadius="$3"
              gap="$2"
              alignItems="center"
            >
              <IconSymbol name="crown.fill" size={16} color="$orange10" />
              <Text fontSize="$3" color="$orange11" flex={1}>
                管理员权限：可以覆盖已有的营养成分数据
              </Text>
            </XStack>
          )}
        </YStack>
      )}

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
