/**
 * 扫描操作 Hook
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { supabase, supabaseAdditiveService } from '@/src/lib/supabase';
import {
  aiReportService,
  recognizeImage,
  type GenerateReportResponse,
  type OcrResult,
} from '@/src/services/api';
import type { CatFood } from '@/src/types/catFood';

import type { ScanFlowState } from '../types';

interface UseScannerActionsProps {
  takePicture: (options: {
    quality: number;
    cropToScanFrame?: boolean;
    zoom?: number;
    frameLayout?: { x: number; y: number; width: number; height: number };
  }) => Promise<{ uri: string } | null>;
  transitionTo: (state: ScanFlowState) => void;
  resetFlow: () => void;
}

/**
 * 扫描操作 Hook
 *
 * @returns OCR、拍照、AI报告等操作方法
 */
export function useScannerActions({
  takePicture,
  transitionTo,
  resetFlow,
}: UseScannerActionsProps) {
  // ==================== 状态管理 ====================
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [aiReport, setAiReport] = useState<GenerateReportResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showLoadingGame, setShowLoadingGame] = useState(false);

  // ==================== 拍照操作 ====================

  /**
   * 拍照
   * 自动裁剪到扫描框内容
   * @param zoom - 当前缩放级别（0-1）
   * @param frameLayout - 扫描框在屏幕上的实际位置
   */
  const handleTakePhoto = useCallback(
    async (
      zoom?: number,
      frameLayout?: { x: number; y: number; width: number; height: number } | null
    ) => {
      try {
        const photo = await takePicture({
          quality: 0.6,
          cropToScanFrame: true, // 启用裁剪到扫描框
          zoom: zoom, // 传递缩放信息
          frameLayout: frameLayout || undefined, // 传递扫描框位置
        });
        if (photo) {
          setPhotoUri(photo.uri);
          transitionTo('photo-preview');
        }
      } catch (error) {
        console.error('拍照失败:', error);
        Alert.alert('拍照失败', '请重试');
      }
    },
    [takePicture, transitionTo]
  );

  /**
   * 重新拍照
   */
  const handleRetakePhoto = useCallback(() => {
    setPhotoUri(null);
    setOcrResult(null);
    setAiReport(null);
    transitionTo('taking-photo');
  }, [transitionTo]);

  /**
   * 取消预览
   */
  const handleCancelPreview = useCallback(() => {
    setPhotoUri(null);
    transitionTo('taking-photo');
  }, [transitionTo]);

  // ==================== OCR 操作 ====================

  /**
   * 执行 OCR 识别
   */
  const performOCR = useCallback(
    async (imageUri: string) => {
      try {
        setIsProcessing(true);
        const result = await recognizeImage(imageUri);
        setOcrResult(result);
        transitionTo('ocr-result');
      } catch (error) {
        console.error('OCR识别失败:', error);
        Alert.alert('识别失败', '请重试');
        transitionTo('photo-preview');
      } finally {
        setIsProcessing(false);
      }
    },
    [transitionTo]
  );

  /**
   * 确认照片并开始OCR
   */
  const handleConfirmPhoto = useCallback(async () => {
    if (!photoUri) return;
    transitionTo('processing-ocr');
    await performOCR(photoUri);
  }, [photoUri, performOCR, transitionTo]);

  // ==================== AI 报告操作 ====================

  /**
   * 生成AI报告
   * 修改：生成后自动保存到数据库（如果有选择的猫粮）
   */
  const handleGenerateReport = useCallback(
    async (selectedCatFood: CatFood | null) => {
      if (!ocrResult) return;

      try {
        setShowLoadingGame(true);
        setIsGeneratingReport(true);

        // 模拟延迟，确保游戏至少展示几秒钟，提升体验
        const minGameTime = new Promise((resolve) => setTimeout(resolve, 3000));

        const reportPromise = aiReportService.generateReport({
          ingredients: ocrResult.text,
          max_tokens: 2048,
        });

        // 等待报告生成和最小游戏时间
        const [report] = await Promise.all([reportPromise, minGameTime]);

        setAiReport(report);

        // ========== 自动保存报告到数据库 ==========
        if (selectedCatFood) {
          try {
            const saveReportResult = await aiReportService.saveReport({
              catfood_id: selectedCatFood.id,
              ingredients_text: ocrResult.text,
              tags: report.tags || [],
              additives: report.additives || [],
              ingredients: report.identified_nutrients || [],
              safety: report.safety || '',
              nutrient: report.nutrient || '',
              percentage: report.percentage ?? false,
              percent_data: report.percent_data || {}, // ✅ 使用动态 percent_data
            });
          } catch (error: any) {
            // 权限检查：403 表示需要管理员权限
            if (error.response?.status === 403) {
              Alert.alert(
                '权限不足',
                error.response?.data?.message || '该猫粮已有营养成分信息，只有管理员可以更新。',
                [
                  {
                    text: '了解',
                    style: 'default',
                  },
                ]
              );
            }
            // 保存失败不影响显示报告，继续显示AI分析结果
          }
        }

        // transitionTo('ai-report-detail'); // 移除自动跳转，等待用户关闭游戏弹窗
      } catch (error) {
        Alert.alert('错误', '生成报告失败');
        setShowLoadingGame(false); // 失败时关闭弹窗
      } finally {
        setIsGeneratingReport(false);
      }
    },
    [ocrResult, transitionTo]
  );

  /**
   * 关闭加载游戏并显示报告
   */
  const handleCloseLoadingGame = useCallback(() => {
    setShowLoadingGame(false);
    if (aiReport) {
      transitionTo('ai-report-detail');
    }
  }, [aiReport, transitionTo]);

  /**
   * 保存报告到猫粮（更新成分和添加剂关联）
   * 注意：AI报告已在生成时自动保存，此函数仅用于更新关联
   */
  const handleSaveReport = useCallback(
    async (selectedCatFood: CatFood | null) => {
      if (!aiReport || !selectedCatFood || !ocrResult) return;

      try {
        setIsProcessing(true);

        // ========== 步骤 1: 查询识别到的成分ID列表 ==========
        const ingredientIds: number[] = [];
        const notFoundIngredients: string[] = [];

        if (aiReport.identified_nutrients && aiReport.identified_nutrients.length > 0) {
          for (const nutrientName of aiReport.identified_nutrients) {
            try {
              const { data, error } = await supabaseAdditiveService.searchIngredient(nutrientName);
              if (!error && data && data.ingredient?.id && !data.notFound) {
                ingredientIds.push(data.ingredient.id);
              } else {
                notFoundIngredients.push(nutrientName);
              }
            } catch {
              notFoundIngredients.push(nutrientName);
            }
          }
        }

        // ========== 步骤 2: 查询识别到的添加剂ID列表 ==========
        const additiveIds: number[] = [];
        const notFoundAdditives: string[] = [];

        if (aiReport.additives && aiReport.additives.length > 0) {
          for (const additiveName of aiReport.additives) {
            try {
              const { data, error } = await supabaseAdditiveService.searchAdditive(additiveName);
              if (!error && data && data.additive?.id && !data.notFound) {
                additiveIds.push(data.additive.id);
              } else {
                notFoundAdditives.push(additiveName);
              }
            } catch {
              notFoundAdditives.push(additiveName);
            }
          }
        }

        // ========== 步骤 3: 使用 Supabase 更新猫粮关联 ==========
        // 更新成分关联
        if (ingredientIds.length > 0) {
          // 删除旧关联
          await supabase.from('catfood_ingredients').delete().eq('catfood_id', selectedCatFood.id);
          // 创建新关联
          await supabase.from('catfood_ingredients').insert(
            ingredientIds.map((ingredientId) => ({
              catfood_id: selectedCatFood.id,
              ingredient_id: ingredientId,
            }))
          );
        }

        // 更新添加剂关联
        if (additiveIds.length > 0) {
          // 删除旧关联
          await supabase.from('catfood_additives').delete().eq('catfood_id', selectedCatFood.id);
          // 创建新关联
          await supabase.from('catfood_additives').insert(
            additiveIds.map((additiveId) => ({
              catfood_id: selectedCatFood.id,
              additive_id: additiveId,
            }))
          );
        }

        // ========== 步骤 4: 提示用户 ==========
        let message = '猫粮成分和添加剂关联已更新';
        if (notFoundIngredients.length > 0 || notFoundAdditives.length > 0) {
          message += '\n\n部分成分未找到:';
          if (notFoundIngredients.length > 0) {
            message += `\n成分: ${notFoundIngredients.join(', ')}`;
          }
          if (notFoundAdditives.length > 0) {
            message += `\n添加剂: ${notFoundAdditives.join(', ')}`;
          }
        }

        Alert.alert('更新成功', message, [
          {
            text: '确定',
            onPress: () => resetFlow(),
          },
        ]);
      } catch (error) {
        console.error('❌ 更新猫粮信息失败:', error);
        Alert.alert('更新失败', '请重试');
      } finally {
        setIsProcessing(false);
      }
    },
    [aiReport, ocrResult, resetFlow]
  );

  // ==================== 返回值 ====================
  return {
    // 状态
    photoUri,
    ocrResult,
    aiReport,
    isProcessing,
    isGeneratingReport,
    showLoadingGame,

    // 方法
    handleTakePhoto,
    handleRetakePhoto,
    handleCancelPreview,
    handleConfirmPhoto,
    handleGenerateReport,
    handleSaveReport,
    setIsGeneratingReport,
    handleCloseLoadingGame,
  };
}
