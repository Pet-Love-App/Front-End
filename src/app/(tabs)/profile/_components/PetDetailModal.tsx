import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { Image } from 'react-native';
import { Button, Dialog, Text, XStack, YStack } from 'tamagui';

interface PetDetailModalProps {
  pet: Pet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PetDetailModal({ pet, open, onOpenChange }: PetDetailModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  if (!pet) return null;

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
          maxWidth={400}
        >
          <Dialog.Title fontSize={22} fontWeight="700" color={colors.text}>
            {pet.name}
          </Dialog.Title>

          <YStack gap="$3" alignItems="center">
            {pet.photo && (
              <Image
                source={{ uri: pet.photo }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 16,
                  backgroundColor: colors.icon + '20',
                }}
                resizeMode="cover"
              />
            )}

            <YStack gap="$2" width="100%">
              <XStack gap="$2">
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  种类:
                </Text>
                <Text fontSize={16} color={colors.icon}>
                  {pet.species_display ?? pet.species}
                </Text>
              </XStack>

              {pet.age != null && (
                <XStack gap="$2">
                  <Text fontSize={16} fontWeight="600" color={colors.text}>
                    年龄:
                  </Text>
                  <Text fontSize={16} color={colors.icon}>
                    {pet.age}岁
                  </Text>
                </XStack>
              )}

              {pet.breed && (
                <XStack gap="$2">
                  <Text fontSize={16} fontWeight="600" color={colors.text}>
                    品种:
                  </Text>
                  <Text fontSize={16} color={colors.icon}>
                    {pet.breed}
                  </Text>
                </XStack>
              )}

              {pet.description && (
                <YStack gap="$2">
                  <Text fontSize={16} fontWeight="600" color={colors.text}>
                    简介:
                  </Text>
                  <Text fontSize={14} color={colors.icon} lineHeight={20}>
                    {pet.description}
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>

          <XStack justifyContent="flex-end">
            <Dialog.Close displayWhenAdapted asChild>
              <Button onPress={() => onOpenChange(false)}>关闭</Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
