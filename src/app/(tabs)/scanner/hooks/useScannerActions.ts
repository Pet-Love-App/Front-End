/**
 * useScannerActions - 扫描操作 Hook
 *
 * 企业最佳实践：
 * - 业务逻辑与UI分离
 * - 单一职责：处理OCR、拍照、AI报告等操作
 * - 易于测试和复用
 */

import {
  aiReportService,
  patchCatFood,
  recognizeImage,
  searchAdditive,
  searchIngredient,
  type GenerateReportResponse,
  type OcrResult,
} from '@/src/services/api';
import type { CatFood } from '@/src/types/catFood';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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
        setIsGeneratingReport(true);

        const report = await aiReportService.generateReport({
          ingredients: ocrResult.text,
          max_tokens: 2048,
        });

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
            // 保存失败不影响显示报告
          }
        }

        transitionTo('ai-report-detail');
      } catch (error) {
        Alert.alert('错误', '生成报告失败');
      } finally {
        setIsGeneratingReport(false);
      }
    },
    [ocrResult, transitionTo]
  );

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
              const searchResult = await searchIngredient(nutrientName);
              if (searchResult && searchResult.length > 0) {
                ingredientIds.push(searchResult[0].id);
              } else {
                notFoundIngredients.push(nutrientName);
              }
            } catch (err) {
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
              const searchResult = await searchAdditive(additiveName);
              if (searchResult && searchResult.length > 0) {
                additiveIds.push(searchResult[0].id);
              } else {
                notFoundAdditives.push(additiveName);
              }
            } catch (err) {
              notFoundAdditives.push(additiveName);
            }
          }
        }

        // ========== 步骤 3: 调用 PATCH 接口更新猫粮信息 ==========
        await patchCatFood(selectedCatFood.id, {
          ingredient: ingredientIds,
          additive: additiveIds,
        });

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

    // 方法
    handleTakePhoto,
    handleRetakePhoto,
    handleCancelPreview,
    handleConfirmPhoto,
    handleGenerateReport,
    handleSaveReport,
  };
}
