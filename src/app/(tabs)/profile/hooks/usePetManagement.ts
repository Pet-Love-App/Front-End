import { useState } from 'react';

import { supabasePetService } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import { petInputSchema, type PetInput, type Pet } from '@/src/schemas/pet.schema';
import { toast } from '@/src/components/dialogs';

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
          console.error('照片上传失败:', uploadError);
          // 宠物已创建，但照片上传失败
          setSelectedPet(pet);
          await fetchCurrentUser();
          toast.warning('宠物已创建，但照片上传失败', uploadError.message || '请稍后重新上传');
          return;
        }
        if (petWithPhoto) {
          setSelectedPet(petWithPhoto);
          await fetchCurrentUser();
          toast.success('已创建宠物');
          return;
        }
      }

      setSelectedPet(pet);
      await fetchCurrentUser();
      toast.success('已创建宠物');
    } catch (e: any) {
      toast.error('创建失败', e?.message ?? '请检查表单后重试');
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

  // 删除宠物
  const handleDeletePet = async (petId: number) => {
    try {
      const { error } = await supabasePetService.deletePet(petId);
      if (error) {
        throw new Error(error.message || '删除失败');
      }

      // 如果删除的是当前选中的宠物，清空选中状态
      if (selectedPet?.id === petId) {
        setSelectedPet(null);
      }

      await fetchCurrentUser();
      toast.success('已删除宠物');
    } catch (e: any) {
      toast.error('删除失败', e?.message ?? '请稍后重试');
      throw e;
    }
  };

  return {
    petModalVisible,
    selectedPet,
    handleAddPet,
    handleDeletePet,
    openAddPetModal,
    closeAddPetModal,
    selectPet,
  };
}
