/**
 * API 服务统一导出
 * 方便从一个地方导入所有服务
 */

// 认证服务
export { ApiError, authService } from './auth';
export type { JWTResponse, LoginInput, RefreshTokenInput, RegisterInput } from './auth';

// 用户服务
export { userService } from './user';
export type { AvatarUploadResponse, DeleteResponse, User } from './user';

// 宠物服务
export { petService } from './pet';
export type { Pet, PetInput } from './pet';

// 添加剂服务
export { additiveService, searchAdditive, searchIngredient } from './additive';
export type { Additive, Ingredient } from './additive';

// 收藏服务
export { collectApi } from './collect';
export type {
  CheckFavoriteResponse,
  Favorite,
  GetFavoritesResponse,
  ToggleFavoriteResponse,
} from './collect';

// 评论服务
export { commentService } from './comment';
export type {
  Comment,
  CommentAuthor,
  CreateCommentRequest,
  DeleteCommentResponse,
  GetCommentsResponse,
  UpdateCommentRequest,
} from './comment';

// 猫粮服务
export { catFoodService, getCatFood, getCatFoods, patchCatFood, searchCatFood } from './catfood';
export type { CatFood, GetCatFoodsResponse, SearchCatFoodParams } from './catfood';

// OCR 服务
export { ocrService, recognizeImage } from './ocr';
export type { OcrRecognizeResponse, OcrResult } from './ocr';
