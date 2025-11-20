import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

/**
 * 宠物卡片组件
 * 展示单个宠物的基本信息
 */
export function PetCard({ pet, onPress }: PetCardProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 将十六进制颜色转换为带透明度的 rgba 字符串
  const withAlpha = (color: string, alpha: number) => {
    if (!color || typeof color !== 'string') return color as any;
    const hex = color.trim();
    if (!hex.startsWith('#')) return color; // 已是 rgba 或 token 时直接返回
    const normalize = (h: string) =>
      h.length === 4
        ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
        : h;
    const h = normalize(hex);
    if (h.length !== 7) return color;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 获取宠物图标
  const getPetIcon = () => {
    const species = pet.species?.toLowerCase();
    if (species === 'cat') return 'pawprint.fill';
    if (species === 'dog') return 'pawprint.fill';
    return 'heart.fill';
  };

  return (
    <Card
      padding="$4"
      borderWidth={1}
      borderColor={withAlpha(colors.icon, 0.188)}
      backgroundColor={colors.background}
      pressStyle={{
        scale: 0.97,
        opacity: 0.8,
        borderColor: withAlpha(colors.tint, 0.376),
      }}
      hoverStyle={{
        borderColor: withAlpha(colors.tint, 0.251),
      }}
      onPress={onPress}
      animation="quick"
      borderRadius="$4"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
    >
      <XStack gap="$4" alignItems="center">
        {/* Pet Photo */}
        {pet.photo ? (
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={2}
            borderColor={withAlpha(colors.tint, 0.188)}
          >
            <Image
              source={{ uri: pet.photo }}
              style={{
                width: 70,
                height: 70,
              }}
              resizeMode="cover"
            />
          </YStack>
        ) : (
          <YStack
            width={70}
            height={70}
            borderRadius="$3"
            backgroundColor={withAlpha(colors.tint, 0.125)}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={withAlpha(colors.tint, 0.188)}
          >
            <IconSymbol name={getPetIcon()} size={32} color={colors.tint} />
          </YStack>
        )}

        {/* Pet Info */}
        <YStack flex={1} gap="$1">
          <Text fontSize={17} fontWeight="700" color={colors.text}>
            {pet.name}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text fontSize={14} color={colors.icon}>
              {pet.species_display ?? pet.species}
            </Text>
            {pet.age != null && (
              <>
                <Text fontSize={14} color={withAlpha(colors.icon, 0.376)}>
                  •
                </Text>
                <Text fontSize={14} color={colors.icon}>
                  {pet.age}岁
                </Text>
              </>
            )}
          </XStack>
          {pet.breed && (
            <Text fontSize={13} color={withAlpha(colors.icon, 0.502)} numberOfLines={1}>
              {pet.breed}
            </Text>
          )}
        </YStack>

        {/* Arrow Icon */}
        <IconSymbol name="chevron.right" size={20} color={withAlpha(colors.icon, 0.376)} />
      </XStack>
    </Card>
  );
}
