import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { Card, Spinner, Text, XStack, YStack } from 'tamagui';
import { PetCard } from './PetCard';

interface PetListProps {
  pets?: Pet[];
  isLoading?: boolean;
  onAddPet: () => void;
  onPetPress: (pet: Pet) => void;
}

export function PetList({ pets = [], isLoading, onAddPet, onPetPress }: PetListProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  return (
    <YStack width="90%" alignItems="center" gap="$3" marginTop="$4">
      {/* Section Header */}
      <XStack width="100%" justifyContent="flex-start" alignItems="center">
        <Text fontSize={20} fontWeight="700" color={colors.text}>
          我的宠物
        </Text>
      </XStack>

      {/* Pet Cards Container */}
      <YStack width="100%" gap="$3">
        {isLoading ? (
          <Card
            padding="$6"
            borderWidth={1}
            borderColor={colors.icon + '20'}
            backgroundColor={colors.background}
            borderRadius="$4"
          >
            <YStack alignItems="center" justifyContent="center" minHeight={150}>
              <Spinner size="large" color={colors.tint} />
            </YStack>
          </Card>
        ) : pets.length === 0 ? (
          <Card
            padding="$6"
            borderWidth={1}
            borderColor={colors.icon + '20'}
            backgroundColor={colors.background}
            borderRadius="$4"
          >
            <YStack alignItems="center" justifyContent="center" minHeight={150} gap="$3">
              <IconSymbol name="pawprint.fill" size={48} color={colors.icon + '60'} />
              <Text color={colors.icon} textAlign="center" fontSize={14}>
                还没有宠物，点击上方"添加"按钮
              </Text>
            </YStack>
          </Card>
        ) : (
          <>
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onPress={() => onPetPress(pet)} />
            ))}
          </>
        )}
      </YStack>
    </YStack>
  );
}
