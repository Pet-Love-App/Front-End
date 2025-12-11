import { useRef } from 'react';
import { PanResponder, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHelper } from '../utils/screenHelper';

export const usePetDrag = (
  initialX: number,
  initialY: number,
  petWidth: number,
  petHeight: number,
  onPress?: () => void
) => {
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 只有移动距离超过一定阈值才认为是拖拽，否则可能是点击
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
        isDragging.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        isDragging.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(
          _,
          gestureState
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // 边界检查与吸附
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        const clamped = ScreenHelper.clampPosition(currentX, currentY, petWidth, petHeight, insets);

        Animated.spring(pan, {
          toValue: clamped,
          useNativeDriver: false,
          friction: 5,
        }).start();

        // 如果没有发生拖拽，则视为点击
        if (!isDragging.current && Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          onPress?.();
        }
      },
    })
  ).current;

  return {
    pan,
    panResponder,
  };
};
