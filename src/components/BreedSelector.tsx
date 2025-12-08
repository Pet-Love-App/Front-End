import { memo, useCallback, useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getBreedsBySpecies, type PetSpecies } from '@/src/constants/petBreeds';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

interface BreedSelectorProps {
  species: PetSpecies;
  value: string;
  onChange: (breed: string) => void;
  placeholder?: string;
}

export const BreedSelector = memo(function BreedSelector({
  species,
  value,
  onChange,
  placeholder = '选择或输入品种',
}: BreedSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const breeds = getBreedsBySpecies(species);
  const filteredBreeds = breeds.filter((breed) =>
    breed.label.toLowerCase().includes(searchText.toLowerCase())
  );
  const popularBreeds = breeds.filter((b) => b.popular);

  const handleSelectBreed = useCallback(
    (breed: string) => {
      onChange(breed);
      setModalVisible(false);
      setSearchText('');
    },
    [onChange]
  );

  const handleOpen = useCallback(() => setModalVisible(true), []);
  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearchText('');
  }, []);

  return (
    <>
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.7}>
        <YStack
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$borderColor"
          backgroundColor="$background"
          paddingHorizontal="$4"
          paddingVertical="$3.5"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={15} color={value ? '$foreground' : '$foregroundSubtle'} flex={1}>
              {value || placeholder}
            </Text>
            <IconSymbol name="chevron.right" size={20} color="$foregroundMuted" />
          </XStack>
        </YStack>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={handleClose}>
        <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.5)" justifyContent="flex-end">
          <Card
            backgroundColor="$background"
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
              borderBottomColor="$borderMuted"
            >
              <Text fontSize={18} fontWeight="700" color="$foreground">
                选择品种
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <IconSymbol name="xmark.circle.fill" size={28} color="$foregroundMuted" />
              </TouchableOpacity>
            </XStack>

            {/* 搜索框 */}
            <YStack paddingHorizontal="$5" paddingVertical="$3">
              <YStack
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$backgroundMuted"
                paddingHorizontal="$3"
              >
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="magnifyingglass" size={18} color="$foregroundSubtle" />
                  <TextInput
                    placeholder="搜索品种..."
                    placeholderTextColor={neutralScale.neutral6}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      height: 40,
                      fontSize: 15,
                      color: neutralScale.neutral12,
                    }}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <IconSymbol name="xmark.circle.fill" size={18} color="$foregroundSubtle" />
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
                      color="$foregroundSubtle"
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
                            backgroundColor={
                              value === breed.label ? primaryScale.primary7 : '$backgroundMuted'
                            }
                            borderWidth={value === breed.label ? 0 : 1}
                            borderColor="$borderColor"
                          >
                            <Text
                              fontSize={14}
                              fontWeight="500"
                              color={value === breed.label ? 'white' : '$foreground'}
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
                    color="$foregroundSubtle"
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
                      backgroundColor={
                        value === breed.label ? primaryScale.primary2 : 'transparent'
                      }
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text
                        fontSize={15}
                        color={value === breed.label ? primaryScale.primary10 : '$foreground'}
                        fontWeight={value === breed.label ? '600' : '400'}
                      >
                        {breed.label}
                      </Text>
                      {value === breed.label && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={20}
                          color={primaryScale.primary7}
                        />
                      )}
                    </XStack>
                  </TouchableOpacity>
                ))}

                {filteredBreeds.length === 0 && (
                  <YStack alignItems="center" paddingVertical="$6" gap="$3">
                    <IconSymbol name="magnifyingglass" size={48} color="$foregroundSubtle" />
                    <Text fontSize={15} color="$foregroundSubtle">
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
                backgroundColor={primaryScale.primary7}
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
