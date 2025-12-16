import { useState } from 'react';
import { Dimensions, Image, Alert } from 'react-native';
import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { useRouter } from 'expo-router';
import { Heart, Trash2 } from '@tamagui/lucide-icons';

import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';

interface PetDetailModalProps {
  pet: Pet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (petId: number) => Promise<void>;
}

export function PetDetailModal({ pet, open, onOpenChange, onDelete }: PetDetailModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!pet) return null;

  const handleOpenHealth = () => {
    onOpenChange(false);
    router.push({
      pathname: '/(tabs)/profile/pet-health',
      params: {
        petId: pet.id.toString(),
        petName: pet.name,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert('确认删除', `确定要删除 ${pet.name} 吗？此操作无法撤销。`, [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          if (!onDelete) return;
          try {
            setDeleting(true);
            await onDelete(pet.id);
            onOpenChange(false);
          } catch (error) {
            // 错误已在 Hook 中处理
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const screenWidth = Dimensions.get('window').width;
  const dialogWidth = Math.min(screenWidth - 48, 400);

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
          padding="$4"
          backgroundColor={colors.background}
          width={dialogWidth}
        >
          <Dialog.Title fontSize={22} fontWeight="700" color={colors.text}>
            {pet.name}
          </Dialog.Title>

          <YStack gap="$3" alignItems="center">
            {pet.photo_url ? (
              <Image
                source={{ uri: pet.photo_url }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 16,
                  backgroundColor: colors.icon + '20',
                }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                width={200}
                height={200}
                borderRadius={16}
                backgroundColor="$orange3"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={120}>🐱</Text>
              </YStack>
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

          {/* 快捷操作按钮 */}
          <Button
            fullWidth
            variant="outline"
            leftIcon={<Heart size={18} />}
            onPress={handleOpenHealth}
          >
            健康档案 & 体重记录
          </Button>

          <XStack justifyContent="flex-end" gap="$2">
            <Dialog.Close displayWhenAdapted asChild>
              <Button variant="outline" onPress={() => onOpenChange(false)} disabled={deleting}>
                关闭
              </Button>
            </Dialog.Close>
          </XStack>

          {/* 删除按钮 - 放在最下方，与上面内容分隔 */}
          {onDelete && (
            <>
              <YStack height={1} backgroundColor="$gray5" marginVertical="$2" />
              <Button
                fullWidth
                variant="danger"
                leftIcon={<Trash2 size={18} />}
                onPress={handleDelete}
                loading={deleting}
                disabled={deleting}
              >
                删除宠物
              </Button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
