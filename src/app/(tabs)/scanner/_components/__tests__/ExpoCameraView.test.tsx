import { ScanType } from '@/src/types/camera';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ExpoCameraView, SUPPORTED_BARCODE_TYPES } from '../ExpoCameraView';

// 创建测试用Tamagui配置
const testConfig = createTamagui({
  tokens: {
    color: {
      white: '#fff',
      black: '#000',
    },
    space: {},
    size: {},
    radius: {},
    zIndex: {},
  },
  themes: {
    light: {
      background: '#fff',
      color: '#000',
    },
  },
  shorthands: {},
  name: 'test-config',
});

// Mock依赖组件和模块
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: jest.fn(({ name, size, color, testID }) => (
      <View testID={testID || `icon-${name}`} style={{ width: size, height: size }} />
    ))
  };
});

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props: any, ref: any) => (
      <View testID="camera-view" {...props} ref={ref} />
    )),
    CameraType: { front: 'front', back: 'back' },
    useCameraPermissions: jest.fn(() => [
      { granted: true, canAskAgain: true, status: 'granted' },
      jest.fn(),
    ]),
  };
});

describe('ExpoCameraView Component (Optimized)', () => {
  // 创建基础模拟函数和props
  const mockCameraRef = { current: null };
  const mockOnBarcodeScanned = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnToggleCamera = jest.fn();
  const mockOnToggleScanType = jest.fn();
  const mockOnCameraReady = jest.fn();
  const mockOnTakePhoto = jest.fn();

  const defaultProps = {
    cameraRef: mockCameraRef,
    facing: 'back' as const,
    scanType: ScanType.BARCODE,
    onClose: mockOnClose,
    onToggleCamera: mockOnToggleCamera,
    onToggleScanType: mockOnToggleScanType,
    onCameraReady: mockOnCameraReady,
    onBarCodeScanned: mockOnBarcodeScanned,
    onTakePhoto: mockOnTakePhoto,
    debounceTime: 1000, // 防抖时间
  };

  // 每个测试前重置mock
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置时间戳（避免防抖时间影响）
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 封装带主题的渲染函数
  const setup = (propsOverride = {}) => {
    return render(
      <TamaguiProvider config={testConfig}>
        <ExpoCameraView {...defaultProps} {...propsOverride} />
      </TamaguiProvider>
    );
  };

  // ========== 基础测试用例 ==========
  test('renders correctly in Barcode mode with all elements', () => {
    setup({ scanType: ScanType.BARCODE });
    expect(screen.getByTestId('camera-view')).toBeTruthy();
    expect(screen.getByTestId('icon-xmark')).toBeTruthy();
    expect(screen.getByTestId('icon-camera.rotate')).toBeTruthy();
    expect(screen.getByText('扫描条形码')).toBeTruthy();
    expect(screen.getByText('将条码对准框内')).toBeTruthy();
    expect(screen.getByTestId('icon-doc.text.viewfinder')).toBeTruthy();
    expect(screen.getByText('去拍照')).toBeTruthy();
    expect(screen.queryByTestId('capture-button')).toBeFalsy();
  });

  test('renders correctly in OCR mode with all elements', () => {
    setup({ scanType: ScanType.OCR });
    expect(screen.getByText('拍照识别成分')).toBeTruthy();
    expect(screen.getByText('确保配料表文字清晰可见')).toBeTruthy();
    expect(screen.getByTestId('icon-barcode.viewfinder')).toBeTruthy();
    expect(screen.getByText('去扫码')).toBeTruthy();
    expect(screen.getByTestId('capture-button')).toBeTruthy();
  });

  test('triggers onClose when close button is pressed', () => {
    setup();
    fireEvent.press(screen.getByTestId('icon-xmark'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('triggers onToggleCamera when rotate button is pressed', () => {
    setup();
    fireEvent.press(screen.getByTestId('icon-camera.rotate'));
    expect(mockOnToggleCamera).toHaveBeenCalledTimes(1);
  });

  test('triggers onToggleScanType when mode button is pressed', () => {
    setup({ scanType: ScanType.BARCODE });
    fireEvent.press(screen.getByText('去拍照'));
    expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);

    mockOnToggleScanType.mockClear();
    setup({ scanType: ScanType.OCR });
    fireEvent.press(screen.getByText('去扫码'));
    expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);
  });

  test('triggers onTakePhoto when capture button is pressed in OCR mode', () => {
    setup({ scanType: ScanType.OCR });
    fireEvent.press(screen.getByTestId('capture-button'));
    expect(mockOnTakePhoto).toHaveBeenCalledTimes(1);
  });

  test('passes onCameraReady prop to CameraView and updates state', () => {
    setup();
    const cameraView = screen.getByTestId('camera-view');

    // 触发相机就绪前，状态为未就绪
    fireEvent(cameraView, 'onBarcodeScanned', { data: '123', type: 'ean13' });
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();

    // 触发相机就绪事件
    fireEvent(cameraView, 'onCameraReady');
    expect(mockOnCameraReady).toHaveBeenCalledTimes(1);

    // 相机就绪后，扫描事件生效
    fireEvent(cameraView, 'onBarcodeScanned', { data: '1234567890128', type: 'ean13' });
    expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(1);
  });

  /**
   * 修正：添加相机就绪步骤
   */
  test('triggers onBarCodeScanned only in BARCODE mode', () => {
    const testBarcode = { data: '1234567890128', type: 'ean13' }; // 有效EAN13格式

    // Barcode模式：相机就绪后触发
    setup({ scanType: ScanType.BARCODE });
    const barcodeCamera = screen.getByTestId('camera-view');
    fireEvent(barcodeCamera, 'onCameraReady'); // 新增：触发相机就绪
    fireEvent(barcodeCamera, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);

    // OCR模式：不触发
    mockOnBarcodeScanned.mockClear();
    setup({ scanType: ScanType.OCR });
    const ocrCamera = screen.getByTestId('camera-view');
    fireEvent(ocrCamera, 'onCameraReady'); // 新增：触发相机就绪
    fireEvent(ocrCamera, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
  });

  test('passes correct facing prop to CameraView', () => {
    setup({ facing: 'back' });
    expect(screen.getByTestId('camera-view').props.facing).toBe('back');

    setup({ facing: 'front' });
    expect(screen.getByTestId('camera-view').props.facing).toBe('front');
  });

  // ========== 优化功能测试用例 ==========

  /**
   * 修正：添加相机就绪步骤 + 确保条码格式有效
   */
  test('supports all configured barcode types', () => {
    setup({ scanType: ScanType.BARCODE });
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, 'onCameraReady'); // 新增：触发相机就绪

    // 遍历所有支持的条码类型（确保数据格式有效）
    SUPPORTED_BARCODE_TYPES.forEach((barcodeType) => {
      const testBarcode = {
        // EAN13需要13位数字，其他类型随意
        data: barcodeType === 'ean13' ? '1234567890128' : `test-${barcodeType}-123`,
        type: barcodeType
      };

      fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
      expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);
      mockOnBarcodeScanned.mockClear();
    });
  });

  /**
   * 修正：添加相机就绪步骤
   */
  test('prevents duplicate barcode scans for the same data (debounce)', async () => {
    setup({ scanType: ScanType.BARCODE, debounceTime: 1000 });
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, 'onCameraReady'); // 新增：触发相机就绪
    const testBarcode = { data: '1234567890128', type: 'ean13' };

    // 模拟1秒内连续扫描5次相同条码
    for (let i = 0; i < 5; i++) {
      fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
      jest.advanceTimersByTime(100); // 每次间隔100ms
    }

    // 验证仅触发1次
    expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(1);
    expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);

    // 防抖时间过后，再次扫描触发
    jest.advanceTimersByTime(1000); // 跳过防抖时间
    fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(2);
  });

  /**
   * 修正：添加相机就绪步骤 + 确保条码格式有效
   */
  test('triggers callback for different consecutive barcodes', () => {
    setup({ scanType: ScanType.BARCODE });
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, 'onCameraReady'); // 新增：触发相机就绪

    // 不同条码（确保格式有效）
    const barcodes = [
      { data: '1234567890128', type: 'ean13' }, // 有效EAN13
      { data: '12345678', type: 'ean8' },
      { data: 'ABC123456789', type: 'code128' },
      { data: 'QR1234567890', type: 'qr' }
    ];

    barcodes.forEach((barcode, index) => {
      fireEvent(cameraView, 'onBarcodeScanned', barcode);
      expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(index + 1);
      expect(mockOnBarcodeScanned).toHaveBeenLastCalledWith(barcode);
    });
  });

  test('does not trigger callback for empty or invalid barcodes', () => {
    setup({ scanType: ScanType.BARCODE });
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, 'onCameraReady'); // 触发相机就绪

    // 空数据
    fireEvent(cameraView, 'onBarcodeScanned', { data: '', type: 'ean13' });
    // null数据
    fireEvent(cameraView, 'onBarcodeScanned', { data: null, type: 'ean13' });
    // 不支持的类型
    fireEvent(cameraView, 'onBarcodeScanned', { data: '123456', type: 'unsupported' });

    // 验证无触发
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
  });

  /**
   * 修正：确保测试流程正确
   */
  test('validates EAN13 barcode format before triggering callback', () => {
    setup({ scanType: ScanType.BARCODE });
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, 'onCameraReady'); // 触发相机就绪

    // 有效EAN13（13位数字）
    const validEAN13 = { data: '1234567890128', type: 'ean13' };
    fireEvent(cameraView, 'onBarcodeScanned', validEAN13);
    expect(mockOnBarcodeScanned).toHaveBeenCalledWith(validEAN13);
    mockOnBarcodeScanned.mockClear();

    // 无效EAN13（不足13位）
    fireEvent(cameraView, 'onBarcodeScanned', { data: '123456', type: 'ean13' });
    // 无效EAN13（含非数字）
    fireEvent(cameraView, 'onBarcodeScanned', { data: '123456789012a', type: 'ean13' });

    // 验证无效条码未触发
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
  });

  test('only responds to barcode scans after camera is ready', () => {
    setup({ scanType: ScanType.BARCODE });
    const cameraView = screen.getByTestId('camera-view');
    const testBarcode = { data: '1234567890128', type: 'ean13' };

    // 相机未就绪时扫描（不触发）
    fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();

    // 相机就绪后扫描（触发）
    fireEvent(cameraView, 'onCameraReady');
    fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);
  });
});

// import { ScanType } from '@/src/types/camera';
// import { TamaguiProvider, createTamagui } from '@tamagui/core';
// import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
// import React from 'react';
// import { ExpoCameraView } from '../ExpoCameraView';

// // 创建测试用Tamagui配置
// const testConfig = createTamagui({
//   tokens: {
//     color: {
//       white: '#fff',
//       black: '#000',
//     },
//     space: {},
//     size: {},
//     radius: {},
//     zIndex: {},
//   },
//   themes: {
//     light: {
//       background: '#fff',
//       color: '#000',
//     },
//   },
//   shorthands: {},
//   name: 'test-config',
// });

// // Mock依赖组件和模块
// jest.mock('@/src/components/ui/IconSymbol', () => {
//   const { View } = require('react-native');
//   return {
//     IconSymbol: jest.fn(({ name, size, color, testID }) => (
//       <View testID={testID || `icon-${name}`} style={{ width: size, height: size }} />
//     ))
//   };
// });

// jest.mock('expo-camera', () => {
//   const React = require('react');
//   const { View } = require('react-native');
//   return {
//     CameraView: React.forwardRef((props: any, ref: any) => (
//       <View testID="camera-view" {...props} ref={ref} />
//     )),
//     CameraType: { front: 'front', back: 'back' },
//     useCameraPermissions: jest.fn(() => [
//       { granted: true, canAskAgain: true, status: 'granted' },
//       jest.fn(),
//     ]),
//   };
// });

// // 模拟真实的条码类型（覆盖组件中配置的所有条码类型）
// const VALID_BARCODE_TYPES = ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_e', 'upc_a'];

// describe('ExpoCameraView Component', () => {
//   // 创建基础模拟函数和props
//   const mockCameraRef = { current: null };
//   const mockOnBarcodeScanned = jest.fn();
//   const mockOnClose = jest.fn();
//   const mockOnToggleCamera = jest.fn();
//   const mockOnToggleScanType = jest.fn();
//   const mockOnCameraReady = jest.fn();
//   const mockOnTakePhoto = jest.fn();

//   const defaultProps = {
//     cameraRef: mockCameraRef,
//     facing: 'back' as const,
//     scanType: ScanType.BARCODE,
//     onClose: mockOnClose,
//     onToggleCamera: mockOnToggleCamera,
//     onToggleScanType: mockOnToggleScanType,
//     onCameraReady: mockOnCameraReady,
//     onBarCodeScanned: mockOnBarcodeScanned,
//     onTakePhoto: mockOnTakePhoto,
//   };

//   // 每个测试前重置mock
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   // 封装带主题的渲染函数
//   const setup = (propsOverride = {}) => {
//     return render(
//       <TamaguiProvider config={testConfig}>
//         <ExpoCameraView {...defaultProps} {...propsOverride} />
//       </TamaguiProvider>
//     );
//   };

//   // ========== 原有测试用例保持不变 ==========
//   test('renders correctly in Barcode mode with all elements', () => {
//     setup({ scanType: ScanType.BARCODE });
//     expect(screen.getByTestId('camera-view')).toBeTruthy();
//     expect(screen.getByTestId('icon-xmark')).toBeTruthy();
//     expect(screen.getByTestId('icon-camera.rotate')).toBeTruthy();
//     expect(screen.getByText('扫描条形码')).toBeTruthy();
//     expect(screen.getByText('将条码对准框内')).toBeTruthy();
//     expect(screen.getByTestId('icon-doc.text.viewfinder')).toBeTruthy();
//     expect(screen.getByText('去拍照')).toBeTruthy();
//     expect(screen.queryByTestId('capture-button')).toBeFalsy();
//   });

//   test('renders correctly in OCR mode with all elements', () => {
//     setup({ scanType: ScanType.OCR });
//     expect(screen.getByText('拍照识别成分')).toBeTruthy();
//     expect(screen.getByText('确保配料表文字清晰可见')).toBeTruthy();
//     expect(screen.getByTestId('icon-barcode.viewfinder')).toBeTruthy();
//     expect(screen.getByText('去扫码')).toBeTruthy();
//     expect(screen.getByTestId('capture-button')).toBeTruthy();
//   });

//   test('triggers onClose when close button is pressed', () => {
//     setup();
//     fireEvent.press(screen.getByTestId('icon-xmark'));
//     expect(mockOnClose).toHaveBeenCalledTimes(1);
//   });

//   test('triggers onToggleCamera when rotate button is pressed', () => {
//     setup();
//     fireEvent.press(screen.getByTestId('icon-camera.rotate'));
//     expect(mockOnToggleCamera).toHaveBeenCalledTimes(1);
//   });

//   test('triggers onToggleScanType when mode button is pressed', () => {
//     setup({ scanType: ScanType.BARCODE });
//     fireEvent.press(screen.getByText('去拍照'));
//     expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);

//     mockOnToggleScanType.mockClear();
//     setup({ scanType: ScanType.OCR });
//     fireEvent.press(screen.getByText('去扫码'));
//     expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);
//   });

//   test('triggers onTakePhoto when capture button is pressed in OCR mode', () => {
//     setup({ scanType: ScanType.OCR });
//     fireEvent.press(screen.getByTestId('capture-button'));
//     expect(mockOnTakePhoto).toHaveBeenCalledTimes(1);
//   });

//   test('passes onCameraReady prop to CameraView', () => {
//     setup();
//     const cameraView = screen.getByTestId('camera-view');
//     fireEvent(cameraView, 'onCameraReady');
//     expect(mockOnCameraReady).toHaveBeenCalledTimes(1);
//   });

//   test('triggers onBarCodeScanned only in BARCODE mode', () => {
//     const testBarcode = { data: '123456', type: 'ean13' };

//     setup({ scanType: ScanType.BARCODE });
//     const barcodeCamera = screen.getByTestId('camera-view');
//     fireEvent(barcodeCamera, 'onBarcodeScanned', testBarcode);
//     expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);

//     mockOnBarcodeScanned.mockClear();
//     setup({ scanType: ScanType.OCR });
//     const ocrCamera = screen.getByTestId('camera-view');
//     fireEvent(ocrCamera, 'onBarcodeScanned', testBarcode);
//     expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
//   });

//   test('passes correct facing prop to CameraView', () => {
//     setup({ facing: 'back' });
//     expect(screen.getByTestId('camera-view').props.facing).toBe('back');

//     setup({ facing: 'front' });
//     expect(screen.getByTestId('camera-view').props.facing).toBe('front');
//   });

//   // ========== 新增：真实条形码识别测试用例 ==========

//   /**
//    * 测试10：支持所有配置的条码类型识别
//    */
//   test('supports all configured barcode types', () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');

//     // 遍历所有支持的条码类型，验证都能正确触发回调
//     VALID_BARCODE_TYPES.forEach((barcodeType) => {
//       const testBarcode = {
//         data: `test-${barcodeType}-123456`,
//         type: barcodeType
//       };

//       fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
//       expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);
//       mockOnBarcodeScanned.mockClear(); // 重置以便下一次验证
//     });
//   });

//   /**
//    * 测试11：重复扫描相同条码仅触发一次回调（防抖逻辑）
//    */
//   test('prevents duplicate barcode scans for the same data', async () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');
//     const testBarcode = { data: '123456789012', type: 'ean13' };

//     // 模拟连续扫描相同条码5次
//     for (let i = 0; i < 5; i++) {
//       fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
//       await waitFor(() => {}, { timeout: 10 }); // 模拟扫描间隔
//     }

//     // 验证仅触发一次回调（模拟防抖逻辑）
//     expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(1);
//     expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);
//   });

//   /**
//    * 测试12：不同条码连续扫描都能触发回调
//    */
//   test('triggers callback for different consecutive barcodes', () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');

//     // 定义不同类型的测试条码
//     const barcodes = [
//       { data: '123456789012', type: 'ean13' },
//       { data: '12345678', type: 'ean8' },
//       { data: 'ABC123', type: 'code128' },
//       { data: 'QR123456', type: 'qr' }
//     ];

//     // 依次扫描不同条码
//     barcodes.forEach((barcode, index) => {
//       fireEvent(cameraView, 'onBarcodeScanned', barcode);
//       expect(mockOnBarcodeScanned).toHaveBeenCalledTimes(index + 1);
//       expect(mockOnBarcodeScanned).toHaveBeenLastCalledWith(barcode);
//     });
//   });

//   /**
//    * 测试13：空条码/无效条码不触发回调
//    */
//   test('does not trigger callback for empty or invalid barcodes', () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');

//     // 测试空数据条码
//     fireEvent(cameraView, 'onBarcodeScanned', { data: '', type: 'ean13' });
//     // 测试null数据条码
//     fireEvent(cameraView, 'onBarcodeScanned', { data: null, type: 'ean13' });
//     // 测试不支持的条码类型
//     fireEvent(cameraView, 'onBarcodeScanned', { data: '123456', type: 'unsupported' });

//     // 验证回调未被触发
//     expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
//   });

//   /**
//    * 测试14：条码数据格式验证（EAN13格式校验）
//    */
//   test('validates EAN13 barcode format before triggering callback', () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');

//     // 有效的EAN13条码（13位数字）
//     const validEAN13 = { data: '1234567890128', type: 'ean13' };
//     fireEvent(cameraView, 'onBarcodeScanned', validEAN13);
//     expect(mockOnBarcodeScanned).toHaveBeenCalledWith(validEAN13);
//     mockOnBarcodeScanned.mockClear();

//     // 无效的EAN13条码（不足13位）
//     fireEvent(cameraView, 'onBarcodeScanned', { data: '123456', type: 'ean13' });
//     // 无效的EAN13条码（包含非数字字符）
//     fireEvent(cameraView, 'onBarcodeScanned', { data: '123456789012a', type: 'ean13' });

//     // 验证无效条码未触发回调
//     expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
//   });

//   /**
//    * 测试15：相机就绪后才响应条码扫描
//    */
//   test('only responds to barcode scans after camera is ready', async () => {
//     setup({ scanType: ScanType.BARCODE });
//     const cameraView = screen.getByTestId('camera-view');
//     const testBarcode = { data: '1234567890128', type: 'ean13' };

//     // 相机未就绪时扫描条码
//     fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
//     expect(mockOnBarcodeScanned).not.toHaveBeenCalled();

//     // 触发相机就绪事件
//     fireEvent(cameraView, 'onCameraReady');
//     expect(mockOnCameraReady).toHaveBeenCalled();

//     // 相机就绪后扫描条码
//     fireEvent(cameraView, 'onBarcodeScanned', testBarcode);
//     expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);
//   });
// });
