import { useState } from 'react';
import { Alert } from 'react-native';

import { supabasePetService, type Pet } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import { petInputSchema, type PetInput } from '@/src/schemas/pet.schema';

/**
 * 宠物管理 Hook
 * 负责宠物的添加、更新等操作
 */
export function usePetManagement() {
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  // 宠物模态框状态
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // 处理添加新宠物
  const handleAddPet = async (petData: PetInput, photoUri: string | null) => {
    try {
      const payload = petInputSchema.parse(petData);

      // 创建宠物
      const { data: pet, error: createError } = await supabasePetService.createPet(payload);
      if (createError || !pet) {
        throw new Error(createError?.message || '创建失败');
      }

      // 如果有照片，上传照片
      if (photoUri) {
        const { data: petWithPhoto, error: uploadError } = await supabasePetService.uploadPetPhoto(
          pet.id,
          photoUri
        );
        if (uploadError) {
          console.warn('照片上传失败:', uploadError);
        } else if (petWithPhoto) {
          setSelectedPet(petWithPhoto);
          await fetchCurrentUser();
          Alert.alert('成功', '已创建宠物');
          return;
        }
      }

      setSelectedPet(pet);
      await fetchCurrentUser();
      Alert.alert('成功', '已创建宠物');
    } catch (e: any) {
      Alert.alert('创建失败', e?.message ?? '请检查表单后重试');
      throw e;
    }
  };

  // 打开添加宠物模态框
  const openAddPetModal = () => {
    setPetModalVisible(true);
  };

  // 关闭添加宠物模态框
  const closeAddPetModal = () => {
    setPetModalVisible(false);
  };

  // 选择宠物
  const selectPet = (pet: Pet | null) => {
    setSelectedPet(pet);
  };

  return {
    petModalVisible,
    selectedPet,
    handleAddPet,
    openAddPetModal,
    closeAddPetModal,
    selectPet,
  };
}
