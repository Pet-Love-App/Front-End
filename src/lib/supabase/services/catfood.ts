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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isLiked = false;
    let isFavorited = false;

    if (user) {
      // 查询点赞状态
      const { data: likeData } = await supabase
        .from('catfood_likes')
        .select('id')
        .eq('catfood_id', id)
        .eq('user_id', user.id)
        .single();
      isLiked = !!likeData;

      // 查询收藏状态
      const { data: favData } = await supabase
        .from('catfood_favorites')
        .select('id')
        .eq('catfood_id', id)
        .eq('user_id', user.id)
        .single();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: false, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_likes')
      .select('id')
      .eq('catfood_id', catfoodId)
      .eq('user_id', user.id)
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: false, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_favorites')
      .select('id')
      .eq('catfood_id', catfoodId)
      .eq('user_id', user.id)
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
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
      .eq('user_id', user.id)
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
 * 创建评分
 */
export const createRating = async (catfoodId: string, score: number, review?: string) => {
  logger.query('ratings', 'create', { catfoodId, score });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: '未登录' } };
    }

    // 使用upsert，如果已有评分则更新
    const { data, error } = await supabase
      .from('catfood_ratings')
      .upsert(
        {
          catfood_id: catfoodId,
          user_id: user.id,
          score,
          comment: review,
        },
        {
          onConflict: 'catfood_id,user_id',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('ratings', 'create', error);
      return { data: null, error: handleSupabaseError(error, 'create_rating') };
    }

    logger.success('ratings', 'create');
    return { data: convertKeysToCamel(data), error: null };
  } catch (err) {
    logger.error('ratings', 'create', err);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('catfood_ratings')
      .select('*')
      .eq('catfood_id', catfoodId)
      .eq('user_id', user.id)
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: '未登录' } };
    }

    const { error } = await supabase
      .from('catfood_ratings')
      .delete()
      .eq('catfood_id', catfoodId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('ratings', 'delete', error);
      return { data: null, error: handleSupabaseError(error, 'delete_rating') };
    }

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
