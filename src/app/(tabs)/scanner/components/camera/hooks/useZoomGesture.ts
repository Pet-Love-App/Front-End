/**
 * 相机缩放手势控制 Hook
 */

import * as Haptics from 'expo-haptics';
import { useCallback, useRef } from 'react';
import { PanResponder } from 'react-native';

interface UseZoomGestureProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

/**
 * 相机缩放手势 Hook
 * 支持双指捏合和双指垂直滑动两种方式
 */
export function useZoomGesture({ zoom, setZoom }: UseZoomGestureProps) {
  const lastDistance = useRef(0);
  const lastY = useRef(0);
  const isZooming = useRef(false);
  const zoomRef = useRef(zoom);

  // 保持 zoomRef 与 zoom 同步
  zoomRef.current = zoom;

  // 计算两指的平均Y坐标（用于垂直滑动）
  const getAverageY = useCallback((touches: any[]) => {
    if (touches.length < 2) return 0;
    return (touches[0].pageY + touches[1].pageY) / 2;
  }, []);

  // 计算两点之间的距离（用于捏合手势）
  const getDistance = useCallback((touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // 创建手势响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // 只在双指触摸时响应
        return evt.nativeEvent.touches.length === 2;
      },
      onMoveShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length === 2;
      },
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          isZooming.current = true;
          lastDistance.current = getDistance(evt.nativeEvent.touches);
          lastY.current = getAverageY(evt.nativeEvent.touches);
          console.log('🎯 双指手势开始，初始距离:', lastDistance.current, '初始Y:', lastY.current);
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.touches.length === 2 && isZooming.current) {
          // 方式1：捏合缩放
          const currentDistance = getDistance(evt.nativeEvent.touches);
          const distanceDiff = currentDistance - lastDistance.current;

          // 方式2：双指垂直滑动缩放
          const currentY = getAverageY(evt.nativeEvent.touches);
          const yDiff = lastY.current - currentY;

          let zoomChange = 0;

          // 捏合手势优先（降低阈值，提高灵敏度）
          if (Math.abs(distanceDiff) > 3) {
            zoomChange = distanceDiff / 400;
            lastDistance.current = currentDistance;
            console.log(
              '📏 捏合缩放:',
              distanceDiff.toFixed(1),
              '=> zoomChange:',
              zoomChange.toFixed(3)
            );
          }
          // 如果没有明显捏合，使用垂直滑动（降低阈值）
          else if (Math.abs(yDiff) > 3) {
            zoomChange = yDiff / 250;
            lastY.current = currentY;
            console.log('↕️ 垂直滑动:', yDiff.toFixed(1), '=> zoomChange:', zoomChange.toFixed(3));
          }

          if (Math.abs(zoomChange) > 0.005) {
            const newZoom = Math.max(0, Math.min(1, zoomRef.current + zoomChange));
            setZoom(newZoom);
            console.log(
              '🔍 缩放更新:',
              (zoomRef.current * 100).toFixed(0) + '%',
              '->',
              (newZoom * 100).toFixed(0) + '%'
            );

            // 触觉反馈（降低阈值）
            if (Math.abs(zoomChange) > 0.03) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }
      },
      onPanResponderRelease: () => {
        console.log('✋ 双指手势结束');
        isZooming.current = false;
      },
    })
  ).current;

  return { panResponder };
}
