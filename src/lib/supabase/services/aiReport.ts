/**
 * AI 报告 Supabase 服务
 * 直接从 Supabase 读取已有的 AI 分析报告
 */

import { supabase } from '../client';
import { handleSupabaseError, logger } from '../helpers';

import type { AIReportData } from '@/src/services/api/ai_report/types';

/**
 * 数据库中的 AI 报告记录类型
 */
interface DbAIReport {
  id: number;
  catfood_id: number;
  ingredients_text: string;
  tags: string[] | null;
  additives: string[] | null;
  ingredients: string[] | null;
  safety: string | null;
  nutrient: string | null;
  percentage: boolean | null;
  percent_data: Record<string, number | null> | null;
  created_at: string;
  updated_at: string;
}

/**
 * 检查指定猫粮是否有 AI 报告
 */
export async function checkReportExists(catfoodId: number): Promise<{
  exists: boolean;
  reportId?: number;
}> {
  logger.query('ai_analysis_reports', 'checkExists', { catfoodId });

  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('id')
      .eq('catfood_id', catfoodId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'ai_analysis_reports.checkExists');
      return { exists: false };
    }

    const exists = !!data;
    logger.success('ai_analysis_reports', 'checkExists', exists ? 1 : 0);

    return {
      exists,
      reportId: data?.id,
    };
  } catch (err) {
    console.error('检查报告存在性失败:', err);
    return { exists: false };
  }
}

/**
 * 获取指定猫粮的 AI 报告
 */
export async function getReport(catfoodId: number): Promise<AIReportData | null> {
  logger.query('ai_analysis_reports', 'getReport', { catfoodId });

  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('*')
      .eq('catfood_id', catfoodId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'ai_analysis_reports.getReport');
      return null;
    }

    if (!data) {
      return null;
    }

    logger.success('ai_analysis_reports', 'getReport', 1);

    // 转换为前端类型
    const report: AIReportData = {
      id: data.id,
      catfood_id: data.catfood_id,
      ingredients_text: data.ingredients_text || '',
      tags: data.tags || [],
      additives: data.additives || [],
      ingredients: data.ingredients || [],
      safety: data.safety || '',
      nutrient: data.nutrient || '',
      percentage: data.percentage || false,
      percent_data: data.percent_data || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return report;
  } catch (err) {
    console.error('获取报告失败:', err);
    return null;
  }
}

/**
 * 保存 AI 报告到数据库
 */
export async function saveReport(report: {
  catfood_id: number;
  ingredients_text: string;
  tags?: string[];
  additives?: string[];
  ingredients?: string[];
  safety?: string;
  nutrient?: string;
  percentage?: boolean;
  percent_data?: Record<string, number | null>;
}): Promise<AIReportData | null> {
  logger.query('ai_analysis_reports', 'saveReport', { catfoodId: report.catfood_id });

  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .upsert(
        {
          catfood_id: report.catfood_id,
          ingredients_text: report.ingredients_text,
          tags: report.tags || [],
          additives: report.additives || [],
          ingredients: report.ingredients || [],
          safety: report.safety || '',
          nutrient: report.nutrient || '',
          percentage: report.percentage || false,
          percent_data: report.percent_data || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'catfood_id',
        }
      )
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'ai_analysis_reports.saveReport');
      return null;
    }

    logger.success('ai_analysis_reports', 'saveReport', 1);

    return {
      id: data.id,
      catfood_id: data.catfood_id,
      ingredients_text: data.ingredients_text || '',
      tags: data.tags || [],
      additives: data.additives || [],
      ingredients: data.ingredients || [],
      safety: data.safety || '',
      nutrient: data.nutrient || '',
      percentage: data.percentage || false,
      percent_data: data.percent_data || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error('保存报告失败:', err);
    return null;
  }
}

/**
 * 获取用户收藏的报告列表
 */
export async function getFavoriteReports(userId: string): Promise<any[]> {
  logger.query('favorite_reports', 'list', { userId });

  try {
    const { data, error } = await supabase
      .from('favorite_reports')
      .select(
        `
        id,
        report_id,
        created_at,
        ai_analysis_reports (
          id,
          catfood_id,
          ingredients_text,
          tags,
          safety,
          nutrient,
          created_at,
          catfoods (
            id,
            name,
            brand,
            image_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'favorite_reports.list');
      return [];
    }

    logger.success('favorite_reports', 'list', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('获取收藏报告列表失败:', err);
    return [];
  }
}

export const supabaseAIReportService = {
  checkReportExists,
  getReport,
  saveReport,
  getFavoriteReports,
};
