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
      borderColor={colors.icon + '30'}
      backgroundColor={colors.background}
      pressStyle={{
        scale: 0.97,
        opacity: 0.8,
        borderColor: colors.tint + '60',
      }}
      hoverStyle={{
        borderColor: colors.tint + '40',
      }}
      onPress={onPress}
      animation="quick"
      borderRadius="$4"
    >
      <XStack gap="$4" alignItems="center">
        {/* Pet Photo */}
        {pet.photo ? (
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={2}
            borderColor={colors.tint + '30'}
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
            backgroundColor="$orange3"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={colors.tint + '30'}
          >
            <Text fontSize={40}>🐱</Text>
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
                <Text fontSize={14} color={colors.icon + '60'}>
                  •
                </Text>
                <Text fontSize={14} color={colors.icon}>
                  {pet.age}岁
                </Text>
              </>
            )}
          </XStack>
          {pet.breed && (
            <Text fontSize={13} color={colors.icon + '80'} numberOfLines={1}>
              {pet.breed}
            </Text>
          )}
        </YStack>

        {/* Arrow Icon */}
        <IconSymbol name="chevron.right" size={20} color={colors.icon + '60'} />
      </XStack>
    </Card>
  );
}
