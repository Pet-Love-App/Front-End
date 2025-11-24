/**
 * useScannerFlow - 扫描流程管理 Hook
 *
 * 企业最佳实践：
 * - 业务逻辑与UI分离
 * - 单一职责：仅负责流程状态管理
 * - 易于测试和复用
 */

import { ScanType } from '@/src/types/camera';
import type { CatFood } from '@/src/types/catFood';
import { useCallback, useState } from 'react';
import type { ScanFlowState, ScanMode } from '../types';

interface UseScannerFlowProps {
  setScanType: (type: ScanType) => void;
  resetBarcodeScan: () => void;
}

/**
 * 扫描流程管理 Hook
 *
 * @returns 流程状态和状态转换方法
 */
export function useScannerFlow({ setScanType, resetBarcodeScan }: UseScannerFlowProps) {
  // ==================== 状态管理 ====================
  const [flowState, setFlowState] = useState<ScanFlowState>('initial');
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [selectedCatFood, setSelectedCatFood] = useState<CatFood | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // ==================== 流程控制方法 ====================

  /**
   * 开始扫描流程
   */
  const startScan = useCallback(() => {
    setFlowState('selecting-mode');
  }, []);

  /**
   * 选择扫描模式
   */
  const selectMode = useCallback(
    (mode: ScanMode) => {
      console.log('🎯 选择扫描模式:', mode);
      setScanMode(mode);

      if (mode === 'known-brand') {
        setFlowState('searching-catfood');
      } else if (mode === 'direct-additive') {
        setScanType(ScanType.OCR);
        setFlowState('taking-photo');
      }
    },
    [setScanType]
  );

  /**
   * 选择猫粮
   */
  const selectCatFood = useCallback((catFood: CatFood) => {
    setSelectedCatFood(catFood);
    setFlowState('selected-catfood');
  }, []);

  /**
   * 条形码扫描成功
   */
  const onBarcodeScanned = useCallback((code: string) => {
    setScannedCode(code);
    setFlowState('barcode-result');
  }, []);

  /**
   * 返回上一步
   */
  const goBack = useCallback(() => {
    switch (flowState) {
      case 'selecting-mode':
        setFlowState('initial');
        break;
      case 'searching-catfood':
        setFlowState('selecting-mode');
        break;
      case 'taking-photo':
        setFlowState('selecting-mode');
        break;
      case 'photo-preview':
        setFlowState('taking-photo');
        break;
      case 'ocr-result':
        setFlowState('taking-photo');
        break;
      case 'barcode-result':
        setFlowState('taking-photo');
        resetBarcodeScan();
        break;
      default:
        break;
    }
  }, [flowState, resetBarcodeScan]);

  /**
   * 重置整个流程
   */
  const resetFlow = useCallback(() => {
    setFlowState('initial');
    setScanMode(null);
    setSelectedCatFood(null);
    setScannedCode(null);
    resetBarcodeScan();
  }, [resetBarcodeScan]);

  /**
   * 流程状态转换方法
   */
  const transitionTo = useCallback((state: ScanFlowState) => {
    setFlowState(state);
  }, []);

  // ==================== 返回值 ====================
  return {
    // 状态
    flowState,
    scanMode,
    selectedCatFood,
    scannedCode,

    // 方法
    startScan,
    selectMode,
    selectCatFood,
    onBarcodeScanned,
    goBack,
    resetFlow,
    transitionTo,
  };
}
