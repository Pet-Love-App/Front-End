import { ExpoCameraView } from '@/src//app/(tabs)/scanner/_components/ExpoCameraView';
import { ScanType } from '@/src/types/camera';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { fireEvent, render, screen } from '@testing-library/react-native';

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

describe('ExpoCameraView Component', () => {
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
  };

  // 每个测试前重置mock
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 封装带主题的渲染函数
  const setup = (propsOverride = {}) => {
    return render(
      <TamaguiProvider config={testConfig}>
        <ExpoCameraView {...defaultProps} {...propsOverride} />
      </TamaguiProvider>
    );
  };

  /**
   * 测试1：基础渲染 - 条形码模式
   */
  test('renders correctly in Barcode mode with all elements', () => {
    setup({ scanType: ScanType.BARCODE });

    // 验证相机视图渲染
    expect(screen.getByTestId('camera-view')).toBeTruthy();

    // 验证顶部工具栏元素
    expect(screen.getByTestId('icon-xmark')).toBeTruthy();
    expect(screen.getByTestId('icon-camera.rotate')).toBeTruthy();
    expect(screen.getByText('扫描条形码')).toBeTruthy();

    // 验证扫描框和提示文字
    expect(screen.getByText('将条码对准框内')).toBeTruthy();

    // 验证底部操作栏
    expect(screen.getByTestId('icon-doc.text.viewfinder')).toBeTruthy();
    expect(screen.getByText('去拍照')).toBeTruthy();
    // 条形码模式下不应显示拍照按钮
    expect(screen.queryByTestId('capture-button')).toBeFalsy();
  });

  /**
   * 测试2：基础渲染 - OCR模式
   */
  test('renders correctly in OCR mode with all elements', () => {
    setup({ scanType: ScanType.OCR });

    // 验证顶部标题
    expect(screen.getByText('拍照识别成分')).toBeTruthy();

    // 验证扫描框和提示文字
    expect(screen.getByText('确保配料表文字清晰可见')).toBeTruthy();

    // 验证底部操作栏
    expect(screen.getByTestId('icon-barcode.viewfinder')).toBeTruthy();
    expect(screen.getByText('去扫码')).toBeTruthy();
    // OCR模式下应显示拍照按钮
    expect(screen.getByTestId('capture-button')).toBeTruthy();
  });

  /**
   * 测试3：关闭按钮交互
   */
  test('triggers onClose when close button is pressed', () => {
    setup();
    fireEvent.press(screen.getByTestId('icon-xmark'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * 测试4：切换相机按钮交互
   */
  test('triggers onToggleCamera when rotate button is pressed', () => {
    setup();
    fireEvent.press(screen.getByTestId('icon-camera.rotate'));
    expect(mockOnToggleCamera).toHaveBeenCalledTimes(1);
  });

  /**
   * 测试5：模式切换按钮交互
   */
  test('triggers onToggleScanType when mode button is pressed', () => {
    // 从条形码模式切换到OCR模式
    setup({ scanType: ScanType.BARCODE });
    fireEvent.press(screen.getByText('去拍照'));
    expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);

    // 重置计数
    mockOnToggleScanType.mockClear();

    // 从OCR模式切换到条形码模式
    setup({ scanType: ScanType.OCR });
    fireEvent.press(screen.getByText('去扫码'));
    expect(mockOnToggleScanType).toHaveBeenCalledTimes(1);
  });

  /**
   * 测试6：拍照按钮交互（仅OCR模式）
   */
  test('triggers onTakePhoto when capture button is pressed in OCR mode', () => {
    setup({ scanType: ScanType.OCR });
    fireEvent.press(screen.getByTestId('capture-button'));
    expect(mockOnTakePhoto).toHaveBeenCalledTimes(1);
  });

  /**
   * 测试7：相机准备就绪事件
   */
  test('passes onCameraReady prop to CameraView', () => {
    setup();
    const cameraView = screen.getByTestId('camera-view');
    // 触发相机就绪事件
    fireEvent(cameraView, 'onCameraReady');
    expect(mockOnCameraReady).toHaveBeenCalledTimes(1);
  });

  /**
   * 测试8：条形码扫描事件（仅条形码模式）
   */
  test('triggers onBarCodeScanned only in BARCODE mode', () => {
    const testBarcode = { data: '123456', type: 'ean13' };

    // 条形码模式下应触发
    setup({ scanType: ScanType.BARCODE });
    const barcodeCamera = screen.getByTestId('camera-view');
    fireEvent(barcodeCamera, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).toHaveBeenCalledWith(testBarcode);

    // 重置计数
    mockOnBarcodeScanned.mockClear();

    // OCR模式下不应触发
    setup({ scanType: ScanType.OCR });
    const ocrCamera = screen.getByTestId('camera-view');
    fireEvent(ocrCamera, 'onBarcodeScanned', testBarcode);
    expect(mockOnBarcodeScanned).not.toHaveBeenCalled();
  });

  /**
   * 测试9：相机朝向属性传递
   */
  test('passes correct facing prop to CameraView', () => {
    // 后置摄像头
    setup({ facing: 'back' });
    expect(screen.getByTestId('camera-view').props.facing).toBe('back');

    // 前置摄像头
    setup({ facing: 'front' });
    expect(screen.getByTestId('camera-view').props.facing).toBe('front');
  });
});
