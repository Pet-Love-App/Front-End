import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Dialog, Text, XStack, YStack } from 'tamagui';
import { BreedSelector } from '@/src/components/BreedSelector';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
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

  // 焦点状态
  const [nameFocused, setNameFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

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
          onPress={Keyboard.dismiss}
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
          pointerEvents="auto"
          borderRadius="$6"
          overflow="hidden"
        >
          {/* Header with gradient background */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$6"
            backgroundColor="#FEBE98"
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
                        borderColor="#FEBE98"
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
                        fontWeight="600"
                        paddingHorizontal="$5"
                        pressStyle={{ scale: 0.95, backgroundColor: '#FDB97A' }}
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
                      borderColor="#FEBE98"
                      backgroundColor="#FEF8F3"
                      alignItems="center"
                      justifyContent="center"
                      gap="$3"
                      pressStyle={{ scale: 0.98, backgroundColor: '#FEF3E8' }}
                      onPress={pickPetImage}
                      cursor="pointer"
                    >
                      <YStack
                        width={72}
                        height={72}
                        borderRadius="$12"
                        backgroundColor="#FEBE98"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconSymbol name="photo.fill" size={36} color="white" />
                      </YStack>
                      <Text fontSize={16} fontWeight="700" color="#D97706" letterSpacing={0.3}>
                        添加宠物照片
                      </Text>
                      <Text fontSize={13} color="$gray10" opacity={0.8}>
                        点击上传图片（可选）
                      </Text>
                    </YStack>
                  )}
                </YStack>

                {/* Pet Name */}
                <YStack gap="$2.5">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="textformat" size={18} color="#FEBE98" />
                    <Text fontSize={15} fontWeight="700" color={colors.text}>
                      宠物名称
                    </Text>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      backgroundColor="$red3"
                      borderRadius="$2"
                    >
                      <Text fontSize={11} color="$red11" fontWeight="700">
                        必填
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack
                    borderRadius="$5"
                    borderWidth={2}
                    borderColor={nameFocused ? '#FEBE98' : nameValue ? '#FDB97A' : '$gray5'}
                    backgroundColor={nameFocused ? '#FEF8F3' : colors.background}
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
                      placeholderTextColor={colors.icon + '70'}
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
                      <Text fontSize={12} color="$gray10" fontWeight="500">
                        {nameValue.length}/20
                      </Text>
                    )}
                  </XStack>
                </YStack>

                {/* Species Selection */}
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="pawprint.fill" size={18} color="#FEBE98" />
                    <Text fontSize={15} fontWeight="700" color={colors.text}>
                      宠物类型
                    </Text>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$0.5"
                      backgroundColor="$red3"
                      borderRadius="$2"
                    >
                      <Text fontSize={11} color="$red11" fontWeight="700">
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
                        backgroundColor={species === opt.key ? '#FEBE98' : '$gray2'}
                        borderWidth={2.5}
                        borderColor={species === opt.key ? '#FEBE98' : '$gray4'}
                        pressStyle={{
                          scale: 0.96,
                          backgroundColor: species === opt.key ? '#FDB97A' : '$gray3',
                        }}
                        onPress={() => setSpecies(opt.key)}
                        cursor="pointer"
                      >
                        <Text fontSize={36}>{opt.emoji}</Text>
                        <Text
                          fontSize={13}
                          fontWeight="700"
                          color={species === opt.key ? 'white' : colors.text}
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
                            <IconSymbol name="checkmark.circle.fill" size={16} color="#FEBE98" />
                          </YStack>
                        )}
                      </YStack>
                    ))}
                  </XStack>
                </YStack>

                {/* Breed */}
                <YStack gap="$2.5">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="list.bullet.clipboard" size={18} color="#FEBE98" />
                    <Text fontSize={15} fontWeight="700" color={colors.text}>
                      品种
                    </Text>
                    <Text fontSize={12} color="$gray10" fontWeight="500" opacity={0.7}>
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
                    <IconSymbol name="calendar" size={18} color="#FEBE98" />
                    <Text fontSize={15} fontWeight="700" color={colors.text}>
                      年龄
                    </Text>
                    <Text fontSize={12} color="$gray10" fontWeight="500" opacity={0.7}>
                      （选填）
                    </Text>
                  </XStack>
                  <XStack
                    borderRadius="$5"
                    borderWidth={2}
                    borderColor={ageFocused ? '#FEBE98' : ageValue ? '#FDB97A' : '$gray5'}
                    backgroundColor={ageFocused ? '#FEF8F3' : colors.background}
                    paddingHorizontal="$4"
                    pointerEvents="auto"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={18}>🎂</Text>
                    <TextInput
                      ref={ageRef}
                      placeholder="例如: 2"
                      placeholderTextColor={colors.icon + '70'}
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
                      <Text fontSize={15} color="$gray10" fontWeight="500">
                        岁
                      </Text>
                    )}
                  </XStack>
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
                    pointerEvents="auto"
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
            </TouchableWithoutFeedback>
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
