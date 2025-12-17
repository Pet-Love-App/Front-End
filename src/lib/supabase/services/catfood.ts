/**
 * 猫粮相关 Supabase 服务
 * 替代 Django API 的直连Supabase版本
 */

import { supabase } from '../client';
import {
  calculatePagination,
  convertKeysToCamel,
  handleSupabaseError,
  logger,
  type PaginationParams,
} from '../helpers';

import type {
  DbCatfoodAdditiveRelation,
  DbCatfoodFavorite,
  DbCatfoodIngredientRelation,
  DbCatfoodLike,
  DbCatfoodTagRelation,
  DbCatfoodRating,
} from '../types/database';

import { recalculateReputation, logAbnormalBehavior } from './reputation';

// 扩展类型定义 - 解决嵌套数据访问问题
interface ProfileWithReputation {
  reputation_summary?: {
    score?: number;
  }[];
}

interface RatingWithUser {
  score: number;
  user?: ProfileWithReputation;
}

/**
 * 创建猫粮评分（新增异常检测）
 */
export const createRating = async (
  catfoodId: string,
  score: number,
  review?: string,
  imageUrls?: string[]
) => {
  // 修正：正确获取用户信息
  const userResponse = await supabase.auth.getUser();
  if (userResponse.error || !userResponse.data.user) {
    return { data: null, error: { message: '未登录' } };
  }

  const userId = userResponse.data.user.id;

  // 1. 检测异常评分行为
  // 检测24小时内评分数量
  const { data: recentRatings } = await supabase
    .from('catfood_ratings')
    .select('score, created_at')
    .eq('user_id', userId)
    .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  // 记录异常行为：1天内超过5条评分
  if (recentRatings && recentRatings.length > 5) {
    await logAbnormalBehavior(userId, 'excessive_ratings', {
      count: recentRatings.length,
      timeFrame: '24h',
    });
  }

  // 检测极端评分集中
  if (recentRatings && recentRatings.length > 3) {
    const extremeRatio =
      recentRatings.filter((r) => r.score === 1 || r.score === 5).length / recentRatings.length;
    if (extremeRatio > 0.8) {
      await logAbnormalBehavior(userId, 'extreme_rating_concentration', {
        ratio: extremeRatio,
        count: recentRatings.length,
      });
    }
  }

  // 2. 创建评分
  const { data, error } = await supabase
    .from('catfood_ratings')
    .insert({
      user_id: userId,
      catfood_id: catfoodId,
      score,
      comment: review,
      image_urls: imageUrls,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  // 3. 创建评分后重算用户信用分
  await recalculateReputation(userId);

  // 4. 更新商品平均分（加权）
  await calculateCatfoodScore(catfoodId);

  return { data: convertKeysToCamel(data), error: null };
};

/**
 * 计算商品加权平均分（基于用户信用分）
 */
export const calculateCatfoodScore = async (catfoodId: string) => {
  const { data: ratings } = await supabase
    .from('catfood_ratings')
    .select(
      `
      score,
      user:profiles(reputation_summary:reputation_summaries(score))
    `
    )
    .eq('catfood_id', catfoodId);

  if (!ratings || ratings.length === 0) {
    // 更新商品表平均分
    await supabase.from('catfoods').update({ avg_rating: 0 }).eq('id', catfoodId);
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const rating of ratings as RatingWithUser[]) {
    // 修正：安全访问嵌套的信用分数据
    const userCreditScore = rating.user?.reputation_summary?.[0]?.score || 0;
    const weight = 0.5 + (userCreditScore / 100) * 1;

    weightedSum += rating.score * weight;
    totalWeight += weight;
  }

  const finalScore = weightedSum / totalWeight;

  // 更新商品表平均分
  await supabase
    .from('catfoods')
    .update({ avg_rating: parseFloat(finalScore.toFixed(1)) })
    .eq('id', catfoodId);

  return finalScore;
};

/**
 * 猫粮评分类型（camelCase）
 */
export interface CatfoodRating {
  id: number;
  catfoodId: number;
  userId: string;
  score: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 猫粮数据类型（数据库schema）
 */
export interface CatfoodDB {
  id: number;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  score?: number | null;
  count_num?: number | null;
  percentage?: boolean | null;
  crude_protein?: number | null;
  crude_fat?: number | null;
  carbohydrates?: number | null;
  crude_fiber?: number | null;
  crude_ash?: number | null;
  others?: number | null;
  safety?: string | null;
  nutrient?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 猫粮列表参数
 */
export interface ListCatfoodsParams extends PaginationParams {
  search?: string;
  brand?: string;
  orderBy?: 'created_at' | 'like_count' | 'name';
  order?: 'asc' | 'desc';
}

/**
 * 获取猫粮列表（使用Database Function）
 */
export const listCatfoods = async (params: ListCatfoodsParams = {}) => {
  const { page = 1, pageSize = 20, search } = params;

  logger.query('catfoods', 'list', params);

  try {
    const { from, to } = calculatePagination({ page, pageSize });

    let query = supabase
      .from('catfoods')
      .select(
        `
        id,
        name,
        brand,
        barcode,
        image_url,
        score,
        count_num,
        percentage,
        crude_protein,
        crude_fat,
        carbohydrates,
        crude_fiber,
        crude_ash,
        others,
        safety,
        nutrient,
        created_at
      `
      )
      .range(from, to)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('catfoods', 'list', error);
      return { data: null, error: handleSupabaseError(error, 'list_catfoods') };
    }

    // 转换为camelCase
    const camelData = convertKeysToCamel(data || []) as any[];

    logger.success('catfoods', 'list', camelData?.length);
    return { data: camelData, error: null };
  } catch (err) {
    logger.error('catfoods', 'list', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 获取猫粮详情
 */
export const getCatfoodDetail = async (id: string) => {
  logger.query('catfoods', 'detail', { id });

  try {
    // 查询猫粮基本信息 + 关联数据
    const { data: catfood, error: catfoodError } = await supabase
      .from('catfoods')
      .select(
        `
        *,
        ingredients:catfood_ingredients(
          amount,
          order,
          ingredient:ingredients(
            id,
            name,
            type,
            label,
            description
          )
        ),
        additives:catfood_additives(
          amount,
          order,
          additive:additives(
            id,
            name,
            en_name,
            applicable_range,
            type
          )
        ),
        tags:catfood_tag_relations(
          tag:catfood_tags(
            id,
            name,
            description
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (catfoodError) {
      logger.error('catfoods', 'detail', catfoodError);
      return { data: null, error: handleSupabaseError(catfoodError, 'get_catfood_detail') };
    }

    // 查询当前用户的点赞状态
    const userResponse = await supabase.auth.getUser();
    let isLiked = false;
    let isFavorited = false;

    if (userResponse.data.user) {
      const userId = userResponse.data.user.id;
      // 修复：使用 maybeSingle() 替代 single() + catch
      // 查询点赞状态
      const { data: likeData } = await supabase
        .from('catfood_likes')
        .select('id')
        .eq('catfood_id', id)
        .eq('user_id', userId)
        .maybeSingle();
      isLiked = !!likeData;

      // 查询收藏状态
      const { data: favData } = await supabase
        .from('catfood_favorites')
        .select('id')
        .eq('catfood_id', id)
        .eq('user_id', userId)
        .maybeSingle();
      isFavorited = !!favData;
    }

    // 展平ingredients和additives
    const processedData = {
      ...catfood,
      ingredients:
        catfood.ingredients?.map((ci: DbCatfoodIngredientRelation) => ci.ingredient) || [],
      additives: catfood.additives?.map((ca: DbCatfoodAdditiveRelation) => ca.additive) || [],
      tags: catfood.tags?.map((ct: DbCatfoodTagRelation) => ct.tag) || [],
      isLiked,
      isFavorited,
      // 构建percentData
      percentData: {
        ...(catfood.crude_protein && { protein: catfood.crude_protein }),
        ...(catfood.crude_fat && { fat: catfood.crude_fat }),
        ...(catfood.carbohydrates && { carbohydrates: catfood.carbohydrates }),
        ...(catfood.crude_fiber && { fiber: catfood.crude_fiber }),
        ...(catfood.crude_ash && { ash: catfood.crude_ash }),
        ...(catfood.others && { others: catfood.others }),
      },
    };

    // 转换为camelCase
    const camelData = convertKeysToCamel(processedData);

    logger.success('catfoods', 'detail');
    return { data: camelData, error: null };
  } catch (err) {
    logger.error('catfoods', 'detail', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 点赞/取消点赞
 */
export const toggleLike = async (catfoodId: string) => {
  logger.query('catfoods', 'toggleLike', { catfoodId });

  try {
    const { data, error } = await supabase.rpc('toggle_catfood_like', {
      p_catfood_id: catfoodId,
    });

    if (error) {
      logger.error('catfoods', 'toggleLike', error);
      return { data: null, error: handleSupabaseError(error, 'toggle_like') };
    }

    logger.success('catfoods', 'toggleLike');
    return { data, error: null };
  } catch (err) {
    logger.error('catfoods', 'toggleLike', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 收藏/取消收藏
 */
export const toggleFavorite = async (catfoodId: string | number) => {
  logger.query('catfoods', 'toggleFavorite', { catfoodId });

  try {
    // 确保 catfoodId 是数字类型（匹配数据库 BIGINT 类型）
    const numericId = typeof catfoodId === 'string' ? parseInt(catfoodId, 10) : catfoodId;

    const { data, error } = await supabase.rpc('toggle_favorite', {
      p_catfood_id: numericId,
    });

    if (error) {
      logger.error('catfoods', 'toggleFavorite', error);
      return { data: null, error: handleSupabaseError(error, 'toggle_favorite') };
    }

    logger.success('catfoods', 'toggleFavorite');
    return { data, error: null };
  } catch (err) {
    logger.error('catfoods', 'toggleFavorite', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 检查是否已点赞
 */
export const checkLike = async (catfoodId: string) => {
  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return { data: false, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_likes')
      .select('id')
      .eq('catfood_id', catfoodId)
      .eq('user_id', userResponse.data.user.id)
      .maybeSingle();

    if (error) {
      return { data: false, error: handleSupabaseError(error, 'check_like') };
    }

    return { data: !!data, error: null };
  } catch (err) {
    return { data: false, error: { message: String(err) } };
  }
};

/**
 * 检查是否已收藏
 */
export const checkFavorite = async (catfoodId: string) => {
  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return { data: false, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_favorites')
      .select('id')
      .eq('catfood_id', catfoodId)
      .eq('user_id', userResponse.data.user.id)
      .maybeSingle();

    if (error) {
      return { data: false, error: handleSupabaseError(error, 'check_favorite') };
    }

    return { data: !!data, error: null };
  } catch (err) {
    return { data: false, error: { message: String(err) } };
  }
};

/**
 * 获取点赞数
 */
export const getLikeCount = async (catfoodId: string) => {
  try {
    const { count, error } = await supabase
      .from('catfood_likes')
      .select('*', { count: 'exact', head: true })
      .eq('catfood_id', catfoodId);

    if (error) {
      return { data: 0, error: handleSupabaseError(error, 'get_like_count') };
    }

    return { data: count || 0, error: null };
  } catch (err) {
    return { data: 0, error: { message: String(err) } };
  }
};

/**
 * 获取用户收藏列表
 */
export const getUserFavorites = async (params: PaginationParams = {}) => {
  const { page = 1, pageSize = 20 } = params;
  const { from, to } = calculatePagination({ page, pageSize });

  logger.query('favorites', 'list', params);

  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('catfood_favorites')
      .select(
        `
        id,
        created_at,
        catfood:catfoods(
          id,
          name,
          brand,
          image_url,
          barcode,
          score,
          crude_protein,
          crude_fat,
          carbohydrates,
          crude_fiber,
          crude_ash,
          others
        )
      `
      )
      .eq('user_id', userResponse.data.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error('favorites', 'list', error);
      return { data: null, error: handleSupabaseError(error, 'get_user_favorites') };
    }

    // 处理数据结构，过滤掉 catfood 为 null 的记录
    const processedData =
      (data as unknown as DbCatfoodFavorite[])
        ?.filter(
          (
            fav
          ): fav is DbCatfoodFavorite & { catfood: NonNullable<DbCatfoodFavorite['catfood']> } =>
            fav.catfood != null
        )
        .map((fav) => {
          const catfood = fav.catfood;
          return {
            ...catfood,
            favoriteId: fav.id,
            favoritedAt: fav.created_at,
            // 构建percentData
            percentData: {
              ...(catfood.crude_protein && { protein: catfood.crude_protein }),
              ...(catfood.crude_fat && { fat: catfood.crude_fat }),
              ...(catfood.carbohydrates && { carbohydrates: catfood.carbohydrates }),
              ...(catfood.crude_fiber && { fiber: catfood.crude_fiber }),
              ...(catfood.crude_ash && { ash: catfood.crude_ash }),
              ...(catfood.others && { others: catfood.others }),
            },
          };
        }) || [];

    // 转换为camelCase
    const camelData = convertKeysToCamel(processedData) as any[];

    logger.success('favorites', 'list', camelData.length);
    return { data: camelData, error: null };
  } catch (err) {
    logger.error('favorites', 'list', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 获取用户点赞列表
 */
export const getUserLikes = async (params: PaginationParams = {}) => {
  const { page = 1, pageSize = 20 } = params;
  const { from, to } = calculatePagination({ page, pageSize });

  logger.query('likes', 'list', params);

  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return {
        data: [],
        error: { message: '未登录' },
      };
    }

    const { data, error } = await supabase
      .from('catfood_likes')
      .select(
        `
        id,
        created_at,
        catfood:catfoods(
          id,
          name,
          brand,
          image_url,
          barcode,
          score,
          crude_protein,
          crude_fat,
          carbohydrates,
          crude_fiber,
          crude_ash,
          others
        )
      `
      )
      .eq('user_id', userResponse.data.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error('likes', 'list', error);
      return { data: null, error: handleSupabaseError(error, 'get_user_likes') };
    }

    // 处理数据结构，过滤掉 catfood 为 null 的记录
    const processedData =
      (data as unknown as DbCatfoodLike[])
        ?.filter(
          (like): like is DbCatfoodLike & { catfood: NonNullable<DbCatfoodLike['catfood']> } =>
            like.catfood != null
        )
        .map((like) => {
          const catfood = like.catfood;
          return {
            ...catfood,
            likeId: like.id,
            likedAt: like.created_at,
            // 构建percentData
            percentData: {
              ...(catfood.crude_protein && { protein: catfood.crude_protein }),
              ...(catfood.crude_fat && { fat: catfood.crude_fat }),
              ...(catfood.carbohydrates && { carbohydrates: catfood.carbohydrates }),
              ...(catfood.crude_fiber && { fiber: catfood.crude_fiber }),
              ...(catfood.crude_ash && { ash: catfood.crude_ash }),
              ...(catfood.others && { others: catfood.others }),
            },
          };
        }) || [];

    // 转换为camelCase
    const camelData = convertKeysToCamel(processedData) as any[];

    logger.success('likes', 'list', camelData.length);
    return { data: camelData, error: null };
  } catch (err) {
    logger.error('likes', 'list', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 获取用户对某个猫粮的评分
 */
export const getUserRating = async (
  catfoodId: string
): Promise<{ data: CatfoodRating | null; error: { message: string } | null }> => {
  logger.query('ratings', 'getUserRating', { catfoodId });

  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_ratings')
      .select('*')
      .eq('catfood_id', catfoodId)
      .eq('user_id', userResponse.data.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows
      logger.error('ratings', 'getUserRating', error);
      return { data: null, error: handleSupabaseError(error, 'get_user_rating') };
    }

    logger.success('ratings', 'getUserRating');
    return { data: data ? (convertKeysToCamel(data) as CatfoodRating) : null, error: null };
  } catch (err) {
    logger.error('ratings', 'getUserRating', err);
    return { data: null, error: { message: String(err) } };
  }
};

/**
 * 删除用户对某个猫粮的评分
 */
export const deleteRating = async (catfoodId: string) => {
  logger.query('ratings', 'delete', { catfoodId });

  try {
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return { data: null, error: { message: '未登录' } };
    }

    const { error } = await supabase
      .from('catfood_ratings')
      .delete()
      .eq('catfood_id', catfoodId)
      .eq('user_id', userResponse.data.user.id);

    if (error) {
      logger.error('ratings', 'delete', error);
      return { data: null, error: handleSupabaseError(error, 'delete_rating') };
    }

    // 删除后重算信用分
    await recalculateReputation(userResponse.data.user.id);
    // 更新商品平均分
    await calculateCatfoodScore(catfoodId);

    logger.success('ratings', 'delete');
    return { data: { success: true }, error: null };
  } catch (err) {
    logger.error('ratings', 'delete', err);
    return { data: null, error: { message: String(err) } };
  }
};

export default {
  listCatfoods,
  getCatfoodDetail,
  toggleLike,
  toggleFavorite,
  checkLike,
  checkFavorite,
  getLikeCount,
  getUserFavorites,
  getUserLikes,
  createRating,
  getUserRating,
  deleteRating,
};
