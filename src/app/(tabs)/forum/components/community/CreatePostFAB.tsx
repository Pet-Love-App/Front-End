/**
 * CreatePostFAB - 创建帖子浮动按钮
 *
 * 底部右侧的悬浮创建按钮
 * 设计风格：渐变背景，阴影效果，弹性动画
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from '@tamagui/lucide-icons';
import { styled, Stack } from 'tamagui';
import { primaryScale } from '@/src/design-system/tokens/colors';

export interface CreatePostFABProps {
  onPress: () => void;
}

const FABContainer = styled(Stack, {
  name: 'FABContainer',
  width: 60,
  height: 60,
  borderRadius: 30,
  overflow: 'hidden',
  shadowColor: 'rgba(254, 190, 152, 0.4)',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 16,
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CreatePostFABComponent({ onPress }: CreatePostFABProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
    rotation.value = withSpring(-15, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    rotation.value = withSpring(0, { damping: 10, stiffness: 300 });
  };

  const handlePress = () => {
    // 按下时的弹跳效果
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    rotation.value = withSequence(
      withSpring(90, { damping: 15, stiffness: 400 }),
      withSpring(0, { damping: 10, stiffness: 300 })
    );
    onPress();
  };

  return (
    <AnimatedPressable
      testID="create-post-fab"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.pressable, animatedStyle]}
    >
      <FABContainer>
        <LinearGradient
          colors={[primaryScale.primary6, primaryScale.primary7, primaryScale.primary8]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </FABContainer>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    position: 'absolute',
    bottom: 32,
    right: 20,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CreatePostFAB = memo(CreatePostFABComponent);
