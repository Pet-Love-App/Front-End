import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { petInputSchema, type Pet, type PetInput } from '@/src/schemas/pet.schema';
import { petService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Text, YStack } from 'tamagui';
import { AddPetModal, PetDetailModal, PetList, ProfileHeader } from './_components';

export default function ProfileIndex() {
  const { user, isLoading, fetchCurrentUser, isAuthenticated, _hasHydrated } = useUserStore();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // Pet management states
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Load user data on mount
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) return;
    if (!user) {
      fetchCurrentUser().catch((e) => {
        console.warn('获取用户信息失败', e);
      });
    }
  }, [user, fetchCurrentUser, isAuthenticated, _hasHydrated]);

  // Handle adding new pet
  const handleAddPet = async (petData: PetInput, photoUri: string | null) => {
    try {
      const payload = petInputSchema.parse(petData);
      let created = await petService.createPet(payload);

      // Upload photo if provided
      if (photoUri) {
        try {
          created = await petService.uploadPetPhoto(created.id, photoUri);
        } catch (e) {
          console.warn('宠物照片上传失败', e);
        }
      }

      await fetchCurrentUser();
      Alert.alert('成功', '已创建宠物');
      setSelectedPet(created);
    } catch (e: any) {
      Alert.alert('创建失败', e?.message ?? '请检查表单后重试');
      throw e;
    }
  };

  // Not authenticated view
  if (_hasHydrated && !isAuthenticated) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.background}
        alignItems="center"
        justifyContent="center"
        padding="$6"
      >
        <YStack alignItems="center" gap="$4" maxWidth={400}>
          <Text fontSize={24} fontWeight="700" color={colors.text}>
            会话已过期
          </Text>
          <Text fontSize={16} color={colors.icon} textAlign="center">
            您的登录状态已失效，请重新登录以继续查看个人资料与宠物信息。
          </Text>
          <Button
            size="$5"
            backgroundColor="$blue10"
            color="white"
            onPress={() => router.replace('/login')}
            marginTop="$4"
          >
            前往登录
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <ScrollView
      flex={1}
      backgroundColor={colors.background}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 30,
      }}
    >
      <YStack flex={1} alignItems="center" position="relative">
        {/* Settings Button - Fixed Top Right */}
        <YStack width="90%" alignItems="flex-end" marginBottom="$4" marginTop={-10}>
          <TouchableOpacity
            onPress={() => router.push('/profile/settings' as any)}
            activeOpacity={0.7}
          >
            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor={colors.background}
              borderWidth={1}
              borderColor={colors.icon + '40'}
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <Ionicons name="settings-outline" size={24} color={colors.icon} />
            </YStack>
          </TouchableOpacity>
        </YStack>

        {/* Profile Header - Integrated Avatar & User Info */}
        <ProfileHeader
          username={user?.username}
          bio="宠物爱好者 🐾"
          onAvatarUpdate={fetchCurrentUser}
          onEditProfile={() => router.push('/profile/settings' as any)}
        />

        {/* Pet List */}
        <PetList
          pets={user?.pets}
          isLoading={isLoading && !user}
          onAddPet={() => setPetModalVisible(true)}
          onPetPress={setSelectedPet}
        />
      </YStack>

      {/* Modals */}
      <AddPetModal
        open={petModalVisible}
        onOpenChange={setPetModalVisible}
        onSubmit={handleAddPet}
      />

      <PetDetailModal
        pet={selectedPet}
        open={!!selectedPet}
        onOpenChange={(open) => !open && setSelectedPet(null)}
      />
    </ScrollView>
  );
}
