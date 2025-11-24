import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';

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
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

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
                backgroundColor="#EFF6FF"
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor="#DBEAFE"
              >
                <IconSymbol name="camera.fill" size={40} color="#3B82F6" />
              </YStack>

              {/* 标题 */}
              <Text fontSize={22} fontWeight="900" color="#111827" textAlign="center">
                需要相机权限
              </Text>

              {/* 说明文字 */}
              <Text
                fontSize={15}
                color="#6B7280"
                textAlign="center"
                lineHeight={22}
                fontWeight="500"
              >
                为了扫描猫粮成分表，需要访问您的相机。我们不会存储或上传您的照片。
              </Text>

              {/* 权限说明列表 */}
              <YStack
                width="100%"
                backgroundColor="#F9FAFB"
                borderRadius="$4"
                padding="$3"
                gap="$2.5"
              >
                <XStack alignItems="center" gap="$2.5">
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                  <Text fontSize={13} color="#4B5563" fontWeight="600" flex={1}>
                    拍摄猫粮成分表
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$2.5">
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                  <Text fontSize={13} color="#4B5563" fontWeight="600" flex={1}>
                    扫描条形码快速识别
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$2.5">
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                  <Text fontSize={13} color="#4B5563" fontWeight="600" flex={1}>
                    离线处理，保护隐私
                  </Text>
                </XStack>
              </YStack>

              {/* 按钮组 */}
              <YStack width="100%" gap="$3" marginTop="$2">
                {/* 授予权限按钮 */}
                <Button
                  size="$5"
                  backgroundColor="#3B82F6"
                  color="white"
                  borderRadius="$4"
                  borderWidth={2}
                  borderColor="#2563EB"
                  onPress={onRequestPermission}
                  fontWeight="800"
                  fontSize={16}
                  pressStyle={{ scale: 0.98, backgroundColor: '#2563EB' }}
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
});
