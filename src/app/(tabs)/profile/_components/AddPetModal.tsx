import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { PetInput } from '@/src/schemas/pet.schema';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Button, Dialog, Text, XStack, YStack } from 'tamagui';

interface AddPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (petData: PetInput, photoUri: string | null) => Promise<void>;
}

const SPECIES_OPTIONS = [
  { key: 'cat' as const, label: '猫咪', icon: 'pawprint.fill' },
  { key: 'dog' as const, label: '狗狗', icon: 'pawprint.circle.fill' },
  { key: 'bird' as const, label: '鸟类', icon: 'bird.fill' },
  { key: 'other' as const, label: '其他', icon: 'questionmark.circle.fill' },
];

export function AddPetModal({ open, onOpenChange, onSubmit }: AddPetModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 使用非受控组件，避免实时状态更新导致重渲染
  const nameRef = useRef<TextInput>(null);
  const breedRef = useRef<TextInput>(null);
  const ageRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const [species, setSpecies] = useState<'cat' | 'dog' | 'bird' | 'other'>('cat');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 内部状态用于非受控组件
  const [nameValue, setNameValue] = useState('');
  const [breedValue, setBreedValue] = useState('');
  const [ageValue, setAgeValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');

  const pickPetImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择宠物图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('canceled' in result && !result.canceled && result.assets?.[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSubmit = async () => {
    // 从 state 中获取值（这些值不会导致重渲染问题）
    const name = nameValue.trim();

    if (!name) {
      Alert.alert('提示', '请输入宠物名称');
      return;
    }

    try {
      setSubmitting(true);

      // 构建宠物数据
      const petData: PetInput = {
        name,
        species,
        breed: breedValue.trim() || undefined,
        age: ageValue ? Number(ageValue) : undefined,
        description: descriptionValue.trim() || undefined,
      };

      await onSubmit(petData, photoUri);

      // 重置表单
      setNameValue('');
      setBreedValue('');
      setAgeValue('');
      setDescriptionValue('');
      setSpecies('cat');
      setPhotoUri(null);
      onOpenChange(false);
    } catch (e) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const dialogWidth = Math.min(screenWidth - 48, 500);

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          style={{ pointerEvents: 'auto' }}
        />

        <Dialog.Content
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={colors.background}
          width={dialogWidth}
          maxHeight="85%"
          padding="$0"
        >
          {/* Header */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$4"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="pawprint.fill" size={22} color={colors.tint} />
              <Dialog.Title fontSize={22} fontWeight="bold" color={colors.text}>
                添加宠物
              </Dialog.Title>
            </XStack>
            <Text fontSize="$3" color="$gray10" marginTop="$1">
              填写宠物信息，建立专属档案
            </Text>
          </YStack>

          {/* Scrollable Form */}
          <ScrollView
            style={{ maxHeight: 450 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            <YStack padding="$5" gap="$4">
              {/* Photo Section */}
              <YStack gap="$3" alignItems="center">
                {photoUri ? (
                  <YStack alignItems="center" gap="$3">
                    <Image source={{ uri: photoUri }} style={styles.petPhoto} resizeMode="cover" />
                    <Button
                      size="$3"
                      variant="outlined"
                      icon={
                        <IconSymbol
                          name="arrow.triangle.2.circlepath"
                          size={18}
                          color={colors.tint}
                        />
                      }
                      onPress={pickPetImage}
                      borderColor={colors.tint}
                      color={colors.tint}
                      backgroundColor="transparent"
                    >
                      更换图片
                    </Button>
                  </YStack>
                ) : (
                  <Button
                    size="$4"
                    width="100%"
                    icon={<IconSymbol name="photo.badge.plus" size={24} color={colors.tint} />}
                    onPress={pickPetImage}
                    borderColor={colors.icon}
                    borderWidth={2}
                    borderStyle="dashed"
                    color={colors.text}
                    backgroundColor="$gray2"
                    paddingVertical="$5"
                  >
                    选择宠物图片（可选）
                  </Button>
                )}
              </YStack>

              {/* Pet Name */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  宠物名称 <Text color="$red10">*</Text>
                </Text>
                <TextInput
                  ref={nameRef}
                  placeholder="给你的宠物取个名字吧"
                  placeholderTextColor={colors.icon}
                  value={nameValue}
                  onChangeText={setNameValue}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  editable={true}
                  selectTextOnFocus={true}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </YStack>

              {/* Species Selection */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  宠物类型 <Text color="$red10">*</Text>
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {SPECIES_OPTIONS.map((opt) => (
                    <Button
                      key={opt.key}
                      size="$3"
                      flex={1}
                      minWidth={100}
                      onPress={() => setSpecies(opt.key)}
                      backgroundColor={species === opt.key ? '$blue9' : '$gray2'}
                      color={species === opt.key ? 'white' : colors.text}
                      borderColor={species === opt.key ? '$blue9' : colors.icon}
                      borderWidth={species === opt.key ? 0 : 1}
                      pressStyle={{ scale: 0.97 }}
                      animation="quick"
                      icon={
                        <IconSymbol
                          name={opt.icon as any}
                          size={20}
                          color={species === opt.key ? 'white' : colors.tint}
                        />
                      }
                    >
                      <Text fontSize="$3" color={species === opt.key ? 'white' : colors.text}>
                        {opt.label}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </YStack>

              {/* Breed */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  品种
                </Text>
                <TextInput
                  ref={breedRef}
                  placeholder="例如：英短、金毛"
                  placeholderTextColor={colors.icon}
                  value={breedValue}
                  onChangeText={setBreedValue}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </YStack>

              {/* Age */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  年龄（岁）
                </Text>
                <TextInput
                  ref={ageRef}
                  placeholder="输入年龄"
                  placeholderTextColor={colors.icon}
                  keyboardType="numeric"
                  value={ageValue}
                  onChangeText={setAgeValue}
                  returnKeyType="done"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </YStack>

              {/* Description */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color={colors.text}>
                  描述
                </Text>
                <TextInput
                  ref={descriptionRef}
                  placeholder="介绍一下你的宠物吧～"
                  placeholderTextColor={colors.icon}
                  value={descriptionValue}
                  onChangeText={setDescriptionValue}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  style={[
                    styles.textArea,
                    {
                      color: colors.text,
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                />
              </YStack>
            </YStack>
          </ScrollView>

          {/* Footer Buttons */}
          <XStack
            gap="$3"
            paddingHorizontal="$5"
            paddingVertical="$4"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            backgroundColor={colors.background}
          >
            <Dialog.Close displayWhenAdapted asChild flex={1}>
              <Button
                size="$4"
                variant="outlined"
                onPress={() => onOpenChange(false)}
                borderColor={colors.icon}
                color={colors.text}
              >
                取消
              </Button>
            </Dialog.Close>

            <Button
              flex={1}
              size="$4"
              backgroundColor="$blue9"
              color="white"
              onPress={handleSubmit}
              disabled={submitting || !nameValue.trim()}
              opacity={submitting || !nameValue.trim() ? 0.5 : 1}
              icon={
                submitting ? undefined : (
                  <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                )
              }
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  petPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f5f5f5',
    borderWidth: 4,
    borderColor: 'white',
  },
});
