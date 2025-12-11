import { Button, Dialog, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale, warningScale, infoScale } from '@/src/design-system/tokens';
import type { ThemeMode } from '@/src/store/themeStore';

interface ThemeSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: string;
  description: string;
  bgColor: string;
  iconColor: string;
}[] = [
  {
    mode: 'light',
    label: '浅色',
    icon: 'sun.max.fill',
    description: '明亮清晰',
    bgColor: warningScale.warning2,
    iconColor: warningScale.warning8,
  },
  {
    mode: 'dark',
    label: '深色',
    icon: 'moon.fill',
    description: '护眼模式',
    bgColor: infoScale.info2,
    iconColor: infoScale.info8,
  },
  {
    mode: 'system',
    label: '跟随系统',
    icon: 'circle.lefthalf.filled',
    description: '自动切换',
    bgColor: primaryScale.primary2,
    iconColor: primaryScale.primary8,
  },
];

export function ThemeSelectorModal({
  open,
  onOpenChange,
  currentTheme,
  onThemeChange,
}: ThemeSelectorModalProps) {
  const handleThemeSelect = (mode: ThemeMode) => {
    onThemeChange(mode);
    onOpenChange(false);
  };

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="black"
        />

        <Dialog.Content
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
          enterStyle={{ y: -20, opacity: 0, scale: 0.95 }}
          exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor="white"
          borderRadius={24}
          padding="$5"
          width="90%"
          maxWidth={400}
        >
          <YStack gap="$4">
            {/* 标题 */}
            <YStack alignItems="center" gap="$2">
              <Text fontSize={20} fontWeight="700" color={neutralScale.neutral12}>
                选择主题
              </Text>
              <Text fontSize={13} color={neutralScale.neutral8}>
                选择您喜欢的显示模式
              </Text>
            </YStack>

            {/* 主题选项 */}
            <YStack gap="$3" marginTop="$2">
              {THEME_OPTIONS.map((option) => {
                const isSelected = currentTheme === option.mode;
                return (
                  <XStack
                    key={option.mode}
                    padding="$4"
                    borderRadius={16}
                    borderWidth={2}
                    borderColor={isSelected ? primaryScale.primary7 : neutralScale.neutral3}
                    backgroundColor={isSelected ? primaryScale.primary1 : 'white'}
                    pressStyle={{ scale: 0.98, backgroundColor: neutralScale.neutral2 }}
                    onPress={() => handleThemeSelect(option.mode)}
                    alignItems="center"
                    gap="$3"
                  >
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={14}
                      backgroundColor={option.bgColor}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconSymbol name={option.icon as any} size={24} color={option.iconColor} />
                    </YStack>

                    <YStack flex={1}>
                      <Text
                        fontSize={16}
                        fontWeight="600"
                        color={isSelected ? primaryScale.primary9 : neutralScale.neutral12}
                      >
                        {option.label}
                      </Text>
                      <Text fontSize={13} color={neutralScale.neutral8} marginTop={2}>
                        {option.description}
                      </Text>
                    </YStack>

                    {isSelected && (
                      <YStack
                        width={24}
                        height={24}
                        borderRadius={12}
                        backgroundColor={primaryScale.primary7}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="checkmark" size={14} color="white" />
                      </YStack>
                    )}
                  </XStack>
                );
              })}
            </YStack>

            {/* 关闭按钮 */}
            <Dialog.Close displayWhenAdapted asChild>
              <Button
                marginTop="$2"
                height={48}
                backgroundColor={neutralScale.neutral2}
                borderRadius={12}
                pressStyle={{ backgroundColor: neutralScale.neutral3 }}
                onPress={() => onOpenChange(false)}
              >
                <Text fontSize={15} fontWeight="600" color={neutralScale.neutral11}>
                  完成
                </Text>
              </Button>
            </Dialog.Close>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
