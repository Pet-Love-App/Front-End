import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';
import { Colors, withAlpha } from '@/src/constants/colors';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
}

/**
 * 宠物卡片组件
 * 展示单个宠物的基本信�?
 */
export function PetCard({ pet, onPress }: PetCardProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 防御性检查：如果没有 pet，则不渲染（�?hooks 之后检查）
  if (!pet) return null;

  return (
    <Card
      padding="$4"
      borderWidth={1}
      borderColor={withAlpha(colors.icon, 0.188) as any}
      backgroundColor={colors.background as any}
      pressStyle={{
        scale: 0.97,
        opacity: 0.8,
        borderColor: withAlpha(colors.tint, 0.376) as any,
      }}
      hoverStyle={{
        borderColor: withAlpha(colors.tint, 0.251) as any,
      }}
      {...(onPress ? { onPress } : {})}
      animation="quick"
      borderRadius="$4"
    >
      <XStack gap="$4" alignItems="center">
        {/* Pet Photo */}
        {pet.photo_url ? (
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={2}
            borderColor={withAlpha(colors.tint, 0.188) as any}
          >
            <OptimizedImage
              source={pet.photo_url}
              style={{
                width: 70,
                height: 70,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </YStack>
        ) : (
          <YStack
            width={70}
            height={70}
            borderRadius="$3"
            backgroundColor={withAlpha(colors.tint, 0.125) as any}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={withAlpha(colors.tint, 0.188) as any}
          >
            <Text fontSize={40}>🐱</Text>
          </YStack>
        )}

        {/* Pet Info */}
        <YStack flex={1} gap="$1">
          <Text fontSize={17} fontWeight="700" color={colors.text as any}>
            {pet.name || '宠物'}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Text fontSize={14} color={colors.icon as any}>
              {pet.species_display ?? pet.species ?? '未知'}
            </Text>
            {pet.age != null && (
              <>
                <Text fontSize={14} color={withAlpha(colors.icon, 0.376) as any}>
                  ·
                </Text>
                <Text fontSize={14} color={colors.icon as any}>
                  {pet.age}岁
                </Text>
              </>
            )}
          </XStack>
          {pet.breed && (
            <Text fontSize={13} color={withAlpha(colors.icon, 0.502) as any} numberOfLines={1}>
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
