import { LottieAnimation } from '@/src/components/LottieAnimation';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { CameraFacing } from '@/src/types/camera';
import { CameraView } from 'expo-camera';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CameraViewComponentProps {
  cameraRef: React.RefObject<CameraView | null>;
  facing: CameraFacing;
  onCapture: () => void;
  onToggleFacing: () => void;
  onClose?: () => void;
  onCameraReady?: () => void;
}

export function CameraViewComponent({
  cameraRef,
  facing,
  onCapture,
  onToggleFacing,
  onClose,
  onCameraReady,
}: CameraViewComponentProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <LottieAnimation
        source={require('@/assets/animations/orange_cat_peeping.json')} // json文件路径
        width={200}
        height={200}
      />
      <CameraView
        ref={cameraRef}
        style={[styles.camera, { borderColor: colors.cameraBorder }]}
        facing={facing}
        onCameraReady={onCameraReady}
      >
        <View style={styles.topBar}>
          {onClose && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.cameraIconBackground }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark" size={28} color={colors.cameraIcon} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cameraIconBackground }]}
            onPress={onToggleFacing}
            activeOpacity={0.7}
          >
            <IconSymbol name="photo.fill.on.rectangle.fill" size={32} color={colors.cameraIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              {
                backgroundColor: colors.captureButton,
                borderColor: colors.captureButtonBorder,
              },
            ]}
            onPress={onCapture}
            activeOpacity={0.8}
          >
            <View style={[styles.captureButtonInner, { backgroundColor: colors.captureButton }]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cameraIconBackground }]}
            onPress={onToggleFacing}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="arrow.triangle.2.circlepath.camera"
              size={32}
              color={colors.cameraIcon}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 0.7,
    backgroundColor: '#000',
    marginTop: '40%',
    width: '90%',
    height: '60%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 50,
    borderWidth: 10,
    // borderColor 动态设置
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '7%',
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '8%',
    paddingBottom: '7%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor 动态设置
    borderRadius: 25,
  },

  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    // backgroundColor 和 borderColor 动态设置
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },

  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor 动态设置
  },
});
