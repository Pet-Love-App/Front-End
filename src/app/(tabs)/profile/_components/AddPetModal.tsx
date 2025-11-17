import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { PetInput } from '@/src/schemas/pet.schema';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image } from 'react-native';
import { Button, Dialog, Input, XStack, YStack } from 'tamagui';

interface AddPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (petData: PetInput, photoUri: string | null) => Promise<void>;
}

const SPECIES_OPTIONS = [
  { key: 'cat' as const, label: '猫咪', emoji: '🐱' },
  { key: 'dog' as const, label: '狗狗', emoji: '🐶' },
  { key: 'bird' as const, label: '鸟类', emoji: '🐦' },
  { key: 'other' as const, label: '其他', emoji: '🐾' },
];

export function AddPetModal({ open, onOpenChange, onSubmit }: AddPetModalProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const [petForm, setPetForm] = useState<PetInput>({ name: '', species: 'cat' });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!petForm.name.trim()) {
      Alert.alert('提示', '请输入宠物名称');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(petForm, photoUri);
      // Reset form
      setPetForm({ name: '', species: 'cat' });
      setPhotoUri(null);
      onOpenChange(false);
    } catch (e) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

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
          maxWidth={500}
        >
          <Dialog.Title fontSize={20} fontWeight="600" color={colors.text}>
            添加宠物
          </Dialog.Title>

          <YStack gap="$3">
            {/* Pet Name */}
            <Input
              placeholder="宠物名称"
              placeholderTextColor={colors.icon}
              value={petForm.name}
              onChangeText={(t) => setPetForm((s) => ({ ...s, name: t }))}
              size="$4"
              color={colors.text}
              borderColor={colors.icon}
              backgroundColor={colors.background}
              focusStyle={{ borderColor: colors.tint }}
            />

            {/* Photo Picker */}
            <Button
              size="$4"
              variant="outlined"
              icon={<IconSymbol name="photo.badge.plus" size={20} color={colors.text} />}
              onPress={pickPetImage}
              borderColor={colors.icon}
              color={colors.text}
              backgroundColor="transparent"
            >
              {photoUri ? '更换图片' : '选择宠物图片（可选）'}
            </Button>

            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: colors.icon + '20',
                }}
                resizeMode="cover"
              />
            )}

            {/* Species Selection */}
            <XStack gap="$2" flexWrap="wrap">
              {SPECIES_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  size="$3"
                  onPress={() => setPetForm((s) => ({ ...s, species: opt.key }))}
                  backgroundColor={petForm.species === opt.key ? '$blue10' : colors.background}
                  color={petForm.species === opt.key ? 'white' : colors.text}
                  borderColor={petForm.species === opt.key ? '$blue10' : colors.icon}
                  borderWidth={1}
                  pressStyle={{ scale: 0.95 }}
                  animation="quick"
                >
                  {opt.emoji} {opt.label}
                </Button>
              ))}
            </XStack>

            {/* Breed */}
            <Input
              placeholder="品种（可选）"
              placeholderTextColor={colors.icon}
              value={petForm.breed ?? ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, breed: t || undefined }))}
              size="$4"
              color={colors.text}
              borderColor={colors.icon}
              backgroundColor={colors.background}
              focusStyle={{ borderColor: colors.tint }}
            />

            {/* Age */}
            <Input
              placeholder="年龄（数字，可选）"
              placeholderTextColor={colors.icon}
              keyboardType="number-pad"
              value={petForm.age != null ? String(petForm.age) : ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, age: t ? Number(t) : undefined }))}
              size="$4"
              color={colors.text}
              borderColor={colors.icon}
              backgroundColor={colors.background}
              focusStyle={{ borderColor: colors.tint }}
            />

            {/* Description */}
            <Input
              placeholder="描述（可选）"
              placeholderTextColor={colors.icon}
              value={petForm.description ?? ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, description: t || undefined }))}
              size="$4"
              multiline
              minHeight={80}
              color={colors.text}
              borderColor={colors.icon}
              backgroundColor={colors.background}
              focusStyle={{ borderColor: colors.tint }}
              textAlignVertical="top"
            />
          </YStack>

          <XStack gap="$3" justifyContent="flex-end">
            <Dialog.Close displayWhenAdapted asChild>
              <Button variant="outlined" onPress={() => onOpenChange(false)}>
                取消
              </Button>
            </Dialog.Close>

            <Button
              backgroundColor="$blue10"
              color="white"
              onPress={handleSubmit}
              disabled={submitting}
              opacity={submitting ? 0.5 : 1}
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
