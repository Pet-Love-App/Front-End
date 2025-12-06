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
  email?: string;
  bio?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DbUserProfile extends DbUser {
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  reputation_score?: number;
}

// ==================== 帖子相关 ====================

export interface DbPostMedia {
  id: number;
  post_id: number;
  media_type: 'image' | 'video';
  file: string;
  created_at: string;
}

export interface DbPost {
  id: number;
  content: string;
  author_id: string;
  author?: DbUser | null;
  post_media?: DbPostMedia[];
  favorites_count: number;
  comments_count?: number;
  likes_count?: number;
  category?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface DbPostFavorite {
  id: number;
  user_id: string;
  post_id: number;
  post: DbPost | null;
  created_at: string;
}

// ==================== 评论相关 ====================

export interface DbComment {
  id: number;
  content: string;
  author_id: string;
  author?: DbUser | null;
  post_id?: number | null;
  catfood_id?: number | null;
  parent_id: number | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

// ==================== 猫粮相关 ====================

export interface DbIngredient {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  created_at: string;
}

export interface DbAdditive {
  id: number;
  name: string;
  description?: string | null;
  safety_level?: string | null;
  created_at: string;
}

export interface DbTag {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface DbCatfoodIngredientRelation {
  id: number;
  catfood_id: number;
  ingredient_id: number;
  ingredient: DbIngredient;
}

export interface DbCatfoodAdditiveRelation {
  id: number;
  catfood_id: number;
  additive_id: number;
  additive: DbAdditive;
}

export interface DbCatfoodTagRelation {
  id: number;
  catfood_id: number;
  tag_id: number;
  tag: DbTag;
}

export interface DbCatfood {
  id: number;
  name: string;
  brand: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | null;
  spec?: string | null;
  ingredients_text?: string | null;
  // 营养成分
  crude_protein?: number | null;
  crude_fat?: number | null;
  crude_fiber?: number | null;
  crude_ash?: number | null;
  moisture?: number | null;
  carbohydrates?: number | null;
  others?: number | null;
  // 关联数据
  catfood_ingredients?: DbCatfoodIngredientRelation[];
  catfood_additives?: DbCatfoodAdditiveRelation[];
  catfood_tags?: DbCatfoodTagRelation[];
  ingredients?: DbCatfoodIngredientRelation[];
  additives?: DbCatfoodAdditiveRelation[];
  tags?: DbCatfoodTagRelation[];
  // 统计数据
  like_count: number;
  rating_count: number;
  avg_rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbCatfoodFavorite {
  id: string;
  user_id: string;
  catfood_id: string;
  catfood: DbCatfood;
  created_at: string;
}

export interface DbCatfoodLike {
  id: string;
  user_id: string;
  catfood_id: string;
  catfood: DbCatfood;
  created_at: string;
}

// ==================== 通知相关 ====================

export interface DbNotification {
  id: number;
  user_id: string;
  actor_id: string;
  actor?: DbUser | null;
  type: 'like' | 'comment' | 'follow' | 'reply';
  target_type: 'post' | 'comment' | 'user';
  target_id: number | string;
  content?: string | null;
  is_read: boolean;
  created_at: string;
}

// ==================== 声望相关 ====================

export interface DbReputationDetail {
  rank?: number;
  user_id: string;
  username: string;
  avatar_url?: string | null;
  reputation_score: number;
  post_count?: number;
  comment_count?: number;
  like_received_count?: number;
}

// ==================== AI 报告相关 ====================

export interface DbAiReport {
  id: number;
  catfood_id: number;
  catfood_name: string;
  ingredients_text: string;
  tags: string[];
  additives: string[];
  ingredients: string[];
  safety: string;
  nutrient: string;
  percentage: boolean;
  percent_data: Record<string, number | null>;
  created_at: string;
  updated_at: string;
}

export interface DbAiReportFavorite {
  id: number;
  user_id: string;
  report_id: number;
  catfood_id: number;
  report: DbAiReport;
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
    'author_id' in value
  );
}

export function isDbCatfood(value: unknown): value is DbCatfood {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'brand' in value
  );
}

export function isDbNotification(value: unknown): value is DbNotification {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'user_id' in value &&
    'type' in value
  );
}
