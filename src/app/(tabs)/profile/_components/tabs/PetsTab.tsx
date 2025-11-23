import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { memo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Spinner, Text, XStack, YStack } from 'tamagui';
import { PetInfoPanel } from '../PetInfoPanel';

/**
 * 宠物 Tab 组件的 Props
 */
interface PetsTabProps {
  /** 宠物列表 */
  pets: Pet[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 添加宠物回调 */
  onAddPet: () => void;
}

/**
 * 宠物 Tab 组件
 *
 * 功能：
 * - 显示宠物头像列表
 * - 点击头像查看宠物详情
 * - 添加新宠物
 *
 * @component
 */
export const PetsTab = memo(function PetsTab({ pets, isLoading, onAddPet }: PetsTabProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);

  // 自动选择第一个宠物
  if (!selectedPet && pets.length > 0) {
    setSelectedPet(pets[0]);
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <Spinner size="large" color="#FEBE98" />
        <Text fontSize={14} color={colors.icon} marginTop="$3">
          加载中...
        </Text>
      </YStack>
    );
  }

  if (pets.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
        <YStack
          width={100}
          height={100}
          borderRadius="$12"
          backgroundColor="$gray2"
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="pawprint.fill" size={50} color={colors.icon + '60'} />
        </YStack>
        <Text fontSize={16} fontWeight="600" color={colors.text}>
          还没有宠物
        </Text>
        <Text fontSize={14} color={colors.icon} textAlign="center">
          点击下方按钮添加你的第一只宠物
        </Text>
        <TouchableOpacity onPress={onAddPet} activeOpacity={0.8}>
          <YStack
            paddingHorizontal="$6"
            paddingVertical="$3"
            backgroundColor="#FEBE98"
            borderRadius="$4"
          >
            <XStack gap="$2" alignItems="center">
              <IconSymbol name="plus.circle.fill" size={20} color="white" />
              <Text fontSize={15} fontWeight="600" color="white">
                添加宠物
              </Text>
            </XStack>
          </YStack>
        </TouchableOpacity>
      </YStack>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <YStack width="100%" alignItems="center" paddingVertical="$4" gap="$4">
        {/* 宠物头像列表 */}
        <YStack width="90%" gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={16} fontWeight="700" color={colors.text}>
              我的宠物
            </Text>
            <TouchableOpacity onPress={onAddPet} activeOpacity={0.7}>
              <XStack
                gap="$2"
                alignItems="center"
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor="#FEBE98"
                borderRadius="$3"
              >
                <IconSymbol name="plus.circle.fill" size={16} color="white" />
                <Text fontSize={13} fontWeight="600" color="white">
                  添加
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>

          {/* 宠物头像网格 */}
          <XStack flexWrap="wrap" gap="$3">
            {pets.map((pet) => {
              const isSelected = selectedPet?.id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setSelectedPet(pet)}
                  activeOpacity={0.7}
                >
                  <YStack
                    width={80}
                    alignItems="center"
                    gap="$2"
                    padding="$2"
                    borderRadius="$3"
                    backgroundColor={isSelected ? '#FEF3E8' : 'transparent'}
                  >
                    <Avatar
                      circular
                      size={64}
                      borderWidth={isSelected ? 3 : 0}
                      borderColor={isSelected ? '#FEBE98' : 'transparent'}
                    >
                      {pet.photo ? (
                        <Avatar.Image src={pet.photo} />
                      ) : (
                        <Avatar.Fallback
                          backgroundColor="$orange3"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text fontSize={32}>🐱</Text>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <Text
                      fontSize={12}
                      fontWeight={isSelected ? '600' : '400'}
                      color={isSelected ? '#D97706' : colors.text}
                      numberOfLines={1}
                      textAlign="center"
                    >
                      {pet.name}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              );
            })}
          </XStack>
        </YStack>

        {/* 选中宠物的详情面板 */}
        {selectedPet && <PetInfoPanel pet={selectedPet} />}
      </YStack>
    </ScrollView>
  );
});
