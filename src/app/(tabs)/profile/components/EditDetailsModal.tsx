import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { Dialog, TextArea, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface EditDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDetails: string;
  onSave: (details: string) => void;
}

export function EditDetailsModal({
  open,
  onOpenChange,
  initialDetails,
  onSave,
}: EditDetailsModalProps) {
  const colors = useThemeColors();
  const [tempDetails, setTempDetails] = useState(initialDetails);

  useEffect(() => {
    if (open) {
      setTempDetails(initialDetails);
    }
  }, [open, initialDetails]);

  const handleSave = () => {
    onSave(tempDetails.trim().length ? tempDetails : '未填写详细资料');
    onOpenChange(false);
  };

  const screenWidth = Dimensions.get('window').width;
  const dialogWidth = Math.min(screenWidth - 48, 500);

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          padding="$4"
          backgroundColor={colors.background as any}
          width={dialogWidth}
        >
          <YStack gap="$4">
            <Dialog.Title fontSize={20} fontWeight="600" color={colors.text as any}>
              编辑用户详细资料
            </Dialog.Title>

            <TextArea
              value={tempDetails}
              onChangeText={setTempDetails}
              placeholder="在这里输入用户详细信息"
              placeholderTextColor={colors.textTertiary as any}
              size="$4"
              minHeight={120}
              color={colors.text as any}
              borderColor={colors.border as any}
              backgroundColor={colors.background as any}
              focusStyle={{ borderColor: colors.primary as any }}
              numberOfLines={5}
            />

            <XStack gap="$3" justifyContent="flex-end">
              <Dialog.Close displayWhenAdapted asChild>
                <Button variant="outlined" onPress={() => onOpenChange(false)}>
                  取消
                </Button>
              </Dialog.Close>

              <Button backgroundColor={colors.primary as any} color="white" onPress={handleSave}>
                保存
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
