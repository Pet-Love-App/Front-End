/**
 * ScanFrame - 扫描框组件
 */

import React, { useRef } from 'react';
import { Animated, LayoutChangeEvent, View } from 'react-native';
import { Text, YStack } from 'tamagui';

import { ScanType } from '@/src/types/camera';

interface ScanFrameProps {
  scanType: ScanType;
  frameScale: Animated.Value;
  frameBorderWidth: Animated.AnimatedInterpolation<number>;
  onLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
}

export function ScanFrame({ scanType, frameScale, frameBorderWidth, onLayout }: ScanFrameProps) {
  const frameRef = useRef<View>(null);

  // 测量扫描框在屏幕上的实际位置
  const handleLayout = (event: LayoutChangeEvent) => {
    if (frameRef.current && onLayout) {
      frameRef.current.measureInWindow((x, y, width, height) => {
        console.log('🎯 扫描框实际位置:', { x, y, width, height });
        onLayout({ x, y, width, height });
      });
    }
  };

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      justifyContent="center"
      alignItems="center"
      pointerEvents="none"
    >
      {scanType === ScanType.BARCODE ? (
        // 条码扫描框
        <Animated.View
          ref={frameRef}
          onLayout={handleLayout}
          style={{
            width: 260,
            height: 260,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
            transform: [{ scale: frameScale }],
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 12,
              borderColor: '#00FFFF',
              borderWidth: frameBorderWidth,
            }}
          />
          <YStack width="90%" height={2} backgroundColor="#00FFFF" opacity={0.8} />
          <Text color="white" fontSize={12} position="absolute" bottom={-30}>
            将条码对准框内
          </Text>
        </Animated.View>
      ) : (
        // OCR拍照框
        <Animated.View
          ref={frameRef}
          onLayout={handleLayout}
          style={{
            width: '90%',
            height: 400,
            borderRadius: 20,
            transform: [{ scale: frameScale }],
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 20,
              borderColor: 'rgba(255,255,255,0.5)',
              borderWidth: frameBorderWidth,
              borderStyle: 'dashed',
            }}
          />
          <Text color="white" fontSize={12} position="absolute" bottom={-30} alignSelf="center">
            确保配料表文字清晰可见
          </Text>
        </Animated.View>
      )}
    </YStack>
  );
}
