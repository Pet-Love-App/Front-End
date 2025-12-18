/**
 * Supabase 数据库类型定义
 *
 * 说明：
 * - 这些类型对应数据库的实际响应结构（snake_case）
 * - 使用 convertKeysToCamel() 转换为前端使用的 camelCase 类型
 * - 所有日期字段为 ISO 8601 字符串格式
 *
 * @module database-types
 */

// ==================== 用户相关 ====================

export interface DbUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  phone?: string | null;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DbUserProfile extends DbUser {
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  reputation_score?: number;
}

// ==================== 宠物相关 ====================

export interface DbPet {
  id: number;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed?: string | null;
  age?: number | null;
  photo_url?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 帖子相关 ====================

export interface DbPostMedia {
  id: number;
  post_id: number;
  media_type: 'image' | 'video';
  file_url: string;
  thumbnail_url?: string | null; // 视频缩略图 URL
  created_at: string;
}

export interface DbPost {
  id: number;
  content: string;
  author_id: string;
  author?: DbUser | null;
  post_media?: DbPostMedia[];
  created_at: string;
  updated_at: string;
}

export interface DbPostFavorite {
  id: number;
  user_id: string;
  post_id: number;
  post?: DbPost | null;
  created_at: string;
}

// ==================== 评论相关 ====================

export interface DbComment {
  id: number;
  content: string;
  author_id: string;
  author?: DbUser | null;
  target_type: 'post' | 'catfood' | 'report';
  target_id: number;
  parent_id: number | null;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface DbCommentLike {
  id: number;
  comment_id: number;
  user_id: string;
  created_at: string;
}

// ==================== 猫粮相关 ====================

export interface DbIngredient {
  id: number;
  name: string;
  type?: string | null;
  label?: string | null;
  description?: string | null;
}

export interface DbAdditive {
  id: number;
  name: string;
  en_name?: string | null;
  applicable_range?: string | null;
  type?: string | null;
}

export interface DbCatfoodTag {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface DbCatfoodIngredientRelation {
  id: number;
  catfood_id: number;
  ingredient_id: number;
  amount?: string | null;
  order?: number;
  ingredient?: DbIngredient;
}

export interface DbCatfoodAdditiveRelation {
  id: number;
  catfood_id: number;
  additive_id: number;
  amount?: string | null;
  order?: number;
  additive?: DbAdditive;
}

export interface DbCatfoodTagRelation {
  id: number;
  catfood_id: number;
  tag_id: number;
  created_at?: string;
  tag?: DbCatfoodTag;
}

export interface DbCatfood {
  id: number;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  score?: number | null;
  count_num?: number | null;
  percentage?: boolean | null;
  // 营养成分
  crude_protein?: number | null;
  crude_fat?: number | null;
  crude_fiber?: number | null;
  crude_ash?: number | null;
  carbohydrates?: number | null;
  others?: number | null;
  // 分析结果
  safety?: string | null;
  nutrient?: string | null;
  // 关联数据
  catfood_ingredients?: DbCatfoodIngredientRelation[];
  catfood_additives?: DbCatfoodAdditiveRelation[];
  catfood_tag_relations?: DbCatfoodTagRelation[];
  created_at: string;
  updated_at: string;
}

export interface DbCatfoodFavorite {
  id: number;
  user_id: string;
  catfood_id: number;
  catfood?: DbCatfood | null;
  created_at: string;
}

export interface DbCatfoodLike {
  id: number;
  user_id: string;
  catfood_id: number;
  catfood?: DbCatfood | null;
  created_at: string;
}

export interface DbCatfoodRating {
  id: number;
  catfood_id: number;
  user_id: string;
  score: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 通知相关 ====================

export interface DbNotification {
  id: number;
  recipient_id: string;
  actor_id: string;
  actor?: DbUser | null;
  verb: 'comment_post' | 'reply_comment';
  post_id?: number | null;
  comment_id?: number | null;
  unread: boolean;
  created_at: string;
}

// ==================== 声望相关 ====================

export interface DbReputationSummary {
  id: number;
  user_id: string;
  score: number;
  profile_completeness: number;
  review_quality: number;
  community_contribution: number;
  compliance: number;
  level: string;
  updated_at: string;
}

export interface DbBadge {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  enabled: boolean;
  rule?: Record<string, unknown> | null;
}

export interface DbUserBadge {
  id: number;
  user_id: string;
  badge_id: number;
  badge?: DbBadge;
  acquired_at: string;
  is_equipped: boolean;
}

// ==================== AI 报告相关 ====================

export interface DbAiReport {
  id: number;
  catfood_id: number;
  ingredients_text: string;
  tags?: unknown[] | null;
  additives?: unknown[] | null;
  ingredients?: unknown[] | null;
  safety?: string | null;
  nutrient?: string | null;
  percentage?: boolean | null;
  percent_data?: Record<string, number | null> | null;
  created_at: string;
  updated_at: string;
}

export interface DbFavoriteReport {
  id: number;
  user_id: string;
  report_id: number;
  report?: DbAiReport | null;
  created_at: string;
}

// ==================== 类型守卫 ====================

export function isDbPost(value: unknown): value is DbPost {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'content' in value &&
    'author_id' in value
  );
}

export function isDbUser(value: unknown): value is DbUser {
  return typeof value === 'object' && value !== null && 'id' in value && 'username' in value;
}

export function isDbComment(value: unknown): value is DbComment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'content' in value &&
    'author_id' in value &&
    'target_type' in value
  );
}

export function isDbCatfood(value: unknown): value is DbCatfood {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value;
}

export function isDbNotification(value: unknown): value is DbNotification {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'recipient_id' in value &&
    'verb' in value
  );
}
