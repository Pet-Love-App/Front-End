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
 * 宠物服务类
 */
class PetService {
  /**
   * 获取我的宠物列表
   */
  async getMyPets(): Promise<Pet[]> {
    const data = await apiClient.get(API_ENDPOINTS.MY_PETS);
    return data.map((pet: any) => validateResponse<Pet>(pet, petSchema));
  }

  /**
   * 获取所有宠物列表
   */
  async getPets(): Promise<Pet[]> {
    const data = await apiClient.get(API_ENDPOINTS.PETS);
    return data.map((pet: any) => validateResponse<Pet>(pet, petSchema));
  }

  /**
   * 获取宠物详情
   */
  async getPet(petId: number): Promise<Pet> {
    const data = await apiClient.get(API_ENDPOINTS.PET_DETAIL(petId));
    return validateResponse<Pet>(data, petSchema);
  }

  /**
   * 创建宠物
   */
  async createPet(petData: PetInput): Promise<Pet> {
    const data = await apiClient.post(API_ENDPOINTS.PETS, petData);
    return validateResponse<Pet>(data, petSchema);
  }

  /**
   * 更新宠物信息
   */
  async updatePet(petId: number, petData: Partial<PetInput>): Promise<Pet> {
    const data = await apiClient.put(API_ENDPOINTS.PET_DETAIL(petId), petData);
    return validateResponse<Pet>(data, petSchema);
  }

  /**
   * 删除宠物
   */
  async deletePet(petId: number): Promise<DeleteResponse> {
    const data = await apiClient.delete(API_ENDPOINTS.PET_DETAIL(petId));
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

    const data = await apiClient.upload(API_ENDPOINTS.PET_DETAIL(petId), formData);
    return validateResponse<Pet>(data, petSchema);
  }
}

// 导出单例
export const petService = new PetService();

// 重新导出类型
export type { Pet, PetInput } from './types';
