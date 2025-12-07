import { Button, Card, Dialog, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
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
}[] = [
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
          width="90%"
          maxWidth={600}
        >
          <Dialog.Title fontSize={20} fontWeight="600" color={colors.text} textAlign="center">
            选择主题
          </Dialog.Title>

          {/* 横向排列的主题选项 */}
          <XStack gap="$3" justifyContent="center" flexWrap="wrap">
            {THEME_OPTIONS.map((option) => (
              <Card
                key={option.mode}
                padding="$4"
                borderWidth={2}
                borderColor={currentTheme === option.mode ? colors.tint : colors.icon + '40'}
                backgroundColor={colors.background}
                pressStyle={{ scale: 0.95, opacity: 0.9 }}
                onPress={() => handleThemeSelect(option.mode)}
                animation="quick"
                flex={1}
                minWidth={150}
                maxWidth={180}
              >
                <YStack alignItems="center" gap="$2">
                  <IconSymbol
                    name={option.icon as any}
                    size={40}
                    color={currentTheme === option.mode ? colors.tint : colors.icon}
                  />
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color={currentTheme === option.mode ? colors.tint : colors.text}
                    textAlign="center"
                  >
                    {option.label}
                  </Text>
                  <Text fontSize={12} color={colors.icon} textAlign="center" numberOfLines={1}>
                    {option.description}
                  </Text>

                  {currentTheme === option.mode && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                  )}
                </YStack>
              </Card>
            ))}
          </XStack>

          <XStack justifyContent="center" marginTop="$2">
            <Dialog.Close displayWhenAdapted asChild>
              <Button onPress={() => onOpenChange(false)} size="$4" minWidth={120}>
                完成
              </Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
