/**
 * ScanFrame - 扫描框组件
 */

import React, { useEffect, useRef } from 'react';
import { Animated, LayoutChangeEvent, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, YStack } from 'tamagui';
import { primaryScale, neutralScale } from '@/src/design-system/tokens/colors';

import { ScanType } from '@/src/types/camera';

interface ScanFrameProps {
  scanType: ScanType;
  frameScale: Animated.Value;
  frameBorderWidth: Animated.AnimatedInterpolation<number>;
  onLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
}

export function ScanFrame({ scanType, frameScale, frameBorderWidth, onLayout }: ScanFrameProps) {
  const frameRef = useRef<View>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // 扫描线动画
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  // 测量扫描框在屏幕上的实际位置
  const handleLayout = (event: LayoutChangeEvent) => {
    if (frameRef.current && onLayout) {
      frameRef.current.measureInWindow((x, y, width, height) => {
        onLayout({ x, y, width, height });
      });
    }
  };

  // 角标组件
  const Corner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const isTop = position.includes('t');
    const isLeft = position.includes('l');
    return (
      <View
        style={{
          position: 'absolute',
          top: isTop ? -2 : undefined,
          bottom: !isTop ? -2 : undefined,
          left: isLeft ? -2 : undefined,
          right: !isLeft ? -2 : undefined,
          width: 24,
          height: 24,
        }}
      >
        <LinearGradient
          colors={[primaryScale.primary6, primaryScale.primary8]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: isTop ? 0 : undefined,
            bottom: !isTop ? 0 : undefined,
            left: isLeft ? 0 : undefined,
            right: !isLeft ? 0 : undefined,
            width: 24,
            height: 4,
            borderRadius: 2,
          }}
        />
        <LinearGradient
          colors={[primaryScale.primary6, primaryScale.primary8]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: isTop ? 0 : undefined,
            bottom: !isTop ? 0 : undefined,
            left: isLeft ? 0 : undefined,
            right: !isLeft ? 0 : undefined,
            width: 4,
            height: 24,
            borderRadius: 2,
          }}
        />
      </View>
    );
  };

  const frameHeight = scanType === ScanType.BARCODE ? 260 : 400;
  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, frameHeight - 4],
  });

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
      <Animated.View
        ref={frameRef}
        onLayout={handleLayout}
        style={{
          width: scanType === ScanType.BARCODE ? 260 : '90%',
          height: frameHeight,
          borderRadius: 16,
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.05)',
          transform: [{ scale: frameScale }],
          overflow: 'hidden',
        }}
      >
        {/* 边框 */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            borderColor: 'rgba(255,255,255,0.3)',
            borderWidth: frameBorderWidth,
          }}
        />

        {/* 四角装饰 */}
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* 扫描线 */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 16,
            right: 16,
            height: 2,
            transform: [{ translateY: scanLineTranslateY }],
          }}
        >
          <LinearGradient
            colors={['transparent', primaryScale.primary7, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 1 }}
          />
        </Animated.View>
      </Animated.View>

      {/* 提示文字 */}
      <YStack
        backgroundColor="rgba(0,0,0,0.6)"
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderRadius="$6"
        marginTop="$4"
      >
        <Text color="white" fontSize={13} fontWeight="600" textAlign="center">
          {scanType === ScanType.BARCODE ? '将条码对准框内' : '确保配料表文字清晰可见'}
        </Text>
      </YStack>
    </YStack>
  );
}
