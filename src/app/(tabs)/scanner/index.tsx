import { LottieAnimation } from '@/src/components/LottieAnimation';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useCamera } from '@/src/hooks/useCamera';
import {
  aiReportService,
  patchCatFood,
  recognizeImage,
  type GenerateReportResponse,
  type OcrResult,
} from '@/src/services/api';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import type { CatFood } from '@/src/types/catFood';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ScrollView, Separator, Spinner, Text, XStack, YStack } from 'tamagui';
import { AiReportDetail } from './_components/AiReport';
import { CameraPermission } from './_components/CameraPermission';
import { CameraViewComponent } from './_components/CameraView';
import { CatFoodSearchModal } from './_components/CatFoodSearchModal';
import { PhotoPreview } from './_components/PhotoPreview';
import { ScanModeModal, type ScanMode } from './_components/ScanModeModal';

/**
 * 扫描流程状态
 */
type ScanFlowState =
  | 'initial' // 初始状态
  | 'selecting-mode' // 选择扫描模式
  | 'searching-catfood' // 搜索猫粮
  | 'selected-catfood' // 已选择猫粮
  | 'taking-photo' // 拍照中
  | 'photo-preview' // 照片预览
  | 'processing-ocr' // OCR 处理中
  | 'ocr-result' // OCR 结果展示
  | 'ai-report-detail'; // AI报告详情页面

/**
 * 扫描器主页面
 *
 * 流程：
 * 1. 用户点击开始，选择扫描模式（已知品牌 / 直接扫描）
 * 2a. 已知品牌：搜索猫粮 → 选择猫粮 → 自动判断：
 *     - 无成分数据：直接进入拍照界面录入成分
 *     - 有成分数据：直接跳转到详情页查看
 * 2b. 直接扫描：直接进入拍照流程
 * 3. 拍照 → 预览确认 → OCR 识别
 * 4. 展示识别结果，并可选择更新数据库
 *
 * @returns Scanner 页面组件
 */
export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, cameraRef, takePicture, toggleFacing, requestPermission, onCameraReady } =
    useCamera();

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const fetchCatFoodById = useCatFoodStore((state) => state.fetchCatFoodById);

  // 流程状态
  const [flowState, setFlowState] = useState<ScanFlowState>('initial');
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [selectedCatFood, setSelectedCatFood] = useState<CatFood | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [aiReport, setAiReport] = useState<GenerateReportResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  /**
   * 开始扫描流程
   */
  const handleStartScan = useCallback(() => {
    setFlowState('selecting-mode');
  }, []);

  /**
   * 选择扫描模式
   */
  const handleSelectMode = useCallback((mode: ScanMode) => {
    setScanMode(mode);
    if (mode === 'known-brand') {
      setFlowState('searching-catfood');
    } else if (mode === 'direct-additive') {
      setFlowState('taking-photo');
    }
  }, []);

  /**
   * 选择猫粮
   */
  const handleSelectCatFood = useCallback(
    async (catFood: CatFood) => {
      try {
        // 获取最新的猫粮数据
        const fullCatFood = await fetchCatFoodById(catFood.id);
        setSelectedCatFood(fullCatFood);
        setFlowState('selected-catfood');

        // 检查是否有成分数据
        const hasIngredients = fullCatFood.ingredient && fullCatFood.ingredient.length > 0;

        if (!hasIngredients) {
          // 没有成分数据，直接进入拍照界面
          setFlowState('taking-photo');
        } else {
          // 有成分数据，直接跳转到详情页
          router.push({
            pathname: '/detail',
            params: { id: fullCatFood.id },
          });
        }
      } catch (error) {
        console.error('获取猫粮详情失败:', error);
        Alert.alert('错误', '获取猫粮详情失败，请重试');
      }
    },
    [router, fetchCatFoodById]
  );

  /**
   * 重置流程
   */
  const resetFlow = useCallback(() => {
    setFlowState('initial');
    setScanMode(null);
    setSelectedCatFood(null);
    setPhotoUri(null);
    setOcrResult(null);
    setAiReport(null);
  }, []);

  /**
   * 返回上一步
   */
  const handleGoBack = useCallback(() => {
    if (flowState === 'selecting-mode') {
      setFlowState('initial');
    } else if (flowState === 'searching-catfood') {
      setFlowState('selecting-mode');
    } else if (flowState === 'selected-catfood' || flowState === 'taking-photo') {
      if (scanMode === 'known-brand') {
        setFlowState('searching-catfood');
      } else {
        setFlowState('selecting-mode');
      }
    } else if (flowState === 'photo-preview') {
      setFlowState('taking-photo');
    } else if (flowState === 'ocr-result') {
      setFlowState('taking-photo');
    }
  }, [flowState, scanMode]);

  /**
   * 执行 OCR 识别
   */
  const performOCR = useCallback(
    async (imageUri: string) => {
      try {
        setIsProcessing(true);
        const result = await recognizeImage(imageUri);
        setOcrResult(result);
        setFlowState('ocr-result');
      } catch (error) {
        console.error('OCR 识别失败:', error);

        let errorMessage = '图片识别失败，请重新拍照或手动输入';

        if (error instanceof Error) {
          if (error.message.includes('网络连接失败')) {
            errorMessage = '网络连接失败，请检查网络或确认后端服务器是否正在运行';
          } else if (error.message.includes('服务器')) {
            errorMessage = error.message;
          } else {
            errorMessage = error.message;
          }
        }

        Alert.alert('识别失败', errorMessage, [
          { text: '重新拍照', onPress: () => setFlowState('taking-photo') },
          { text: '取消', style: 'cancel', onPress: () => resetFlow() },
        ]);

        setFlowState('photo-preview');
      } finally {
        setIsProcessing(false);
      }
    },
    [resetFlow]
  );

  /**
   * 拍照（优化：降低质量加快上传和处理）
   */
  const handleTakePhoto = useCallback(async () => {
    try {
      // 降低质量到 0.6，加快上传和处理速度
      const photo = await takePicture({ quality: 0.6 });
      if (photo) {
        setPhotoUri(photo.uri);
        setFlowState('photo-preview');
      }
    } catch (error) {
      console.error('拍照失败:', error);
      Alert.alert('拍照失败', '请重试');
    }
  }, [takePicture]);

  /**
   * 确认照片
   */
  const handleConfirmPhoto = useCallback(async () => {
    if (!photoUri) return;
    setFlowState('processing-ocr');
    await performOCR(photoUri);
  }, [photoUri, performOCR]);

  /**
   * 重新拍照
   */
  const handleRetakePhoto = useCallback(() => {
    setPhotoUri(null);
    setOcrResult(null);
    setAiReport(null);
    setFlowState('taking-photo');
  }, []);

  /**
   * 取消预览
   */
  const handleCancelPreview = useCallback(() => {
    setPhotoUri(null);
    handleGoBack();
  }, [handleGoBack]);

  /**
   * 生成AI报告
   */
  const handleGenerateReport = useCallback(async () => {
    if (!ocrResult) {
      Alert.alert('错误', 'OCR识别结果为空');
      return;
    }

    try {
      setIsGeneratingReport(true);
      console.log('🤖 开始生成AI报告...');

      // 调用AI服务生成报告
      const report = await aiReportService.generateReport({
        ingredients: ocrResult.text,
        max_tokens: 2048,
      });

      console.log('✅ AI报告生成成功:', report);
      setAiReport(report);

      // 跳转到AI报告详情页面
      setFlowState('ai-report-detail');
    } catch (error) {
      console.error('❌ 生成AI报告失败:', error);
      let errorMessage = '生成报告失败，请重试';

      if (error instanceof Error) {
        if (error.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络连接';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('生成失败', errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [ocrResult]);

  /**
   * 保存报告到数据库（更新猫粮信息）
   */
  const handleSaveReport = useCallback(async () => {
    if (!aiReport || !selectedCatFood) {
      Alert.alert('错误', '请先生成AI报告');
      return;
    }

    try {
      setIsProcessing(true);

      // 更新猫粮的成分信息
      await patchCatFood(selectedCatFood.id, {
        safety: aiReport.safety,
        nutrient: aiReport.nutrient,
        percentage: aiReport.percentage || false,
        percentData: {
          crude_protein: aiReport.crude_protein,
          crude_fat: aiReport.crude_fat,
          carbohydrates: aiReport.carbohydrates,
          crude_fiber: aiReport.crude_fiber,
          crude_ash: aiReport.crude_ash,
          others: aiReport.others,
        },
      });

      Alert.alert('成功', '报告已保存到猫粮数据库', [
        {
          text: '查看详情',
          onPress: () =>
            router.push({
              pathname: '/detail',
              params: { id: selectedCatFood.id },
            }),
        },
      ]);

      // 重置状态
      resetFlow();
    } catch (error) {
      console.error('保存失败:', error);
      Alert.alert('保存失败', '请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [aiReport, selectedCatFood, router, resetFlow]);

  /**
   * 处理从相册选择的图片
   */
  const handleImageSelected = useCallback((uri: string) => {
    setPhotoUri(uri);
    setFlowState('photo-preview');
  }, []);

  // 渲染相机权限请求页面
  if (flowState === 'taking-photo' && !state.hasPermission) {
    return <CameraPermission onRequestPermission={requestPermission} />;
  }

  // 渲染相机页面
  if (flowState === 'taking-photo' && state.hasPermission) {
    return (
      <CameraViewComponent
        cameraRef={cameraRef}
        facing={state.facing}
        onCapture={handleTakePhoto}
        onToggleFacing={toggleFacing}
        onClose={handleGoBack}
        onCameraReady={onCameraReady}
        onImageSelected={handleImageSelected}
      />
    );
  }

  // 渲染照片预览页面
  if (flowState === 'photo-preview') {
    return (
      <PhotoPreview
        photoUri={photoUri}
        visible={true}
        onConfirm={handleConfirmPhoto}
        onRetake={handleRetakePhoto}
        onCancel={handleCancelPreview}
      />
    );
  }

  // 渲染 OCR 处理中页面
  if (flowState === 'processing-ocr') {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        padding="$6"
        gap="$4"
      >
        <LottieAnimation
          source={require('@/assets/animations/cat_loader.json')}
          width={200}
          height={200}
          autoPlay
          loop
        />
        <Text fontSize="$6" fontWeight="600" marginTop="$2">
          正在识别中...
        </Text>
        <Text fontSize="$3" color="$gray10" marginTop="$2" textAlign="center">
          请稍候，正在分析配料表
        </Text>
      </YStack>
    );
  }

  // 渲染 OCR 结果页面
  if (flowState === 'ocr-result' && ocrResult) {
    return (
      <ScrollView backgroundColor="$background">
        <YStack padding="$4" paddingTop={insets.top + 20} gap="$4">
          {/* 头部 */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$8" fontWeight="bold">
              识别结果
            </Text>
            <Button
              circular
              icon={<IconSymbol name="xmark.circle.fill" size={32} color="$gray10" />}
              chromeless
              onPress={resetFlow}
            />
          </XStack>

          {/* 照片预览 */}
          {photoUri && (
            <Card elevate bordered>
              <Card.Header padded>
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: '100%', height: 200, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </Card.Header>
            </Card>
          )}

          {/* 识别文本 */}
          <Card elevate bordered>
            <Card.Header padded>
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="doc.text.fill" size={20} color="$blue10" />
                  <Text fontSize="$5" fontWeight="600">
                    识别的文本
                  </Text>
                </XStack>
                <Text fontSize="$3" color="$gray11" lineHeight={20}>
                  {ocrResult.text}
                </Text>
                <Separator marginVertical="$2" />
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray10">
                    识别置信度
                  </Text>
                  <Text fontSize="$2" color="$green10" fontWeight="600">
                    {(ocrResult.confidence * 100).toFixed(1)}%
                  </Text>
                </XStack>
              </YStack>
            </Card.Header>
          </Card>

          {/* AI 报告结果 */}
          {aiReport && (
            <Card elevate bordered>
              <Card.Header padded>
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <IconSymbol name="sparkles" size={20} color="$orange10" />
                    <Text fontSize="$5" fontWeight="600">
                      AI 分析报告
                    </Text>
                  </XStack>

                  {/* 安全性分析 */}
                  {aiReport.safety && (
                    <YStack gap="$2">
                      <Text fontSize="$3" fontWeight="600" color="$blue10">
                        🛡️ 安全性分析
                      </Text>
                      <Text fontSize="$3" color="$gray11" lineHeight={20}>
                        {aiReport.safety}
                      </Text>
                    </YStack>
                  )}

                  {/* 营养分析 */}
                  {aiReport.nutrient && (
                    <YStack gap="$2">
                      <Text fontSize="$3" fontWeight="600" color="$green10">
                        🌿 营养分析
                      </Text>
                      <Text fontSize="$3" color="$gray11" lineHeight={20}>
                        {aiReport.nutrient}
                      </Text>
                    </YStack>
                  )}

                  {/* 识别的添加剂 */}
                  {aiReport.additives && aiReport.additives.length > 0 && (
                    <YStack gap="$2">
                      <Text fontSize="$3" fontWeight="600" color="$orange10">
                        🧪 识别的添加剂 ({aiReport.additives.length})
                      </Text>
                      <XStack flexWrap="wrap" gap="$2">
                        {aiReport.additives.map((additive, index) => (
                          <Text
                            key={index}
                            fontSize="$2"
                            backgroundColor="$orange3"
                            color="$orange11"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                          >
                            {additive}
                          </Text>
                        ))}
                      </XStack>
                    </YStack>
                  )}

                  {/* 营养成分百分比 */}
                  {aiReport.percentage && (
                    <YStack gap="$2">
                      <Text fontSize="$3" fontWeight="600" color="$purple10">
                        📊 营养成分占比
                      </Text>
                      <YStack gap="$1">
                        {aiReport.crude_protein !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              粗蛋白
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$blue10">
                              {aiReport.crude_protein.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                        {aiReport.crude_fat !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              粗脂肪
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$orange10">
                              {aiReport.crude_fat.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                        {aiReport.carbohydrates !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              碳水化合物
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$green10">
                              {aiReport.carbohydrates.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                        {aiReport.crude_fiber !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              粗纤维
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$yellow10">
                              {aiReport.crude_fiber.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                        {aiReport.crude_ash !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              粗灰分
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$gray10">
                              {aiReport.crude_ash.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                        {aiReport.others !== null && (
                          <XStack justifyContent="space-between">
                            <Text fontSize="$2" color="$gray11">
                              其他
                            </Text>
                            <Text fontSize="$2" fontWeight="600" color="$purple10">
                              {aiReport.others.toFixed(1)}%
                            </Text>
                          </XStack>
                        )}
                      </YStack>
                    </YStack>
                  )}
                </YStack>
              </Card.Header>
            </Card>
          )}

          {/* 操作按钮 */}
          <YStack gap="$3">
            {/* 生成AI报告按钮 */}
            {!aiReport && (
              <Button
                size="$5"
                themeInverse
                onPress={handleGenerateReport}
                disabled={isGeneratingReport}
                icon={<IconSymbol name="sparkles" size={20} color="white" />}
              >
                {isGeneratingReport ? <Spinner size="small" color="$color" /> : '🤖 生成AI报告'}
              </Button>
            )}

            {/* 保存到数据库按钮 */}
            {aiReport && selectedCatFood && (
              <Button
                size="$5"
                themeInverse
                onPress={handleSaveReport}
                disabled={isProcessing}
                icon={<IconSymbol name="checkmark.circle.fill" size={20} color="white" />}
              >
                {isProcessing ? <Spinner size="small" color="$color" /> : '保存到数据库'}
              </Button>
            )}

            <Button size="$5" onPress={() => setFlowState('taking-photo')}>
              重新拍照
            </Button>
            <Button size="$5" chromeless onPress={resetFlow}>
              返回首页
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    );
  }

  // 渲染 AI 报告详情页面
  if (flowState === 'ai-report-detail' && aiReport) {
    return (
      <AiReportDetail
        report={aiReport}
        onSave={selectedCatFood ? handleSaveReport : undefined}
        onRetake={handleRetakePhoto}
        onClose={resetFlow}
        isSaving={isProcessing}
      />
    );
  }

  // 渲染初始页面
  return (
    <>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        justifyContent="center"
        alignItems="center"
        padding="$6"
        gap="$6"
      >
        {/* 标题 */}
        <Text fontSize="$9" fontWeight="bold" fontFamily="MaoKen" textAlign="center">
          猫粮成分智能分析
        </Text>

        <Text fontSize="$4" color="$gray11" textAlign="center" opacity={0.8}>
          拍照即可获得专业的添加剂成分分析报告
        </Text>

        {/* 动画 */}
        <LottieAnimation
          source={require('@/assets/animations/cat_thinking_animation.json')}
          width={150}
          height={150}
        />

        <Text fontSize="$5" color="$gray12">
          你买的猫粮到底安不安全？
        </Text>

        {/* 开始按钮 */}
        <YStack width="100%" maxWidth={400} gap="$3">
          <Button
            size="$6"
            themeInverse
            onPress={handleStartScan}
            icon={<IconSymbol name="camera.fill" size={24} color="white" />}
          >
            开始扫描
          </Button>

          <Text fontSize="$2" color="$gray10" textAlign="center">
            💡 提示：拍摄清晰的配料表效果最佳
          </Text>
        </YStack>
      </YStack>

      {/* 扫描模式选择模态框 */}
      <ScanModeModal
        visible={flowState === 'selecting-mode'}
        onClose={() => setFlowState('initial')}
        onSelectMode={handleSelectMode}
      />

      {/* 猫粮搜索模态框 */}
      <CatFoodSearchModal
        visible={flowState === 'searching-catfood'}
        onClose={handleGoBack}
        onSelectCatFood={handleSelectCatFood}
      />
    </>
  );
}
