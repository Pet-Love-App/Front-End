/**
 * CreatePostFAB - 创建帖子浮动按钮
 *
 * 底部右侧的悬浮创建按钮
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from '@tamagui/lucide-icons';
import { styled, Stack } from 'tamagui';

export interface CreatePostFABProps {
  onPress: () => void;
}

const FABContainer = styled(Stack, {
  name: 'FABContainer',
  width: 56,
  height: 56,
  borderRadius: 28,
  overflow: 'hidden',
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CreatePostFABComponent({ onPress }: CreatePostFABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.pressable, animatedStyle]}
    >
      <FABContainer>
        <LinearGradient
          colors={['#9EC5AB', '#7FB093']}
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
    bottom: 24,
    right: 24,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CreatePostFAB = memo(CreatePostFABComponent);
