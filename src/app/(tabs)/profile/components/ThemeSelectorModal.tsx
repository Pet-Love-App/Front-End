import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, warningScale, infoScale } from '@/src/design-system/tokens';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
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
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

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
          backgroundColor={colors.cardBackground as any}
          borderRadius={24}
          padding="$5"
          width="90%"
          maxWidth={400}
        >
          <YStack gap="$4">
            {/* 标题 */}
            <YStack alignItems="center" gap="$2">
              <Text fontSize={20} fontWeight="700" color={colors.text as any}>
                选择主题
              </Text>
              <Text fontSize={13} color={colors.textSecondary as any}>
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
                    borderColor={(isSelected ? colors.primary : colors.border) as any}
                    backgroundColor={(isSelected ? colors.selected : colors.cardBackground) as any}
                    pressStyle={{ scale: 0.98, backgroundColor: colors.hover as any }}
                    onPress={() => handleThemeSelect(option.mode)}
                    alignItems="center"
                    gap="$3"
                  >
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={14}
                      backgroundColor={
                        (isDark ? option.bgColor.replace(/^#/, '#1a') : option.bgColor) as any
                      }
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconSymbol name={option.icon as any} size={24} color={option.iconColor} />
                    </YStack>

                    <YStack flex={1}>
                      <Text
                        fontSize={16}
                        fontWeight="600"
                        color={(isSelected ? colors.primary : colors.text) as any}
                      >
                        {option.label}
                      </Text>
                      <Text fontSize={13} color={colors.textSecondary as any} marginTop={2}>
                        {option.description}
                      </Text>
                    </YStack>

                    {isSelected && (
                      <YStack
                        width={24}
                        height={24}
                        borderRadius={12}
                        backgroundColor={colors.primary as any}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol
                          name="checkmark"
                          size={14}
                          color={isDark ? '#0A0A0A' : '#FFFFFF'}
                        />
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
                backgroundColor={colors.hover as any}
                borderRadius={12}
                pressStyle={{ backgroundColor: colors.active as any }}
                onPress={() => onOpenChange(false)}
              >
                <Text fontSize={15} fontWeight="600" color={colors.text as any}>
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
