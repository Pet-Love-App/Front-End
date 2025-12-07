import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Text } from 'tamagui';

import type { Additive } from '@/src/lib/supabase';

interface AdditiveBubbleProps {
  additive: Additive;
  index: number;
  total: number;
  onPress: (additive: Additive) => void;
}

// 柔和的橙黄色调色板
const BUBBLE_COLORS = ['#FFB347', '#FFA500', '#FF8C42', '#FFD700', '#FDB45C', '#FF9966', '#FFAA33'];

export function AdditiveBubble({ additive, index, total, onPress }: AdditiveBubbleProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 选择颜色
  const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];

  // 计算气泡大小
  const size = 60 + Math.random() * 40;

  // 计算气泡位置（圆形排列）
  const angle = (index / total) * Math.PI * 2;
  const radius = 80 + Math.random() * 30;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  useEffect(() => {
    // 轻微的浮动动画
    scale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 2 }),
        withSpring(0.95, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );

    translateX.value = withRepeat(
      withSequence(
        withSpring(Math.random() * 10 - 5, { damping: 5 }),
        withSpring(0, { damping: 5 })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withSpring(Math.random() * 10 - 5, { damping: 5 }),
        withSpring(0, { damping: 5 })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + translateX.value },
      { translateY: y + translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.bubble, animatedStyle, { backgroundColor: color, width: size, height: size }]}
    >
      <TouchableOpacity
        style={styles.bubbleContent}
        onPress={() => onPress(additive)}
        activeOpacity={0.7}
      >
        <Text
          fontSize="$2"
          fontWeight="bold"
          color="white"
          textAlign="center"
          numberOfLines={2}
          style={styles.bubbleText}
        >
          {additive.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  bubbleText: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
