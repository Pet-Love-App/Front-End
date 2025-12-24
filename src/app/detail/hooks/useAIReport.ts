/**
 * useAIReport Hook
 * 从 Supabase 直接读取 AI 报告，无需依赖后端服务
 */

import { useEffect, useState } from 'react';

import { supabaseAIReportService } from '@/src/lib/supabase/services/aiReport';
import { logger } from '@/src/utils/logger';

import type { AIReportData } from '@/src/services/api';

interface UseAIReportReturn {
  /** AI 报告数据 */
  report: AIReportData | null;
  /** 是否存在报告 */
  hasReport: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 重新加载报告 */
  refetch: () => Promise<void>;
}

/**
 * AI 报告 Hook
 * 直接从 Supabase 读取已有报告
 *
 * @param catfoodId - 猫粮 ID
 * @returns AI 报告状态和方法
 */
export function useAIReport(catfoodId: number | null): UseAIReportReturn {
  const [report, setReport] = useState<AIReportData | null>(null);
  const [hasReport, setHasReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从 Supabase 加载 AI 报告
   */
  const loadReport = async () => {
    if (!catfoodId) {
      setHasReport(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      logger.debug('检查猫粮报告是否存在', { catfoodId });

      // 直接从 Supabase 获取报告
      const reportData = await supabaseAIReportService.getReport(catfoodId);

      if (reportData) {
        setHasReport(true);
        setReport(reportData);
        logger.info('成功加载 AI 报告', { catfoodId, reportId: reportData.id });
      } else {
        setHasReport(false);
        setReport(null);
        logger.debug('该猫粮暂无 AI 报告', { catfoodId });
      }
    } catch (err: any) {
      logger.error('加载 AI 报告失败', err, { catfoodId });
      setError(err.message || '加载失败');
      setHasReport(false);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 当 catfoodId 变化时重新加载
   */
  useEffect(() => {
    loadReport();
  }, [catfoodId]);

  return {
    report,
    hasReport,
    isLoading,
    error,
    refetch: loadReport,
  };
}
