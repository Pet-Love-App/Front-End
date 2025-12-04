import { API_ENDPOINTS } from '@/src/config/api';
import { petSchema, type Pet, type PetInput } from '@/src/schemas/pet.schema';
import { deleteResponseSchema, type DeleteResponse } from '@/src/schemas/user.schema';
import { apiClient } from '../BaseApi';

/**
 * 处理响应并验证 Schema
 */
function validateResponse<T>(data: any, schema: any): T {
  try {
    return schema.parse(data);
  } catch (error: any) {
    console.error('数据验证失败:', error);
    throw new Error('服务器返回数据格式错误');
  }
}

/**
 * 宠物服务类（适配新的 Supabase API）
 */
class PetService {
  /**
   * 获取我的宠物列表
   */
  async getMyPets(): Promise<Pet[]> {
    const data = await apiClient.get(API_ENDPOINTS.PET.MY_PETS);
    // 后端返回 { pets: [...] }
    const pets = data.pets || data;
    return Array.isArray(pets) ? pets.map((pet: any) => validateResponse<Pet>(pet, petSchema)) : [];
  }

  /**
   * 获取所有宠物列表
   */
  async getPets(): Promise<Pet[]> {
    const data = await apiClient.get(API_ENDPOINTS.PET.LIST);
    const pets = data.pets || data;
    return Array.isArray(pets) ? pets.map((pet: any) => validateResponse<Pet>(pet, petSchema)) : [];
  }

  /**
   * 获取宠物详情
   */
  async getPet(petId: number): Promise<Pet> {
    const data = await apiClient.get(API_ENDPOINTS.PET.DETAIL(petId));
    const pet = data.pet || data;
    return validateResponse<Pet>(pet, petSchema);
  }

  /**
   * 创建宠物（支持直接上传照片）
   * @param petData 宠物数据
   * @param photoUri 可选的宠物照片 URI
   */
  async createPet(petData: PetInput, photoUri?: string): Promise<Pet> {
    if (photoUri) {
      // 使用 multipart/form-data 创建宠物并上传照片
      const formData = new FormData();
      formData.append('name', petData.name);
      formData.append('species', petData.species || 'cat');
      if (petData.breed) formData.append('breed', petData.breed);
      if (petData.age) formData.append('age', petData.age.toString());
      if (petData.description) formData.append('description', petData.description);

      const uriParts = photoUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('photo', {
        uri: photoUri,
        name: `pet_photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const data = await apiClient.upload(API_ENDPOINTS.PET.CREATE, formData);
      const pet = data.pet || data;
      return validateResponse<Pet>(pet, petSchema);
    } else {
      // 使用 JSON 创建宠物
      const data = await apiClient.post(API_ENDPOINTS.PET.CREATE, petData);
      const pet = data.pet || data;
      return validateResponse<Pet>(pet, petSchema);
    }
  }

  /**
   * 更新宠物信息
   */
  async updatePet(petId: number, petData: Partial<PetInput>): Promise<Pet> {
    const data = await apiClient.put(API_ENDPOINTS.PET.UPDATE(petId), petData);
    const pet = data.pet || data;
    return validateResponse<Pet>(pet, petSchema);
  }

  /**
   * 删除宠物
   */
  async deletePet(petId: number): Promise<DeleteResponse> {
    const data = await apiClient.delete(API_ENDPOINTS.PET.DELETE(petId));
    return validateResponse<DeleteResponse>(data, deleteResponseSchema);
  }

  /**
   * 上传宠物照片
   * @param petId 宠物 ID
   * @param imageUri 图片的本地 URI
   */
  async uploadPetPhoto(petId: number, imageUri: string): Promise<Pet> {
    const formData = new FormData();

    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('photo', {
      uri: imageUri,
      name: `pet_photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const data = await apiClient.upload(API_ENDPOINTS.PET.UPLOAD_PHOTO(petId), formData);
    const pet = data.pet || data;
    return validateResponse<Pet>(pet, petSchema);
  }

  /**
   * 删除宠物照片
   * @param petId 宠物 ID
   */
  async deletePetPhoto(petId: number): Promise<{ message: string }> {
    return await apiClient.delete(API_ENDPOINTS.PET.DELETE_PHOTO(petId));
  }
}

// 导出单例
export const petService = new PetService();

// 重新导出类型
export type { Pet, PetInput } from './types';
