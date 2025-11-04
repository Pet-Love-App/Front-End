/**
 * API 服务统一导出
 * 方便从一个地方导入所有服务
 */

// 基础 API 客户端
export { apiClient } from './BaseApi';

// 认证服务
export { ApiError, authService } from './auth';
export type { JWTResponse, LoginInput, RefreshTokenInput, RegisterInput, User } from './auth';

// 用户服务
export { petService, userService } from './user';
export type { AvatarUploadResponse, DeleteResponse, Pet, PetInput, UserDetail } from './user';

// 添加剂服务
export { additiveService, searchAdditive, searchIngredient } from './additive';
export type { Additive, SearchResponse } from './additive';
