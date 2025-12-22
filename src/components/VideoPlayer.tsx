/**
 * VideoPlayer - 视频播放器组件
 *
 * 使用 expo-av 实现简单的视频播放功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { Modal, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { X } from '@tamagui/lucide-icons';
import { Stack, YStack, Text } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface VideoPlayerProps {
  /** 是否显示 */
  visible: boolean;
  /** 视频 URL */
  videoUrl: string;
  /** 关闭回调 */
  onClose: () => void;
}

export function VideoPlayer({ visible, videoUrl, onClose }: VideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setError(null);
    } else if (status.error) {
      setIsLoading(false);
      setError(status.error);
    }
  };

  // 当组件挂载时重置状态
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setError(null);
    }
  }, [visible]);

  const handleClose = () => {
    // 停止播放
    videoRef.current?.pauseAsync();
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.95)">
        {/* 关闭按钮 */}
        <Stack position="absolute" top={insets.top + 16} right={16} zIndex={10}>
          <Pressable onPress={handleClose} testID="close-button">
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              alignItems="center"
              justifyContent="center"
            >
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </Stack>
          </Pressable>
        </Stack>

        {/* 视频播放器 */}
        <Stack flex={1} justifyContent="center" alignItems="center">
          {error ? (
            <YStack gap="$4" alignItems="center">
              <Text fontSize={48}>⚠️</Text>
              <Text color="$color" fontSize={16}>
                视频加载失败
              </Text>
              <Text color="$color" fontSize={14} opacity={0.6}>
                {error}
              </Text>
            </YStack>
          ) : (
            <>
              <Video
                ref={videoRef}
                source={{
                  uri: videoUrl,
                  // 优化视频加载
                  overrideFileExtensionAndroid: videoUrl.includes('.mp4') ? 'mp4' : undefined,
                }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                // 启用流式播放，不需要等待完全下载
                progressUpdateIntervalMillis={500}
                // 优化缓冲
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                // 视频质量优化
                onError={(error) => {
                  console.error('Video playback error:', error);
                  setError('视频播放失败，请检查网络连接');
                }}
              />
              {isLoading && (
                <Stack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  alignItems="center"
                  justifyContent="center"
                >
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
});
