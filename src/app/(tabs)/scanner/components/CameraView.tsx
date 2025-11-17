import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { CameraFacing } from '@/src/types/camera';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

/**
 * 相机视图配置常量
 */
const CAMERA_CONFIG = {
  /** 相机视图高度百分比 */
  CAMERA_HEIGHT_RATIO: 0.75,
  /** 扫描框宽度百分比 */
  SCAN_FRAME_WIDTH_RATIO: 0.85,
  /** 扫描框圆角 */
  SCAN_FRAME_BORDER_RADIUS: 24,
  /** 扫描框边框宽度 */
  SCAN_FRAME_BORDER_WIDTH: 3,
  /** 底部工具栏高度 */
  TOOLBAR_HEIGHT: 120,
} as const;

/**
 * 相机视图组件属性
 */
interface CameraViewComponentProps {
  /** 相机引用 */
  cameraRef: React.RefObject<CameraView | null>;
  /** 相机朝向 */
  facing: CameraFacing;
  /** 拍照回调 */
  onCapture: () => void;
  /** 切换相机朝向回调 */
  onToggleFacing: () => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 相机准备就绪回调 */
  onCameraReady?: () => void;
  /** 从相册选择图片回调 */
  onImageSelected?: (uri: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 相机视图组件
 *
 * @description
 * 提供拍照和从相册选择图片的功能，采用现代化设计和企业级代码标准。
 *
 * @features
 * - ✅ 实时相机预览
 * - ✅ 拍照功能
 * - ✅ 切换前后摄像头
 * - ✅ 从相册选择照片
 * - ✅ 扫描框引导
 * - ✅ 加载状态反馈
 * - ✅ 现代化 UI 设计
 *
 * @architecture
 * - UI Components: Tamagui 组件系统
 * - Layout: 安全区域适配
 * - State Management: React Hooks
 * - Image Picker: expo-image-picker
 *
 * @example
 * ```tsx
 * <CameraViewComponent
 *   cameraRef={cameraRef}
 *   facing={facing}
 *   onCapture={handleCapture}
 *   onToggleFacing={toggleFacing}
 *   onClose={handleClose}
 *   onImageSelected={handleImageSelected}
 * />
 * ```
 */
export function CameraViewComponent({
  cameraRef,
  facing,
  onCapture,
  onToggleFacing,
  onClose,
  onCameraReady,
  onImageSelected,
}: CameraViewComponentProps) {
  const insets = useSafeAreaInsets();
  const [isPickingImage, setIsPickingImage] = useState(false);

  /**
   * 从相册选择图片
   */
  const handlePickImage = useCallback(async () => {
    try {
      setIsPickingImage(true);

      // 请求相册权限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('需要相册权限', '请在设置中允许访问相册');
        return;
      }

      // 打开图片选择器
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        onImageSelected?.(imageUri);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('选择失败', '无法从相册选择图片，请重试');
    } finally {
      setIsPickingImage(false);
    }
  }, [onImageSelected]);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 头部工具栏 */}
      <XStack
        paddingTop={insets.top + 16}
        paddingBottom="$3"
        paddingHorizontal="$4"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$background"
      >
        <YStack flex={1}>
          <Text fontSize="$7" fontWeight="bold" color="$color">
            拍摄配料表
          </Text>
          <Text fontSize="$3" color="$gray10" marginTop="$1">
            请对准配料表拍摄清晰照片
          </Text>
        </YStack>

        {onClose && (
          <Button
            circular
            size="$4"
            chromeless
            icon={<IconSymbol name="xmark.circle.fill" size={32} color="$gray10" />}
            onPress={onClose}
            accessibilityLabel="关闭相机"
          />
        )}
      </XStack>

      {/* 相机预览区域 */}
      <YStack flex={1} position="relative" justifyContent="center" alignItems="center">
        {/* 相机视图 */}
        <YStack
          width="100%"
          height="100%"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
        >
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            onCameraReady={onCameraReady}
          />
        </YStack>

        {/* 扫描框遮罩 */}
        <ScanFrameOverlay />

        {/* 提示文字 */}
        <YStack
          position="absolute"
          top="$6"
          left={0}
          right={0}
          alignItems="center"
          paddingHorizontal="$4"
        >
          <YStack
            backgroundColor="rgba(0, 0, 0, 0.6)"
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$4"
            backdropFilter="blur(10px)"
          >
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="lightbulb.fill" size={16} color="$yellow9" />
              <Text fontSize="$3" color="white" fontWeight="500">
                对准配料表，确保文字清晰可见
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* 底部工具栏 */}
      <YStack
        paddingTop="$4"
        paddingBottom={insets.bottom + 16}
        paddingHorizontal="$4"
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$gray5"
      >
        <BottomToolbar
          onCapture={onCapture}
          onToggleFacing={onToggleFacing}
          onPickImage={handlePickImage}
          isPickingImage={isPickingImage}
        />
      </YStack>
    </YStack>
  );
}

/**
 * 扫描框遮罩组件
 *
 * @description
 * 显示扫描框和半透明遮罩，引导用户对准拍摄区域
 */
function ScanFrameOverlay() {
  const frameWidth = SCREEN_WIDTH * CAMERA_CONFIG.SCAN_FRAME_WIDTH_RATIO;
  const frameHeight = frameWidth * 1.2; // 纵向矩形

  return (
    <>
      {/* 上遮罩 */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        height={`${((1 - CAMERA_CONFIG.CAMERA_HEIGHT_RATIO) / 2) * 100}%`}
        backgroundColor="rgba(0, 0, 0, 0.5)"
      />

      {/* 左右遮罩和扫描框 */}
      <XStack
        position="absolute"
        top={`${((1 - CAMERA_CONFIG.CAMERA_HEIGHT_RATIO) / 2) * 100}%`}
        left={0}
        right={0}
        height={`${CAMERA_CONFIG.CAMERA_HEIGHT_RATIO * 100}%`}
        alignItems="center"
        justifyContent="center"
      >
        {/* 左遮罩 */}
        <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.5)" height="100%" />

        {/* 扫描框 */}
        <YStack
          width={frameWidth}
          height={frameHeight}
          borderWidth={CAMERA_CONFIG.SCAN_FRAME_BORDER_WIDTH}
          borderColor="$green9"
          borderRadius={CAMERA_CONFIG.SCAN_FRAME_BORDER_RADIUS}
          position="relative"
        >
          {/* 四个角的装饰线 */}
          <ScanFrameCorners />
        </YStack>

        {/* 右遮罩 */}
        <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.5)" height="100%" />
      </XStack>

      {/* 下遮罩 */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height={`${((1 - CAMERA_CONFIG.CAMERA_HEIGHT_RATIO) / 2) * 100}%`}
        backgroundColor="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
}

/**
 * 扫描框四角装饰组件
 *
 * @description
 * 在扫描框四个角显示装饰性线条，增强视觉效果
 */
function ScanFrameCorners() {
  const cornerSize = 24;
  const cornerWidth = 4;

  return (
    <>
      {/* 左上角 */}
      <YStack position="absolute" top={-2} left={-2}>
        <YStack width={cornerSize} height={cornerWidth} backgroundColor="$green9" />
        <YStack width={cornerWidth} height={cornerSize} backgroundColor="$green9" />
      </YStack>

      {/* 右上角 */}
      <YStack position="absolute" top={-2} right={-2}>
        <YStack width={cornerSize} height={cornerWidth} backgroundColor="$green9" />
        <YStack
          position="absolute"
          right={0}
          width={cornerWidth}
          height={cornerSize}
          backgroundColor="$green9"
        />
      </YStack>

      {/* 左下角 */}
      <YStack position="absolute" bottom={-2} left={-2}>
        <YStack width={cornerWidth} height={cornerSize} backgroundColor="$green9" />
        <YStack
          position="absolute"
          bottom={0}
          width={cornerSize}
          height={cornerWidth}
          backgroundColor="$green9"
        />
      </YStack>

      {/* 右下角 */}
      <YStack position="absolute" bottom={-2} right={-2}>
        <YStack
          position="absolute"
          right={0}
          width={cornerWidth}
          height={cornerSize}
          backgroundColor="$green9"
        />
        <YStack
          position="absolute"
          bottom={0}
          width={cornerSize}
          height={cornerWidth}
          backgroundColor="$green9"
        />
      </YStack>
    </>
  );
}

/**
 * 底部工具栏组件属性
 */
interface BottomToolbarProps {
  /** 拍照回调 */
  onCapture: () => void;
  /** 切换相机回调 */
  onToggleFacing: () => void;
  /** 选择图片回调 */
  onPickImage: () => void;
  /** 是否正在选择图片 */
  isPickingImage: boolean;
}

/**
 * 底部工具栏组件
 *
 * @description
 * 包含拍照、切换相机、选择相册等操作按钮
 */
function BottomToolbar({
  onCapture,
  onToggleFacing,
  onPickImage,
  isPickingImage,
}: BottomToolbarProps) {
  return (
    <XStack justifyContent="space-between" alignItems="center" gap="$3">
      {/* 相册选择按钮 */}
      <YStack alignItems="center" gap="$2" minWidth={80}>
        <Button
          size="$5"
          circular
          backgroundColor="$gray5"
          borderWidth={2}
          borderColor="$gray7"
          icon={
            isPickingImage ? (
              <Spinner size="small" color="$gray11" />
            ) : (
              <IconSymbol name="photo.on.rectangle" size={28} color="$gray11" />
            )
          }
          onPress={onPickImage}
          disabled={isPickingImage}
          pressStyle={{ scale: 0.95 }}
          animation="bouncy"
          accessibilityLabel="从相册选择"
        />
        <Text fontSize="$2" color="$gray11" textAlign="center">
          相册
        </Text>
      </YStack>

      {/* 拍照按钮 */}
      <YStack alignItems="center" gap="$2">
        <Button
          size="$6"
          circular
          backgroundColor="white"
          borderWidth={4}
          borderColor="$gray11"
          onPress={onCapture}
          pressStyle={{ scale: 0.9 }}
          animation="bouncy"
          accessibilityLabel="拍照"
        >
          <YStack
            width={60}
            height={60}
            borderRadius="$12"
            backgroundColor="white"
            borderWidth={2}
            borderColor="$gray11"
          />
        </Button>
        <Text fontSize="$3" color="$color" fontWeight="600" textAlign="center">
          拍照
        </Text>
      </YStack>

      {/* 切换相机按钮 */}
      <YStack alignItems="center" gap="$2" minWidth={80}>
        <Button
          size="$5"
          circular
          backgroundColor="$gray5"
          borderWidth={2}
          borderColor="$gray7"
          icon={<IconSymbol name="arrow.triangle.2.circlepath.camera" size={28} color="$gray11" />}
          onPress={onToggleFacing}
          pressStyle={{ scale: 0.95 }}
          animation="bouncy"
          accessibilityLabel="切换相机"
        />
        <Text fontSize="$2" color="$gray11" textAlign="center">
          翻转
        </Text>
      </YStack>
    </XStack>
  );
}
