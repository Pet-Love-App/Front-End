import { memo, useCallback, useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
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
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.7} testID="breed-selector-trigger">
        <YStack
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$borderColor"
          backgroundColor="$background"
          paddingHorizontal="$4"
          paddingVertical="$3.5"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={15} color={(value ? '$foreground' : '$foregroundSubtle') as any} flex={1} testID="breed-selector-value">
              {value || placeholder}
            </Text>
            <IconSymbol name="chevron.right" size={20} color="$foregroundMuted" />
          </XStack>
        </YStack>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={handleClose} testID="breed-selector-modal">
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
              borderBottomColor={'$borderMuted' as any}
            >
              <Text fontSize={18} fontWeight="700" color={'$foreground' as any}>
                选择品种
              </Text>
              <TouchableOpacity onPress={handleClose} testID="breed-selector-close">
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
                <TextInput
                  testID="breed-selector-search"
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="搜索品种..."
                  placeholderTextColor={neutralScale.neutral8}
                  style={{
                    height: 40,
                    fontSize: 15,
                    color: neutralScale.neutral12,
                  }}
                />
              </YStack>
            </YStack>

            {/* 列表 */}
            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
              <YStack paddingHorizontal="$5" paddingBottom="$4">
                {filteredBreeds.length > 0 ? (
                  filteredBreeds.map((breed) => (
                    <TouchableOpacity
                      key={breed.label}
                      onPress={() => handleSelectBreed(breed.label)}
                      testID={`breed-item-${breed.label}`}
                    >
                      <XStack
                        paddingVertical="$3"
                        borderBottomWidth={1}
                        borderBottomColor={'$borderMuted' as any}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text
                          fontSize={15}
                          color={(value === breed.label ? '$primary' : '$foreground') as any}
                          fontWeight={value === breed.label ? '600' : '400'}
                        >
                          {breed.label}
                        </Text>
                        {value === breed.label && (
                          <IconSymbol name="checkmark" size={20} color="$primary" />
                        )}
                      </XStack>
                    </TouchableOpacity>
                  ))
                ) : (
                  <YStack paddingVertical="$5" alignItems="center">
                    <Text color={'$foregroundSubtle' as any}>未找到相关品种</Text>
                  </YStack>
                )}
              </YStack>
            </ScrollView>
          </Card>
        </YStack>
      </Modal>
    </>
  );
});
