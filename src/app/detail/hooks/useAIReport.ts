/**
 * useAIReport Hook
 *
 * 企业最佳实践：
 * - 单一职责：只负责 AI 报告的数据获取和状态管理
 * - 易于测试和复用
 * - 清晰的错误处理
 */

import { aiReportService, type AIReportData } from '@/src/services/api';
import { useEffect, useState } from 'react';

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
   * 加载 AI 报告
   */
  const loadReport = async () => {
    if (!catfoodId) {
      console.log('⚠️ [useAIReport] catfoodId 为空，跳过加载');
      setHasReport(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 [useAIReport] 开始检查猫粮 ${catfoodId} 的 AI 报告...`);

      // 先检查报告是否存在
      const checkResult = await aiReportService.checkReportExists(catfoodId);
      console.log(`📊 [useAIReport] 检查结果:`, checkResult);

      setHasReport(checkResult.exists);

      if (checkResult.exists) {
        console.log(`✅ [useAIReport] 报告存在，开始获取详情...`);
        // 获取报告详情
        const reportData = await aiReportService.getReport(catfoodId);
        console.log(`✅ [useAIReport] 报告获取成功:`, reportData);
        setReport(reportData);
      } else {
        console.log(`❌ [useAIReport] 报告不存在`);
        setReport(null);
      }
    } catch (err: any) {
      console.error('❌ [useAIReport] 加载 AI 报告失败:', err);
      console.error('❌ [useAIReport] 错误详情:', err.response || err.message);
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
