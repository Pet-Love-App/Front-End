import { petInputSchema, type Pet, type PetInput } from '@/src/schemas/pet.schema';
import { petService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { useState } from 'react';
import { Alert } from 'react-native';

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

      // 直接在创建时上传照片（后端支持 multipart/form-data）
      const created = await petService.createPet(payload, photoUri || undefined);

      await fetchCurrentUser();
      Alert.alert('成功', '已创建宠物');
      setSelectedPet(created);
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
