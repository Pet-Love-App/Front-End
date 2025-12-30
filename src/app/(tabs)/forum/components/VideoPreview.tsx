/**
 * VideoPreview - 视频预览组件
 *
 * 用于在发帖编辑器和论坛中显示视频预览
 * 支持：
 * - 视频第一帧缩略图
 * - 播放按钮覆盖层
 * - 加载状态
 */

import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Play } from '@tamagui/lucide-icons';
import { Stack, Text } from 'tamagui';
import { generateVideoThumbnail } from '@/src/utils/videoThumbnail';

interface VideoPreviewProps {
  videoUri: string;
  width: number | string;
  height: number | string;
  showPlayButton?: boolean;
  onPress?: () => void;
}

export function VideoPreview({
  videoUri,
  width,
  height,
  showPlayButton = true,
  onPress,
}: VideoPreviewProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadThumbnail = async () => {
      try {
        setIsGenerating(true);
        setError(false);
        const thumb = await generateVideoThumbnail(videoUri);

        if (mounted) {
          if (thumb) {
            setThumbnail(thumb);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error('加载视频缩略图失败:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setIsGenerating(false);
        }
      }
    };

    loadThumbnail();

    return () => {
      mounted = false;
    };
  }, [videoUri]);

  const numericWidth = typeof width === 'number' ? width : undefined;
  const numericHeight = typeof height === 'number' ? height : undefined;

  return (
    <Stack
      width={numericWidth}
      height={numericHeight}
      style={typeof width === 'string' ? { width, height } : undefined}
      backgroundColor="#1a1a1a"
      justifyContent="center"
      alignItems="center"
      position="relative"
      testID="video-preview-container"
      onPress={onPress}
    >
      {isGenerating ? (
        // 加载中
        <Stack alignItems="center" gap="$2" testID="video-preview-loading">
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text color="#FFFFFF" fontSize={12} opacity={0.8}>
            生成预览...
          </Text>
        </Stack>
      ) : error || !thumbnail ? (
        // 加载失败 - 显示默认的视频图标
        <Stack alignItems="center" gap="$2" testID="video-preview-error">
          <Play size={48} color="#FFFFFF" opacity={0.6} />
          <Text color="#FFFFFF" fontSize={12} opacity={0.6}>
            视频预览
          </Text>
        </Stack>
      ) : (
        // 显示缩略图
        <>
          <Image
            source={{ uri: thumbnail }}
            style={[
              StyleSheet.absoluteFill,
              { width: numericWidth || '100%', height: numericHeight || '100%' },
            ]}
            resizeMode="cover"
            testID="video-preview-thumbnail"
          />
          {showPlayButton && (
            <Stack
              position="absolute"
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor="rgba(0, 0, 0, 0.6)"
              alignItems="center"
              justifyContent="center"
              testID="video-play-button"
            >
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
