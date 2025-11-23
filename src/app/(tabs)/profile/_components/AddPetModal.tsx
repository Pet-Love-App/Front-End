import { BreedSelector } from '@/src/components/BreedSelector';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { PetInput } from '@/src/schemas/pet.schema';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, TextInput } from 'react-native';
import { Button, Dialog, Text, XStack, YStack } from 'tamagui';

interface AddPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (petData: PetInput, photoUri: string | null) => Promise<void>;
}

const SPECIES_OPTIONS = [
  { key: 'cat' as const, label: '猫咪', icon: 'pawprint.fill', emoji: '🐱', color: '$orange9' },
  { key: 'dog' as const, label: '狗狗', icon: 'pawprint.fill', emoji: '🐶', color: '$brown9' },
  { key: 'bird' as const, label: '鸟类', icon: 'pawprint.fill', emoji: '🐦', color: '$blue9' },
  { key: 'other' as const, label: '其他', icon: 'heart.fill', emoji: '🐾', color: '$purple9' },
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
          {/* Header with gradient background */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$6"
            paddingBottom="$5"
            backgroundColor="#FEBE98"
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
          >
            <XStack alignItems="center" gap="$3">
              <YStack
                width={48}
                height={48}
                borderRadius="$10"
                backgroundColor="rgba(255, 255, 255, 0.2)"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={28}>🐾</Text>
              </YStack>
              <YStack flex={1}>
                <Dialog.Title fontSize={24} fontWeight="bold" color="white">
                  添加宠物
                </Dialog.Title>
                <Text fontSize={14} color="rgba(255, 255, 255, 0.9)" marginTop="$1">
                  为你的爱宠建立专属档案
                </Text>
              </YStack>
            </XStack>
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
              <YStack gap="$3" alignItems="center" marginTop="$2">
                {photoUri ? (
                  <YStack alignItems="center" gap="$3" position="relative">
                    <YStack
                      width={160}
                      height={160}
                      borderRadius="$12"
                      overflow="hidden"
                      borderWidth={4}
                      borderColor="#FEF3E8"
                    >
                      <Image
                        source={{ uri: photoUri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </YStack>
                    <Button
                      size="$3"
                      icon={<IconSymbol name="camera.fill" size={16} color="white" />}
                      onPress={pickPetImage}
                      backgroundColor="#FEBE98"
                      color="white"
                      borderRadius="$10"
                      pressStyle={{ scale: 0.95, opacity: 0.9 }}
                    >
                      更换图片
                    </Button>
                  </YStack>
                ) : (
                  <YStack
                    width="100%"
                    height={180}
                    borderRadius="$4"
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor="#FDB97A"
                    backgroundColor="#FEF3E8"
                    alignItems="center"
                    justifyContent="center"
                    gap="$3"
                    pressStyle={{ scale: 0.98, opacity: 0.8 }}
                    onPress={pickPetImage}
                    cursor="pointer"
                  >
                    <YStack
                      width={64}
                      height={64}
                      borderRadius="$12"
                      backgroundColor="#FEBE98"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconSymbol name="camera.fill" size={32} color="white" />
                    </YStack>
                    <Text fontSize={16} fontWeight="600" color="#D97706">
                      添加宠物照片
                    </Text>
                    <Text fontSize={13} color="$gray10">
                      点击上传图片（可选）
                    </Text>
                  </YStack>
                )}
              </YStack>

              {/* Pet Name */}
              <YStack gap="$2.5">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={15} fontWeight="700" color={colors.text}>
                    宠物名称
                  </Text>
                  <Text fontSize={12} color="$red10" fontWeight="600">
                    必填
                  </Text>
                </XStack>
                <YStack
                  borderRadius="$4"
                  borderWidth={2}
                  borderColor={nameValue ? '#FEBE98' : '$gray6'}
                  backgroundColor={colors.background}
                  paddingHorizontal="$4"
                  paddingVertical="$1"
                >
                  <TextInput
                    ref={nameRef}
                    placeholder="给你的爱宠取个可爱的名字吧 🥰"
                    placeholderTextColor={colors.icon + '80'}
                    value={nameValue}
                    onChangeText={setNameValue}
                    autoCapitalize="none"
                    returnKeyType="done"
                    editable={true}
                    keyboardType="default"
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      height: 48,
                      fontWeight: '500',
                    }}
                  />
                </YStack>
              </YStack>

              {/* Species Selection */}
              <YStack gap="$2.5">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={15} fontWeight="700" color={colors.text}>
                    宠物类型
                  </Text>
                  <Text fontSize={12} color="$red10" fontWeight="600">
                    必选
                  </Text>
                </XStack>
                <XStack gap="$3" flexWrap="wrap">
                  {SPECIES_OPTIONS.map((opt) => (
                    <YStack
                      key={opt.key}
                      flex={1}
                      minWidth={75}
                      maxWidth={85}
                      gap="$2"
                      alignItems="center"
                      padding="$3"
                      borderRadius="$4"
                      backgroundColor={species === opt.key ? '#FEBE98' : '$gray3'}
                      borderWidth={2}
                      borderColor={species === opt.key ? '#FEBE98' : 'transparent'}
                      pressStyle={{ scale: 0.95, opacity: 0.9 }}
                      onPress={() => setSpecies(opt.key)}
                      cursor="pointer"
                    >
                      <Text fontSize={32}>{opt.emoji}</Text>
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={species === opt.key ? 'white' : colors.text}
                      >
                        {opt.label}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>

              {/* Breed */}
              <YStack gap="$2">
                <Text fontSize={15} fontWeight="700" color={colors.text}>
                  品种{' '}
                  <Text fontSize={12} color="$gray10" fontWeight="400">
                    （选填）
                  </Text>
                </Text>
                <BreedSelector
                  species={species}
                  value={breedValue}
                  onChange={setBreedValue}
                  placeholder="选择或输入品种"
                />
              </YStack>

              {/* Age */}
              <YStack gap="$2">
                <Text fontSize={15} fontWeight="700" color={colors.text}>
                  年龄{' '}
                  <Text fontSize={12} color="$gray10" fontWeight="400">
                    （选填）
                  </Text>
                </Text>
                <YStack
                  borderRadius="$4"
                  borderWidth={1.5}
                  borderColor="$gray6"
                  backgroundColor={colors.background}
                  paddingHorizontal="$4"
                >
                  <TextInput
                    ref={ageRef}
                    placeholder="输入年龄（岁）"
                    placeholderTextColor={colors.icon + '80'}
                    keyboardType="numeric"
                    value={ageValue}
                    onChangeText={setAgeValue}
                    returnKeyType="done"
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      height: 48,
                    }}
                  />
                </YStack>
              </YStack>

              {/* Description */}
              <YStack gap="$2" marginBottom="$2">
                <Text fontSize={15} fontWeight="700" color={colors.text}>
                  描述{' '}
                  <Text fontSize={12} color="$gray10" fontWeight="400">
                    （选填）
                  </Text>
                </Text>
                <YStack
                  borderRadius="$4"
                  borderWidth={1.5}
                  borderColor="$gray6"
                  backgroundColor={colors.background}
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                >
                  <TextInput
                    ref={descriptionRef}
                    placeholder="介绍一下你的爱宠吧～性格、习惯、特点等"
                    placeholderTextColor={colors.icon + '80'}
                    value={descriptionValue}
                    onChangeText={setDescriptionValue}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    returnKeyType="default"
                    blurOnSubmit={false}
                    keyboardType="default"
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      minHeight: 100,
                      lineHeight: 22,
                    }}
                  />
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Footer Buttons */}
          <XStack
            gap="$3"
            paddingHorizontal="$5"
            paddingVertical="$5"
            borderTopWidth={1}
            borderTopColor="$gray4"
            backgroundColor={colors.background}
          >
            <Dialog.Close displayWhenAdapted asChild flex={1}>
              <Button
                size="$4"
                onPress={() => onOpenChange(false)}
                backgroundColor="$gray4"
                color={colors.text}
                borderRadius="$4"
                fontWeight="600"
                pressStyle={{ scale: 0.97, opacity: 0.8 }}
              >
                取消
              </Button>
            </Dialog.Close>

            <Button
              flex={1}
              size="$4"
              backgroundColor="#FEBE98"
              color="white"
              borderRadius="$4"
              fontWeight="700"
              onPress={handleSubmit}
              disabled={submitting || !nameValue.trim()}
              opacity={submitting || !nameValue.trim() ? 0.6 : 1}
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
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
