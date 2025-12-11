/**
 * ScannerScreen - 智能扫描主页面
 */

import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useExpoCamera as useCamera } from '@/src/hooks/useExpoCamera';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { useUserStore } from '@/src/store/userStore';
import { ScanType, type ExpoBarcodeResult } from '@/src/types/camera';

import {
  AiReportDetail,
  CameraPermissionModal,
  CatFoodSearchModal,
  ExpoCameraView,
  OcrResultView,
  PhotoPreview,
  LoadingGameModal, // 导入新组件
} from './components';
import { useScannerActions, useScannerFlow } from './hooks';
import { BarcodeResultScreen, InitialScreen, ProcessingScreen } from './screens';

/**
 * Scanner 主组件
 */
export default function ScannerScreen() {
  // ==================== 基础 Hooks ====================
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fetchCatFoodById = useCatFoodStore((state) => state.fetchCatFoodById);

  // 获取URL参数（从详情页传递过来的）
  const params = useLocalSearchParams<{
    catfoodId?: string;
    catfoodName?: string;
    scanType?: 'ingredients' | 'barcode';
  }>();

  // ==================== 相机 Hook ====================
  const {
    state: cameraState,
    cameraRef,
    takePicture,
    toggleFacing,
    toggleScanType,
    setScanType,
    requestPermission,
    onCameraReady,
    resetBarcodeScan,
  } = useCamera(ScanType.BARCODE);

  // ==================== 扫描流程 Hook ====================
  const {
    flowState,
    selectedCatFood,
    scannedCode,
    startScan,
    selectCatFood: setSelectedCatFood,
    onBarcodeScanned,
    goBack,
    resetFlow,
    transitionTo,
  } = useScannerFlow({ setScanType, resetBarcodeScan });

  // ==================== 扫描操作 Hook ====================
  const {
    photoUri,
    ocrResult,
    aiReport,
    isProcessing,
    isGeneratingReport,
    handleTakePhoto,
    handleRetakePhoto,
    handleCancelPreview,
    handleConfirmPhoto,
    handleGenerateReport,
    handleSaveReport,
    setIsGeneratingReport, // 导出这个状态设置函数，或者在 useScannerActions 中处理关闭逻辑
    showLoadingGame,
    handleCloseLoadingGame,
  } = useScannerActions({ takePicture, transitionTo, resetFlow });

  // ==================== 用户信息 ====================
  const user = useUserStore((state) => state.user);

  // ==================== URL 参数处理 ====================

  /**
   * 处理从详情页传来的参数
   * 自动进入相应的扫描模式
   */
  useEffect(() => {
    if (params.catfoodId && params.scanType) {
      // 使用setTimeout确保组件完全加载后再执行跳转
      setTimeout(() => {
        // 根据scanType设置扫描模式
        if (params.scanType === 'barcode') {
          // 扫描条形码模式 - 直接进入拍照
          setScanType(ScanType.BARCODE);
          transitionTo('taking-photo');
        } else if (params.scanType === 'ingredients') {
          // 扫描配料表模式（需要先选择猫粮）
          // 创建一个临时猫粮对象
          const tempCatFood = {
            id: parseInt(params.catfoodId || '0'),
            name: params.catfoodName || '未知猫粮',
          };
          setSelectedCatFood(tempCatFood as any);
          setScanType(ScanType.OCR);
          transitionTo('taking-photo');
        }
      }, 100);
    }
  }, [
    params.catfoodId,
    params.scanType,
    params.catfoodName,
    setScanType,
    setSelectedCatFood,
    transitionTo,
  ]);

  // ==================== 业务逻辑处理器 ====================

  /**
   * 处理条形码扫描回调
   */
  const handleBarCodeScannedCallback = useCallback(
    (result: ExpoBarcodeResult) => {
      if (flowState !== 'taking-photo') return;
      onBarcodeScanned(result.data);
    },
    [flowState, onBarcodeScanned]
  );

  /**
   * 选择猫粮处理器
   */
  const handleSelectCatFood = useCallback(
    async (catFood: any) => {
      try {
        const fullCatFood = await fetchCatFoodById(catFood.id);
        setSelectedCatFood(fullCatFood);

        const hasIngredients = fullCatFood.ingredient && fullCatFood.ingredient.length > 0;

        if (!hasIngredients) {
          transitionTo('taking-photo');
        } else {
          router.push({
            pathname: '/detail',
            params: { id: fullCatFood.id },
          } as any);
        }
      } catch (error) {
        console.error('获取猫粮详情失败:', error);
        Alert.alert('错误', '获取猫粮详情失败，请重试');
      }
    },
    [router, fetchCatFoodById, setSelectedCatFood, transitionTo]
  );

  /**
   * 生成报告处理器（包装）
   */
  const handleGenerateReportWrapper = useCallback(() => {
    handleGenerateReport(selectedCatFood);
  }, [handleGenerateReport, selectedCatFood]);

  /**
   * 保存报告处理器（包装）
   */
  const handleSaveReportWrapper = useCallback(() => {
    handleSaveReport(selectedCatFood);
  }, [handleSaveReport, selectedCatFood]);

  // ==================== 渲染逻辑 ====================

  const renderContent = () => {
    // 拍照页
    if (flowState === 'taking-photo') {
      return (
        <ExpoCameraView
          cameraRef={cameraRef}
          facing={cameraState.facing}
          scanType={cameraState.scanType || ScanType.BARCODE}
          onBarCodeScanned={handleBarCodeScannedCallback}
          onTakePhoto={handleTakePhoto}
          onToggleCamera={toggleFacing}
          onToggleScanType={toggleScanType}
          onClose={goBack}
          onCameraReady={onCameraReady}
          takePicture={takePicture}
        />
      );
    }

    // 照片预览页
    if (flowState === 'photo-preview' && photoUri) {
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

    // OCR 处理中页
    if (flowState === 'processing-ocr') {
      return <ProcessingScreen insets={insets} />;
    }

    // OCR 结果页
    if (flowState === 'ocr-result' && ocrResult) {
      return (
        <OcrResultView
          ocrResult={ocrResult}
          photoUri={photoUri}
          isGeneratingReport={isGeneratingReport}
          onGenerateReport={handleGenerateReportWrapper}
          onRetake={handleRetakePhoto}
          onClose={goBack}
        />
      );
    }

    // 条形码结果页
    if (flowState === 'barcode-result' && scannedCode) {
      return <BarcodeResultScreen scannedCode={scannedCode} insets={insets} onGoBack={goBack} />;
    }

    // AI 报告详情页
    if (flowState === 'ai-report-detail' && aiReport) {
      return (
        <AiReportDetail
          report={aiReport}
          onSave={handleSaveReportWrapper}
          onRetake={handleRetakePhoto}
          isSaving={isProcessing}
          isAdmin={user?.isAdmin || false}
          hasExistingReport={!!selectedCatFood?.percentage}
        />
      );
    }

    // 初始页（默认页）
    return <InitialScreen insets={insets} onStartScan={startScan} />;
  };

  return (
    <>
      {renderContent()}

      {/* 模态框组件 - 始终渲染在最上层 */}
      {/* 相机权限请求模态框 */}
      <CameraPermissionModal
        visible={cameraState.hasPermission === false}
        onRequestPermission={requestPermission}
      />

      <CatFoodSearchModal
        visible={flowState === 'searching-catfood'}
        onClose={goBack}
        onSelectCatFood={handleSelectCatFood}
      />

      {/* 加载游戏弹窗 */}
      <LoadingGameModal
        visible={showLoadingGame}
        isFinished={!isGeneratingReport && !!aiReport}
        onClose={handleCloseLoadingGame}
      />
    </>
  );
}
