/**
 * Supabase 服务统一导出
 *
 * 使用方式：
 * ```typescript
 * import {
 *   supabase,
 *   supabaseAuthService,
 *   supabaseProfileService,
 *   supabaseCatfoodService,
 * } from '@/src/lib/supabase';
 * ```
 */

// ==================== 客户端 ====================
export {
  clearSupabaseAuth,
  getSession,
  initSupabaseAuth,
  isSupabaseConfigured,
  setSupabaseAuth,
  supabase,
} from './client';

// ==================== 辅助函数 ====================
export { convertKeysToCamel, logger, wrapResponse } from './helpers';

// ==================== 认证服务 ====================
export { supabaseAuthService } from './services/auth';
export type {
  AuthErrorDetail,
  AuthResponse,
  AuthSuccessData,
  LoginParams,
  RegisterParams,
  ResetPasswordParams,
  UpdatePasswordParams,
} from './services/auth';

// ==================== 用户 Profile 服务 ====================
export { supabaseProfileService } from './services/profile';
export type { Profile, ProfileDB, UpdateProfileParams, UserWithPets } from './services/profile';

// ==================== 猫粮服务 ====================
export type * from './services/catfood';
export { default as supabaseCatfoodService } from './services/catfood';

// ==================== 宠物服务 ====================
export { supabasePetService } from './services/pet';
export type { PetInput } from './services/pet';

// ==================== 评论服务 ====================
export { supabaseCommentService } from './services/comment';
export type {
  Comment,
  CommentAuthor,
  CommentDB,
  CreateCommentParams,
  GetCommentsParams,
} from './services/comment';

// ==================== 添加剂/营养成分服务 ====================
export { supabaseAdditiveService } from './services/additive';
export type {
  AddAdditiveParams,
  AddIngredientParams,
  Additive,
  AdditiveSearchResponse,
  Ingredient,
  IngredientSearchResponse,
} from './services/additive';

// ==================== 论坛服务 ====================
export { supabaseForumService } from './services/forum';
export type {
  CreatePostParams,
  GetPostsParams,
  MediaFileInput,
  NotificationItem,
  Post,
  PostAuthor,
  PostCategory,
  PostMedia,
  ToggleActionResponse,
  UpdatePostParams,
} from './services/forum';

// ==================== 声望服务 ====================
export {
  REPUTATION_LEVEL_COLORS,
  REPUTATION_LEVEL_NAMES,
  supabaseReputationService,
} from './services/reputation';
export type { ReputationDetail, ReputationLevel, ReputationSummary } from './services/reputation';

// ==================== 宠物健康服务 ====================
export * as supabasePetHealthService from './services/petHealth';
export type {
  CreateHealthRecordParams,
  CreateWeightRecordParams,
  HealthRecordType,
  HealthReminder,
  PetHealthRecord,
  PetMood,
  PetWeightRecord,
  UpdateHealthRecordParams,
  UpdateWeightRecordParams,
  WeightChartDataPoint,
  WeightStatistics,
  WeightUnit,
} from '@/src/types/petHealth';

// ==================== 好友系统服务 ====================
export { supabaseFriendsService } from './services/friends';
export type { Friend, FriendRequest } from './services/friends';

// ==================== 聊天系统服务 ====================
export { supabaseChatService } from './services/chat';
export type { Conversation, Message, UnreadCount } from './services/chat';

// ==================== 关注系统服务 ====================
export { supabaseFollowService } from './services/follow';
export type { Follow, FollowStats } from './services/follow';
