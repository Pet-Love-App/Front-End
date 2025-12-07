import { memo, useCallback, useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getBreedsBySpecies, type PetSpecies } from '@/src/constants/petBreeds';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

/**
 * 品种选择器组件的 Props 接口
 */
interface BreedSelectorProps {
  /** 当前选中的宠物类型 */
  species: PetSpecies;
  /** 当前选中的品种 */
  value: string;
  /** 品种变化回调 */
  onChange: (breed: string) => void;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 品种选择器组件
 *
 * 功能：
 * - 根据宠物类型显示对应的品种列表
 * - 支持搜索过滤品种
 * - 显示热门品种
 * - 支持自定义输入
 *
 * @component
 * @example
 * ```tsx
 * <BreedSelector
 *   species="cat"
 *   value={breed}
 *   onChange={setBreed}
 * />
 * ```
 */
export const BreedSelector = memo(function BreedSelector({
  species,
  value,
  onChange,
  placeholder = '选择或输入品种',
}: BreedSelectorProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 获取当前类型的品种列表
  const breeds = getBreedsBySpecies(species);

  // 过滤品种列表
  const filteredBreeds = breeds.filter((breed) =>
    breed.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // 热门品种
  const popularBreeds = breeds.filter((b) => b.popular);

  /**
   * 选择品种
   */
  const handleSelectBreed = useCallback(
    (breed: string) => {
      onChange(breed);
      setModalVisible(false);
      setSearchText('');
    },
    [onChange]
  );

  /**
   * 打开选择器
   */
  const handleOpen = useCallback(() => {
    setModalVisible(true);
  }, []);

  /**
   * 关闭选择器
   */
  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearchText('');
  }, []);

  return (
    <>
      {/* 选择器触发按钮 */}
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.7}>
        <YStack
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$gray6"
          backgroundColor={colors.background}
          paddingHorizontal="$4"
          paddingVertical="$3.5"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={15} color={value ? colors.text : colors.icon + '80'} flex={1}>
              {value || placeholder}
            </Text>
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </XStack>
        </YStack>
      </TouchableOpacity>

      {/* 品种选择模态框 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.5)" justifyContent="flex-end">
          <Card
            backgroundColor={colors.background}
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
            maxHeight="80%"
            paddingBottom="$6"
          >
            {/* 头部 */}
            <XStack
              paddingHorizontal="$5"
              paddingVertical="$4"
              alignItems="center"
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor={colors.icon + '15'}
            >
              <Text fontSize={18} fontWeight="700" color={colors.text}>
                选择品种
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.icon} />
              </TouchableOpacity>
            </XStack>

            {/* 搜索框 */}
            <YStack paddingHorizontal="$5" paddingVertical="$3">
              <YStack
                borderRadius="$3"
                borderWidth={1}
                borderColor="$gray6"
                backgroundColor="$gray2"
                paddingHorizontal="$3"
              >
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
                  <TextInput
                    placeholder="搜索品种..."
                    placeholderTextColor={colors.icon + '80'}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                    keyboardType="default"
                    style={{
                      flex: 1,
                      height: 40,
                      fontSize: 15,
                      color: colors.text,
                    }}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <IconSymbol name="xmark.circle.fill" size={18} color={colors.icon} />
                    </TouchableOpacity>
                  )}
                </XStack>
              </YStack>
            </YStack>

            {/* 品种列表 */}
            <ScrollView style={{ maxHeight: 400 }}>
              <YStack paddingHorizontal="$5" gap="$2">
                {/* 热门品种 */}
                {!searchText && popularBreeds.length > 0 && (
                  <>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={colors.icon}
                      marginTop="$2"
                      marginBottom="$1"
                    >
                      🔥 热门品种
                    </Text>
                    <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
                      {popularBreeds.map((breed) => (
                        <TouchableOpacity
                          key={breed.label}
                          onPress={() => handleSelectBreed(breed.label)}
                          activeOpacity={0.7}
                        >
                          <YStack
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius="$3"
                            backgroundColor={value === breed.label ? '#FEBE98' : '$gray3'}
                            borderWidth={value === breed.label ? 0 : 1}
                            borderColor="$gray6"
                          >
                            <Text
                              fontSize={14}
                              fontWeight="500"
                              color={value === breed.label ? 'white' : colors.text}
                            >
                              {breed.label}
                            </Text>
                          </YStack>
                        </TouchableOpacity>
                      ))}
                    </XStack>
                  </>
                )}

                {/* 全部品种 */}
                {!searchText && (
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={colors.icon}
                    marginTop="$2"
                    marginBottom="$1"
                  >
                    全部品种
                  </Text>
                )}

                {filteredBreeds.map((breed) => (
                  <TouchableOpacity
                    key={breed.label}
                    onPress={() => handleSelectBreed(breed.label)}
                    activeOpacity={0.7}
                  >
                    <XStack
                      paddingVertical="$3"
                      paddingHorizontal="$3"
                      borderRadius="$3"
                      backgroundColor={value === breed.label ? '#FEF3E8' : 'transparent'}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text
                        fontSize={15}
                        color={value === breed.label ? '#D97706' : colors.text}
                        fontWeight={value === breed.label ? '600' : '400'}
                      >
                        {breed.label}
                      </Text>
                      {value === breed.label && (
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#FEBE98" />
                      )}
                    </XStack>
                  </TouchableOpacity>
                ))}

                {filteredBreeds.length === 0 && (
                  <YStack alignItems="center" paddingVertical="$6" gap="$3">
                    <IconSymbol name="magnifyingglass" size={48} color={colors.icon + '40'} />
                    <Text fontSize={15} color={colors.icon}>
                      未找到匹配的品种
                    </Text>
                  </YStack>
                )}
              </YStack>
            </ScrollView>

            {/* 底部按钮 */}
            <YStack paddingHorizontal="$5" paddingTop="$4" gap="$2">
              <Button
                size="$4"
                backgroundColor="#FEBE98"
                color="white"
                borderRadius="$4"
                fontWeight="600"
                onPress={handleClose}
                pressStyle={{ scale: 0.97, opacity: 0.9 }}
              >
                确定
              </Button>
            </YStack>
          </Card>
        </YStack>
      </Modal>
    </>
  );
});
