import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '@/src/components/dialogs';
import { Dialog, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { BreedSelector } from '@/src/components/BreedSelector';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { PetInput } from '@/src/schemas/pet.schema';

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
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // 使用非受控组件，避免实时状态更新导致重渲染
  const nameRef = useRef<TextInput>(null);
  const _breedRef = useRef<TextInput>(null);
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

  // 焦点状态
  const [nameFocused, setNameFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);

  const pickPetImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        showAlert({
          title: '需要权限',
          message: '请允许访问相册以选择宠物图片',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('canceled' in result && !result.canceled && result.assets?.[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (_e) {
      console.warn(_e);
    }
  };

  const handleSubmit = async () => {
    // 从 state 中获取值（这些值不会导致重渲染问题）
    const name = nameValue.trim();

    if (!name) {
      showAlert({
        title: '提示',
        message: '请输入宠物名称',
        type: 'warning',
      });
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
    } catch (_e) {
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
          onPress={Keyboard.dismiss}
        />

        <Dialog.Content
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          backgroundColor={colors.background as any}
          width={dialogWidth}
          maxHeight="85%"
          padding="$0"
          pointerEvents="auto"
          borderRadius="$6"
          overflow="hidden"
        >
          {/* Header with gradient background */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$6"
            backgroundColor={colors.primary as any}
            position="relative"
          >
            <XStack alignItems="center" gap="$3" marginBottom="$1">
              <YStack
                width={56}
                height={56}
                borderRadius="$12"
                backgroundColor="rgba(255, 255, 255, 0.25)"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={32}>🐾</Text>
              </YStack>
              <YStack flex={1}>
                <Dialog.Title fontSize={26} fontWeight="bold" color="white" letterSpacing={0.5}>
                  添加宠物
                </Dialog.Title>
                <Text fontSize={14} color="rgba(255, 255, 255, 0.95)" marginTop="$1.5">
                  为你的爱宠建立专属档案 ✨
                </Text>
              </YStack>
              <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
                <YStack
                  width={36}
                  height={36}
                  borderRadius="$10"
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', scale: 0.95 }}
                  cursor="pointer"
                >
                  <IconSymbol name="xmark" size={18} color="white" />
                </YStack>
              </TouchableWithoutFeedback>
            </XStack>
          </YStack>

          {/* Scrollable Form */}
          <ScrollView
            style={{ maxHeight: 450 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            contentContainerStyle={{ pointerEvents: 'auto' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <YStack padding="$5" gap="$4">
                {/* Photo Section */}
                <YStack gap="$3" alignItems="center" marginTop="$1">
                  {photoUri ? (
                    <YStack alignItems="center" gap="$3.5" position="relative">
                      <YStack
                        width={140}
                        height={140}
                        borderRadius="$12"
                        overflow="hidden"
                        borderWidth={3}
                        borderColor={colors.primary as any}
                      >
                        <Image
                          source={{ uri: photoUri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </YStack>
                      <Button
                        size="$3"
                        height={40}
                        fontSize={14}
                        icon={<IconSymbol name="camera.fill" size={16} color="white" />}
                        onPress={pickPetImage}
                        backgroundColor={colors.primary as any}
                        color="white"
                        borderRadius="$10"
                        fontWeight="600"
                        paddingHorizontal="$5"
                        pressStyle={{ scale: 0.95, backgroundColor: colors.primaryDark as any }}
                      >
                        更换图片
                      </Button>
                    </YStack>
                  ) : (
                    <YStack
                      width="100%"
                      height={160}
                      borderRadius="$5"
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor={colors.primary as any}
                      backgroundColor={colors.backgroundMuted as any}
                      alignItems="center"
                      justifyContent="center"
                      gap="$3"
                      pressStyle={{ scale: 0.98, backgroundColor: colors.hover as any }}
                      onPress={pickPetImage}
                      cursor="pointer"
                    >
                      <YStack
                        width={72}
                        height={72}
                        borderRadius="$12"
                        backgroundColor={colors.primary as any}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="photo.fill" size={36} color="white" />
                      </YStack>
                      <Text
                        fontSize={16}
                        fontWeight="700"
                        color={colors.primary as any}
                        letterSpacing={0.3}
                      >
                        添加宠物照片
                      </Text>
                      <Text fontSize={13} color={colors.textTertiary as any} opacity={0.8}>
                        点击上传图片（可选）
                      </Text>
                    </YStack>
                  )}
                </YStack>

                {/* Pet Name */}
                <YStack gap="$2.5">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="textformat" size={18} color={colors.primary} />
                    <Text fontSize={15} fontWeight="700" color={colors.text as any}>
                      宠物名称
                    </Text>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      backgroundColor={colors.errorMuted as any}
                      borderRadius="$2"
                    >
                      <Text fontSize={11} color={colors.error as any} fontWeight="700">
                        必填
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack
                    borderRadius="$5"
                    borderWidth={2}
                    borderColor={
                      (nameFocused
                        ? colors.primary
                        : nameValue
                          ? colors.primaryLight
                          : colors.border) as any
                    }
                    backgroundColor={
                      (nameFocused ? colors.backgroundMuted : colors.background) as any
                    }
                    paddingHorizontal="$4"
                    paddingVertical="$1"
                    pointerEvents="auto"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={20}>
                      {species === 'cat'
                        ? '🐱'
                        : species === 'dog'
                          ? '🐶'
                          : species === 'bird'
                            ? '🐦'
                            : '🐾'}
                    </Text>
                    <TextInput
                      ref={nameRef}
                      placeholder="给爱宠取个名字吧"
                      placeholderTextColor={colors.textMuted}
                      value={nameValue}
                      onChangeText={setNameValue}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      autoCapitalize="words"
                      returnKeyType="done"
                      editable={true}
                      keyboardType="default"
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontSize: 16,
                        height: 48,
                        fontWeight: '600',
                      }}
                    />
                    {nameValue.length > 0 && (
                      <Text fontSize={12} color={colors.textTertiary as any} fontWeight="500">
                        {nameValue.length}/20
                      </Text>
                    )}
                  </XStack>
                </YStack>

                {/* Species Selection */}
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="pawprint.fill" size={18} color={colors.primary} />
                    <Text fontSize={15} fontWeight="700" color={colors.text as any}>
                      宠物类型
                    </Text>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      backgroundColor={colors.errorMuted as any}
                      borderRadius="$2"
                    >
                      <Text fontSize={11} color={colors.error as any} fontWeight="700">
                        必选
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack gap="$2.5" flexWrap="wrap" justifyContent="space-between">
                    {SPECIES_OPTIONS.map((opt) => (
                      <YStack
                        key={opt.key}
                        flex={1}
                        minWidth={72}
                        maxWidth={90}
                        gap="$2.5"
                        alignItems="center"
                        paddingVertical="$4"
                        paddingHorizontal="$2"
                        borderRadius="$5"
                        backgroundColor={
                          (species === opt.key ? colors.primary : colors.backgroundMuted) as any
                        }
                        borderWidth={2.5}
                        borderColor={
                          (species === opt.key ? colors.primary : colors.borderMuted) as any
                        }
                        pressStyle={{
                          scale: 0.96,
                          backgroundColor: (species === opt.key
                            ? colors.primaryDark
                            : colors.hover) as any,
                        }}
                        onPress={() => setSpecies(opt.key)}
                        cursor="pointer"
                      >
                        <Text fontSize={36}>{opt.emoji}</Text>
                        <Text
                          fontSize={13}
                          fontWeight="700"
                          color={(species === opt.key ? 'white' : colors.text) as any}
                          letterSpacing={0.3}
                        >
                          {opt.label}
                        </Text>
                        {species === opt.key && (
                          <YStack
                            position="absolute"
                            top={6}
                            right={6}
                            backgroundColor="white"
                            borderRadius="$10"
                            padding="$1"
                          >
                            <IconSymbol
                              name="checkmark.circle.fill"
                              size={16}
                              color={colors.primary}
                            />
                          </YStack>
                        )}
                      </YStack>
                    ))}
                  </XStack>
                </YStack>

                {/* Breed */}
                <YStack gap="$2.5">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="list.bullet.clipboard" size={18} color={colors.primary} />
                    <Text fontSize={15} fontWeight="700" color={colors.text as any}>
                      品种
                    </Text>
                    <Text
                      fontSize={12}
                      color={colors.textTertiary as any}
                      fontWeight="500"
                      opacity={0.7}
                    >
                      （选填）
                    </Text>
                  </XStack>
                  <BreedSelector
                    species={species}
                    value={breedValue}
                    onChange={setBreedValue}
                    placeholder="选择或输入品种"
                  />
                </YStack>

                {/* Age */}
                <YStack gap="$2.5">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="calendar" size={18} color={colors.primary} />
                    <Text fontSize={15} fontWeight="700" color={colors.text as any}>
                      年龄
                    </Text>
                    <Text
                      fontSize={12}
                      color={colors.textTertiary as any}
                      fontWeight="500"
                      opacity={0.7}
                    >
                      （选填）
                    </Text>
                  </XStack>
                  <XStack
                    borderRadius="$5"
                    borderWidth={2}
                    borderColor={
                      (ageFocused
                        ? colors.primary
                        : ageValue
                          ? colors.primaryLight
                          : colors.border) as any
                    }
                    backgroundColor={
                      (ageFocused ? colors.backgroundMuted : colors.background) as any
                    }
                    paddingHorizontal="$4"
                    pointerEvents="auto"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={18}>🎂</Text>
                    <TextInput
                      ref={ageRef}
                      placeholder="例如: 2"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={ageValue}
                      onChangeText={setAgeValue}
                      onFocus={() => setAgeFocused(true)}
                      onBlur={() => setAgeFocused(false)}
                      returnKeyType="done"
                      maxLength={3}
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontSize: 16,
                        height: 48,
                        fontWeight: '600',
                      }}
                    />
                    {ageValue && (
                      <Text fontSize={15} color={colors.textTertiary as any} fontWeight="500">
                        岁
                      </Text>
                    )}
                  </XStack>
                </YStack>

                {/* Description */}
                <YStack gap="$2.5" marginBottom="$2">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="text.bubble" size={18} color={colors.primary} />
                    <Text fontSize={15} fontWeight="700" color={colors.text as any}>
                      描述
                    </Text>
                    <Text
                      fontSize={12}
                      color={colors.textTertiary as any}
                      fontWeight="500"
                      opacity={0.7}
                    >
                      （选填）
                    </Text>
                  </XStack>
                  <YStack
                    borderRadius="$5"
                    borderWidth={2}
                    borderColor={(descriptionValue ? colors.primaryLight : colors.border) as any}
                    backgroundColor={colors.background as any}
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    pointerEvents="auto"
                  >
                    <TextInput
                      ref={descriptionRef}
                      placeholder="介绍一下你的爱宠吧～性格、习惯、特点等"
                      placeholderTextColor={colors.textMuted}
                      value={descriptionValue}
                      onChangeText={setDescriptionValue}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      autoCapitalize="none"
                      returnKeyType="default"
                      keyboardType="default"
                      style={{
                        color: colors.text,
                        fontSize: 15,
                        minHeight: 100,
                        lineHeight: 22,
                        fontWeight: '500',
                      }}
                    />
                    {descriptionValue.length > 0 && (
                      <Text
                        fontSize={11}
                        color={colors.textTertiary as any}
                        fontWeight="500"
                        textAlign="right"
                        marginTop="$2"
                      >
                        {descriptionValue.length}/200
                      </Text>
                    )}
                  </YStack>
                </YStack>
              </YStack>
            </TouchableWithoutFeedback>
          </ScrollView>

          {/* Footer Buttons */}
          <XStack
            gap="$3"
            paddingHorizontal="$5"
            paddingVertical="$5"
            borderTopWidth={1}
            borderTopColor={colors.border as any}
            backgroundColor={colors.background as any}
          >
            <Dialog.Close displayWhenAdapted asChild flex={1}>
              <Button
                size="$4"
                height={52}
                fontSize={16}
                onPress={() => onOpenChange(false)}
                backgroundColor={colors.border as any}
                color={colors.text as any}
                borderRadius="$5"
                fontWeight="600"
                pressStyle={{ scale: 0.97, opacity: 0.8 }}
              >
                取消
              </Button>
            </Dialog.Close>

            <Button
              flex={1}
              size="$4"
              height={52}
              fontSize={16}
              backgroundColor={colors.primary as any}
              color="white"
              borderRadius="$5"
              fontWeight="700"
              onPress={handleSubmit}
              disabled={submitting || !nameValue.trim()}
              opacity={submitting || !nameValue.trim() ? 0.6 : 1}
              pressStyle={{ scale: 0.97, opacity: 0.9, backgroundColor: colors.primaryDark as any }}
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
