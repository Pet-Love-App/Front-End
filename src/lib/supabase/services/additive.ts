/**
 * Supabase 添加剂/营养成分服务
 *
 * - 管理 `additives` 和 `ingredients` 表
 * - 支持模糊搜索和精确匹配
 * - 统一错误处理
 */

import { supabase } from '../client';
import { convertKeysToCamel, logger, wrapResponse, type SupabaseResponse } from '../helpers';

// ==================== 类型定义 ====================

/**
 * 添加剂数据库 Schema
 */
export interface AdditiveDB {
  id: number;
  name: string;
  en_name: string | null;
  type: string | null;
  applicable_range: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 添加剂（前端使用）
 */
export interface Additive {
  id: number;
  name: string;
  enName: string | null;
  type: string | null;
  applicableRange: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 营养成分/原料数据库 Schema
 */
export interface IngredientDB {
  id: number;
  name: string;
  type: string | null;
  label: string | null;
  desc: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 营养成分/原料（前端使用）
 */
export interface Ingredient {
  id: number;
  name: string;
  type: string | null;
  label: string | null;
  desc: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 添加剂搜索响应
 */
export interface AdditiveSearchResponse {
  /** 匹配类型: exact/fuzzy/fuzzy_single/multiple/not_found */
  matchType: 'exact' | 'fuzzy' | 'fuzzy_single' | 'multiple' | 'not_found';
  /** 单个添加剂（exact/fuzzy/fuzzy_single 时返回） */
  additive?: Additive;
  /** 多个添加剂（multiple 时返回） */
  additives?: Additive[];
  /** 查询关键词 */
  query: string;
  /** 是否未找到 */
  notFound: boolean;
}

/**
 * 营养成分搜索响应
 */
export interface IngredientSearchResponse {
  ingredient?: Ingredient;
  query: string;
  notFound: boolean;
}

/**
 * 添加剂输入参数
 */
export interface AddAdditiveParams {
  name: string;
  enName?: string;
  type?: string;
  applicableRange?: string;
}

/**
 * 营养成分输入参数
 */
export interface AddIngredientParams {
  name: string;
  type?: string;
  label?: string;
  desc?: string;
}

// ==================== Additive 服务 ====================

class SupabaseAdditiveService {
  /**
   * 搜索添加剂
   */
  async searchAdditive(query: string): Promise<SupabaseResponse<AdditiveSearchResponse>> {
    logger.query('additives', 'search', { query });

    try {
      // 1. 尝试精确匹配
      const { data: exactMatch, error: exactError } = await supabase
        .from('additives')
        .select('*')
        .ilike('name', query)
        .limit(1)
        .single();

      if (!exactError && exactMatch) {
        logger.success('additives', 'search - exact match');
        return {
          data: {
            matchType: 'exact',
            additive: convertKeysToCamel(exactMatch),
            query,
            notFound: false,
          },
          error: null,
          success: true,
        };
      }

      // 2. 尝试模糊匹配（包含）
      const { data: fuzzyMatches, error: fuzzyError } = await supabase
        .from('additives')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (fuzzyError) {
        logger.error('additives', 'search', fuzzyError);
        return wrapResponse(
          null,
          fuzzyError
        ) as unknown as SupabaseResponse<AdditiveSearchResponse>;
      }

      if (!fuzzyMatches || fuzzyMatches.length === 0) {
        logger.success('additives', 'search - not found');
        return {
          data: {
            matchType: 'not_found',
            query,
            notFound: true,
          },
          error: null,
          success: true,
        };
      }

      if (fuzzyMatches.length === 1) {
        logger.success('additives', 'search - fuzzy single');
        return {
          data: {
            matchType: 'fuzzy_single',
            additive: convertKeysToCamel(fuzzyMatches[0]),
            query,
            notFound: false,
          },
          error: null,
          success: true,
        };
      }

      // 多个匹配结果
      logger.success('additives', 'search - multiple');
      return {
        data: {
          matchType: 'multiple',
          additives: fuzzyMatches.map((item) => convertKeysToCamel(item)),
          query,
          notFound: false,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('additives', 'search', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 搜索营养成分/原料
   */
  async searchIngredient(query: string): Promise<SupabaseResponse<IngredientSearchResponse>> {
    logger.query('ingredients', 'search', { query });

    try {
      // 先尝试精确匹配
      const { data: exactMatch, error: exactError } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', query)
        .limit(1)
        .single();

      if (!exactError && exactMatch) {
        logger.success('ingredients', 'search - exact match');
        return {
          data: {
            ingredient: convertKeysToCamel(exactMatch),
            query,
            notFound: false,
          },
          error: null,
          success: true,
        };
      }

      // 尝试模糊匹配
      const { data: fuzzyMatch, error: fuzzyError } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(1)
        .single();

      if (fuzzyError || !fuzzyMatch) {
        logger.success('ingredients', 'search - not found');
        return {
          data: {
            query,
            notFound: true,
          },
          error: null,
          success: true,
        };
      }

      logger.success('ingredients', 'search - fuzzy match');
      return {
        data: {
          ingredient: convertKeysToCamel(fuzzyMatch),
          query,
          notFound: false,
        },
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('ingredients', 'search', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 添加添加剂
   */
  async addAdditive(params: AddAdditiveParams): Promise<SupabaseResponse<Additive>> {
    logger.query('additives', 'add', params);

    try {
      const { data, error } = await supabase
        .from('additives')
        .insert({
          name: params.name,
          en_name: params.enName || null,
          type: params.type || null,
          applicable_range: params.applicableRange || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('additives', 'add', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Additive>;
      }

      logger.success('additives', 'add');
      return {
        data: convertKeysToCamel(data),
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('additives', 'add', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }

  /**
   * 添加营养成分/原料
   */
  async addIngredient(params: AddIngredientParams): Promise<SupabaseResponse<Ingredient>> {
    logger.query('ingredients', 'add', params);

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert({
          name: params.name,
          type: params.type || null,
          label: params.label || null,
          desc: params.desc || null,
        })
        .select()
        .single();

      if (error) {
        logger.error('ingredients', 'add', error);
        return wrapResponse(null, error) as unknown as SupabaseResponse<Ingredient>;
      }

      logger.success('ingredients', 'add');
      return {
        data: convertKeysToCamel(data),
        error: null,
        success: true,
      };
    } catch (err) {
      logger.error('ingredients', 'add', err);
      return {
        data: null,
        error: { message: String(err), code: 'UNKNOWN', details: '', hint: '' } as any,
        success: false,
      };
    }
  }
}

// 导出单例
export const supabaseAdditiveService = new SupabaseAdditiveService();

export default supabaseAdditiveService;
