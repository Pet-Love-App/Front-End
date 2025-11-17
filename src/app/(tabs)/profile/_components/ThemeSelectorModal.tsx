import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { ThemeMode } from '@/src/store/themeStore';
import { Button, Card, Dialog, Text, XStack, YStack } from 'tamagui';

interface ThemeSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  icon: string;
  description: string;
}> = [
  { mode: 'light', label: '浅色', icon: 'sun.max.fill', description: '明亮清晰的界面' },
  { mode: 'dark', label: '深色', icon: 'moon.fill', description: '护眼深色主题' },
  {
    mode: 'system',
    label: '跟随系统',
    icon: 'circle.lefthalf.filled',
    description: '自动切换主题',
  },
];

export function ThemeSelectorModal({
  open,
  onOpenChange,
  currentTheme,
  onThemeChange,
}: ThemeSelectorModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

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
        />

        <Dialog.Content
          bordered
          elevate
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
          gap="$4"
          backgroundColor={colors.background}
          maxWidth={450}
        >
          <Dialog.Title fontSize={20} fontWeight="600" color={colors.text}>
            选择主题
          </Dialog.Title>

          <YStack gap="$3">
            {THEME_OPTIONS.map((option) => (
              <Card
                key={option.mode}
                padding="$4"
                borderWidth={2}
                borderColor={currentTheme === option.mode ? colors.tint : colors.icon + '40'}
                backgroundColor={colors.background}
                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                onPress={() => handleThemeSelect(option.mode)}
                animation="quick"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$3" alignItems="center" flex={1}>
                    <IconSymbol
                      name={option.icon as any}
                      size={32}
                      color={currentTheme === option.mode ? colors.tint : colors.icon}
                    />
                    <YStack flex={1}>
                      <Text
                        fontSize={18}
                        fontWeight="600"
                        color={currentTheme === option.mode ? colors.tint : colors.text}
                      >
                        {option.label}
                      </Text>
                      <Text fontSize={13} color={colors.icon} marginTop="$1">
                        {option.description}
                      </Text>
                    </YStack>
                  </XStack>

                  {currentTheme === option.mode && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </XStack>
              </Card>
            ))}
          </YStack>

          <XStack justifyContent="flex-end">
            <Dialog.Close displayWhenAdapted asChild>
              <Button onPress={() => onOpenChange(false)}>完成</Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
