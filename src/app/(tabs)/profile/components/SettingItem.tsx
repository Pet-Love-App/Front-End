import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, Text, XStack } from 'tamagui';

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
}

export function SettingItem({ icon, label, value, onPress }: SettingItemProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Card
      padding="$4"
      borderWidth={1}
      borderColor={colors.icon + '40'}
      backgroundColor={colors.background}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      onPress={onPress}
      animation="quick"
      bordered
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3" alignItems="center">
          <IconSymbol name={icon as any} size={24} color={colors.icon} />
          <Text fontSize={16} fontWeight="500" color={colors.text}>
            {label}
          </Text>
        </XStack>

        <XStack gap="$2" alignItems="center">
          {value && (
            <Text fontSize={14} color={colors.icon}>
              {value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </XStack>
      </XStack>
    </Card>
  );
}
