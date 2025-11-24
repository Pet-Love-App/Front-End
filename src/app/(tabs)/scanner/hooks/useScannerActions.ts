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
   */
  const handleGenerateReport = useCallback(async () => {
    if (!ocrResult) return;

    try {
      setIsGeneratingReport(true);

      console.log('\n========== 📝 OCR识别文本（完整） ==========');
      console.log(ocrResult.text);
      console.log('========================================\n');

      const report = await aiReportService.generateReport({
        ingredients: ocrResult.text,
        max_tokens: 2048,
      });

      console.log('\n========== ✅ 前端接收到的报告数据 ==========');
      console.log(JSON.stringify(report, null, 2));
      console.log('========================================\n');

      setAiReport(report);
      transitionTo('ai-report-detail');
    } catch (error) {
      console.error('❌ 生成报告失败:', error);
      Alert.alert('错误', '生成报告失败');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [ocrResult, transitionTo]);

  /**
   * 保存报告到猫粮
   * 新逻辑：
   * 1. 先保存 AI 报告到数据库（新增）
   * 2. 再查询成分和添加剂 ID
   * 3. 最后更新猫粮的成分和添加剂关联
   */
  const handleSaveReport = useCallback(
    async (selectedCatFood: CatFood | null) => {
      if (!aiReport || !selectedCatFood || !ocrResult) return;

      try {
        setIsProcessing(true);

        console.log('\n========== 💾 开始保存流程 ==========');

        // ========== 步骤 1: 保存 AI 报告到数据库 ==========
        console.log('📝 步骤 1: 保存 AI 报告到数据库...');
        try {
          const saveReportResult = await aiReportService.saveReport({
            catfood_id: selectedCatFood.id,
            ingredients_text: ocrResult.text, // 使用 OCR 识别的原始文本
            tags: aiReport.tags || [],
            additives: aiReport.additives || [],
            ingredients: aiReport.identified_nutrients || [],
            safety: aiReport.safety || '',
            nutrient: aiReport.nutrient || '',
            percentage: aiReport.percentage ?? false,
            crude_protein: aiReport.crude_protein,
            crude_fat: aiReport.crude_fat,
            carbohydrates: aiReport.carbohydrates,
            crude_fiber: aiReport.crude_fiber,
            crude_ash: aiReport.crude_ash,
            others: aiReport.others,
          });

          console.log('✅ AI 报告保存成功:', saveReportResult.message);
        } catch (error: any) {
          console.error('❌ 保存 AI 报告失败:', error);
          // 如果保存报告失败，继续尝试更新猫粮信息
          if (error.response?.status === 404) {
            Alert.alert('错误', '猫粮不存在，无法保存报告');
            return;
          }
          // 其他错误继续执行后续流程
          console.warn('⚠️ AI 报告保存失败，继续更新猫粮信息...');
        }

        // ========== 步骤 2: 查询识别到的成分ID列表 ==========
        console.log('\n📝 步骤 2: 查询成分 ID...');
        const ingredientIds: number[] = [];
        const notFoundIngredients: string[] = [];

        if (aiReport.identified_nutrients && aiReport.identified_nutrients.length > 0) {
          console.log('🔍 开始查询成分ID...', aiReport.identified_nutrients);

          for (const nutrientName of aiReport.identified_nutrients) {
            try {
              const searchResult = await searchIngredient(nutrientName);
              if (searchResult && searchResult.length > 0) {
                ingredientIds.push(searchResult[0].id);
                console.log(`  ✅ ${nutrientName} -> ID: ${searchResult[0].id}`);
              } else {
                notFoundIngredients.push(nutrientName);
                console.log(`  ⚠️ ${nutrientName} -> 未找到`);
              }
            } catch (err) {
              console.error(`查询成分 "${nutrientName}" 失败:`, err);
              notFoundIngredients.push(nutrientName);
            }
          }
        }

        // ========== 步骤 3: 查询识别到的添加剂ID列表 ==========
        console.log('\n📝 步骤 3: 查询添加剂 ID...');
        const additiveIds: number[] = [];
        const notFoundAdditives: string[] = [];

        if (aiReport.additives && aiReport.additives.length > 0) {
          console.log('🔍 开始查询添加剂ID...', aiReport.additives);

          for (const additiveName of aiReport.additives) {
            try {
              const searchResult = await searchAdditive(additiveName);
              if (searchResult && searchResult.length > 0) {
                additiveIds.push(searchResult[0].id);
                console.log(`  ✅ ${additiveName} -> ID: ${searchResult[0].id}`);
              } else {
                notFoundAdditives.push(additiveName);
                console.log(`  ⚠️ ${additiveName} -> 未找到`);
              }
            } catch (err) {
              console.error(`查询添加剂 "${additiveName}" 失败:`, err);
              notFoundAdditives.push(additiveName);
            }
          }
        }

        // ========== 步骤 4: 调用 PATCH 接口更新猫粮信息 ==========
        console.log('\n📝 步骤 4: 更新猫粮的成分和添加剂关联...');
        console.log('📤 开始更新猫粮信息...', {
          catfoodId: selectedCatFood.id,
          ingredientIds,
          additiveIds,
        });

        await patchCatFood(selectedCatFood.id, {
          ingredient: ingredientIds,
          additive: additiveIds,
        });

        console.log('✅ 猫粮信息更新成功');

        // ========== 步骤 5: 提示用户 ==========
        console.log('\n========== ✅ 保存流程完成 ==========\n');

        let message = 'AI 报告已保存到数据库\n猫粮信息已更新';
        if (notFoundIngredients.length > 0 || notFoundAdditives.length > 0) {
          message += '\n\n部分成分未找到:';
          if (notFoundIngredients.length > 0) {
            message += `\n成分: ${notFoundIngredients.join(', ')}`;
          }
          if (notFoundAdditives.length > 0) {
            message += `\n添加剂: ${notFoundAdditives.join(', ')}`;
          }
        }

        Alert.alert('保存成功', message, [
          {
            text: '确定',
            onPress: () => resetFlow(),
          },
        ]);
      } catch (error) {
        console.error('❌ 保存报告失败:', error);
        Alert.alert('保存失败', '请重试');
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
