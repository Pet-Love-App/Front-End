import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { Button, Dialog, TextArea, XStack, YStack } from 'tamagui';

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
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
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
          backgroundColor={colors.background}
          width={dialogWidth}
        >
          <YStack gap="$4">
            <Dialog.Title fontSize={20} fontWeight="600" color={colors.text}>
              编辑用户详细资料
            </Dialog.Title>

            <TextArea
              value={tempDetails}
              onChangeText={setTempDetails}
              placeholder="在这里输入用户详细信息"
              placeholderTextColor={colors.icon}
              size="$4"
              minHeight={120}
              color={colors.text}
              borderColor={colors.icon}
              backgroundColor={colors.background}
              focusStyle={{ borderColor: colors.tint }}
              numberOfLines={5}
            />

            <XStack gap="$3" justifyContent="flex-end">
              <Dialog.Close displayWhenAdapted asChild>
                <Button variant="outlined" onPress={() => onOpenChange(false)}>
                  取消
                </Button>
              </Dialog.Close>

              <Button backgroundColor="$blue10" color="white" onPress={handleSave}>
                保存
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
