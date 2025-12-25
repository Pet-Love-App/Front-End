import { Modal, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface CameraPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onClose?: () => void;
}

/**
 * 相机权限请求模态框
 * 以弹窗形式请求相机权限，提供更好的用户体验
 */
export function CameraPermissionModal({
  visible,
  onRequestPermission,
  onClose,
}: CameraPermissionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.6)']}
          style={styles.gradient}
        >
          {/* 模态框内容 */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <YStack
              backgroundColor="white"
              borderRadius="$6"
              padding="$6"
              margin="$4"
              maxWidth={400}
              alignSelf="center"
              alignItems="center"
              gap="$4"
            >
              {/* 相机图标 */}
              <YStack
                width={80}
                height={80}
                borderRadius="$12"
                backgroundColor="#FFF5ED"
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor="#FFE4D1"
              >
                <IconSymbol name="camera.fill" size={40} color="#FEBE98" />
              </YStack>

              {/* 标题 */}
              <RNText style={styles.title}>需要相机权限</RNText>

              {/* 说明文字 */}
              <RNText style={styles.description}>
                为了扫描猫粮成分表，需要访问您的相机。我们不会存储或上传您的照片。
              </RNText>

              {/* 权限说明列表 */}
              <View style={styles.permissionList}>
                <View style={styles.permissionItem}>
                  <View style={styles.checkIcon}>
                    <RNText style={styles.checkMark}>✓</RNText>
                  </View>
                  <RNText style={styles.permissionText}>拍摄猫粮成分表</RNText>
                </View>
                <View style={styles.permissionItem}>
                  <View style={styles.checkIcon}>
                    <RNText style={styles.checkMark}>✓</RNText>
                  </View>
                  <RNText style={styles.permissionText}>扫描条形码快速识别</RNText>
                </View>
                <View style={styles.permissionItem}>
                  <View style={styles.checkIcon}>
                    <RNText style={styles.checkMark}>✓</RNText>
                  </View>
                  <RNText style={styles.permissionText}>离线处理，保护隐私</RNText>
                </View>
              </View>

              {/* 按钮组 */}
              <YStack width="100%" gap="$3" marginTop="$2">
                {/* 授予权限按钮 */}
                <Button
                  size="$5"
                  backgroundColor="#FEBE98"
                  color="white"
                  borderRadius="$4"
                  borderWidth={2}
                  borderColor="#FCA574"
                  onPress={onRequestPermission}
                  fontWeight="800"
                  fontSize={16}
                  pressStyle={{ scale: 0.98, backgroundColor: '#FCA574' }}
                  height={56}
                >
                  授予相机权限
                </Button>

                {/* 取消按钮（可选） */}
                {onClose && (
                  <Button
                    size="$4"
                    backgroundColor="transparent"
                    color="#6B7280"
                    onPress={onClose}
                    fontWeight="600"
                    fontSize={14}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    稍后再说
                  </Button>
                )}
              </YStack>
            </YStack>
          </Pressable>
        </LinearGradient>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  permissionList: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    color: 'white',
    fontWeight: '900',
  },
  permissionText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },
});
