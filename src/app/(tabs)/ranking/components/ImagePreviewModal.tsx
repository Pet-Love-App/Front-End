import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface ImagePreviewModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

/**
 * 图片预览模态框组件
 * 全屏显示猫粮图片
 */
export function ImagePreviewModal({ visible, imageUrl, onClose }: ImagePreviewModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.96)', 'rgba(0, 0, 0, 0.94)', 'rgba(0, 0, 0, 0.96)']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* 顶部工具栏 */}
          <XStack
            position="absolute"
            top={60}
            left={0}
            right={0}
            paddingHorizontal="$5"
            justifyContent="space-between"
            alignItems="center"
            zIndex={10}
          >
            <YStack
              paddingHorizontal="$4"
              paddingVertical="$2.5"
              backgroundColor="rgba(255, 255, 255, 0.1)"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.15)"
            >
              <Text fontSize={18} color="white" fontWeight="800" letterSpacing={0.5}>
                图片预览
              </Text>
            </YStack>
            <Pressable onPress={onClose}>
              <XStack
                width={48}
                height={48}
                borderRadius="$12"
                backgroundColor="rgba(255, 255, 255, 0.12)"
                alignItems="center"
                justifyContent="center"
                borderWidth={1.5}
                borderColor="rgba(255, 255, 255, 0.18)"
              >
                <IconSymbol name="xmark" size={22} color="white" />
              </XStack>
            </Pressable>
          </XStack>

          {/* 预览图片 */}
          {imageUrl && (
            <YStack flex={1} width="100%" justifyContent="center" alignItems="center" padding="$8">
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 16,
                }}
                resizeMode="contain"
              />
            </YStack>
          )}

          {/* 底部提示 */}
          <YStack
            position="absolute"
            bottom={60}
            alignSelf="center"
            paddingHorizontal="$5"
            paddingVertical="$3"
            backgroundColor="rgba(255, 255, 255, 0.12)"
            borderRadius="$12"
            borderWidth={1.5}
            borderColor="rgba(255, 255, 255, 0.18)"
          >
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="hand.tap.fill" size={16} color="white" />
              <Text fontSize={14} color="white" fontWeight="700" letterSpacing={0.3}>
                点击任意位置关闭
              </Text>
            </XStack>
          </YStack>
        </LinearGradient>
      </Pressable>
    </Modal>
  );
}
