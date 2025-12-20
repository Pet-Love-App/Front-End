import { TouchableOpacity } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, XStack, YStack } from 'tamagui';

import { primaryScale, neutralScale } from '@/src/design-system/tokens';

import { IconSymbol } from './ui/IconSymbol';

interface HeaderIcon {
  name: React.ComponentProps<typeof IconSymbol>['name'];
  size?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: HeaderIcon;
  showBackButton?: boolean;
  onBackPress?: () => void;
  insets: EdgeInsets;
  backgroundColor?: string;
  showBorder?: boolean;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'compact' | 'prominent';
}

const variantConfig = {
  compact: { pb: '$2', title: 18, subtitle: 11, iconSize: 40, iconInner: 20 },
  prominent: { pb: '$5', title: 28, subtitle: 15, iconSize: 48, iconInner: 26 },
  default: { pb: '$3', title: 20, subtitle: 12, iconSize: 40, iconInner: 22 },
};

export function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = false,
  onBackPress,
  insets,
  backgroundColor = '$background',
  showBorder = true,
  rightElement,
  variant = 'default',
}: PageHeaderProps) {
  const router = useRouter();
  const config = variantConfig[variant];

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <YStack
      testID="page-header-container"
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom={config.pb as any}
      backgroundColor={backgroundColor as any}
      borderBottomWidth={showBorder ? 1 : 0}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap="$2.5" paddingTop="$2.5">
        {/* 返回按钮 */}
        {showBackButton && (
          <TouchableOpacity
            testID="page-header-back-button"
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <YStack
              padding="$2"
              borderRadius="$3"
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Ionicons name="chevron-back" size={24} color={neutralScale.neutral8} />
            </YStack>
          </TouchableOpacity>
        )}

        {/* 图标 */}
        {icon && !showBackButton && (
          <YStack
            width={config.iconSize}
            height={config.iconSize}
            borderRadius={9999}
            backgroundColor={(icon.backgroundColor || primaryScale.primary2) as any}
            alignItems="center"
            justifyContent="center"
            borderWidth={1.5}
            borderColor={(icon.borderColor || primaryScale.primary4) as any}
          >
            <IconSymbol
              name={icon.name}
              size={icon.size || config.iconInner}
              color={icon.color || primaryScale.primary9}
            />
          </YStack>
        )}

        {/* 标题区域 */}
        <YStack flex={1} gap="$0.5">
          <Text
            testID="page-header-title"
            fontSize={config.title}
            fontWeight="700"
            color="$foreground"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              testID="page-header-subtitle"
              fontSize={config.subtitle}
              color="$foregroundSubtle"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </YStack>

        {/* 右侧元素 */}
        {rightElement && (
          <XStack testID="page-header-right-element">
            {rightElement}
          </XStack>
        )}
      </XStack>
    </YStack>
  );
}
