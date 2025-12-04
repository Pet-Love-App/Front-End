import { supabase } from '@/src/config/supabase';

export interface CatfoodListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'score' | 'created_at' | 'count_num';
  ascending?: boolean;
}

export interface CreateCatfoodData {
  name: string;
  brand?: string;
  barcode?: string;
  image_url?: string;
  crude_protein?: number;
  crude_fat?: number;
  carbohydrates?: number;
  crude_fiber?: number;
  crude_ash?: number;
  others?: number;
}

/**
 * 猫粮服务
 * 封装猫粮相关的数据库操作
 */
export const catfoodService = {
  /**
   * 获取猫粮列表
   */
  async getCatfoods(params?: CatfoodListParams) {
    let query = supabase
      .from('catfoods')
      .select(
        `
        *,
        catfood_tag_relations(
          tag:catfood_tags(*)
        )
      `,
        { count: 'exact' }
      );

    // 搜索
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,brand.ilike.%${params.search}%`);
    }

    // 排序
    const orderBy = params?.orderBy || 'score';
    const ascending = params?.ascending ?? false;
    query = query.order(orderBy, { ascending });

    // 分页
    const pageSize = params?.pageSize || 20;
    const page = params?.page || 1;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * 获取猫粮详情
   */
  async getCatfoodDetail(id: number) {
    const { data, error } = await supabase
      .from('catfoods')
      .select(
        `
        *,
        catfood_tag_relations(
          tag:catfood_tags(*)
        ),
        catfood_ingredients(
          ingredient:ingredients(*),
          amount,
          order
        ),
        catfood_additives(
          additive:additives(*),
          amount,
          order
        ),
        ai_report:ai_analysis_reports(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建猫粮
   */
  async createCatfood(catfoodData: CreateCatfoodData) {
    const { data, error } = await supabase
      .from('catfoods')
      .insert(catfoodData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新猫粮
   */
  async updateCatfood(id: number, updates: Partial<CreateCatfoodData>) {
    const { data, error } = await supabase
      .from('catfoods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除猫粮
   */
  async deleteCatfood(id: number) {
    const { error } = await supabase.from('catfoods').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * 评分猫粮
   */
  async rateCatfood(catfoodId: number, score: number, comment?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('catfood_ratings')
      .upsert({
        catfood_id: catfoodId,
        user_id: user.id,
        score,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 获取用户对猫粮的评分
   */
  async getUserRating(catfoodId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('catfood_ratings')
      .select('*')
      .eq('catfood_id', catfoodId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  /**
   * 获取猫粮的所有评分
   */
  async getCatfoodRatings(catfoodId: number) {
    const { data, error } = await supabase
      .from('catfood_ratings')
      .select(
        `
        *,
        user:profiles(username, avatar_url)
      `
      )
      .eq('catfood_id', catfoodId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * 收藏猫粮
   */
  async favoriteCatfood(catfoodId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('catfood_favorites').insert({
      user_id: user.id,
      catfood_id: catfoodId,
    });

    if (error) throw error;
  },

  /**
   * 取消收藏猫粮
   */
  async unfavoriteCatfood(catfoodId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('catfood_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('catfood_id', catfoodId);

    if (error) throw error;
  },

  /**
   * 切换收藏状态
   */
  async toggleFavorite(catfoodId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('catfood_favorites')
      .select()
      .eq('user_id', user.id)
      .eq('catfood_id', catfoodId)
      .single();

    if (existing) {
      await this.unfavoriteCatfood(catfoodId);
      return { favorited: false };
    } else {
      await this.favoriteCatfood(catfoodId);
      return { favorited: true };
    }
  },

  /**
   * 检查是否已收藏
   */
  async isFavorited(catfoodId: number): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('catfood_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('catfood_id', catfoodId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  /**
   * 获取用户收藏的猫粮列表
   */
  async getFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('catfood_favorites')
      .select(
        `
        created_at,
        catfood:catfoods(*)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * 搜索猫粮（支持模糊搜索）
   */
  async searchCatfoods(keyword: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('catfoods')
      .select('id, name, brand, image_url, score')
      .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * 根据条形码查找猫粮
   */
  async getCatfoodByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('catfoods')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

export default catfoodService;

