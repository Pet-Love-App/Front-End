import React, { useEffect } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { usePetDrag } from '../hooks/usePetDrag';
import { usePetAnim } from '../hooks/usePetAnim';
import { usePetStore } from '../hooks/usePetStore';
import { ScreenHelper } from '../utils/screenHelper';

const PET_SIZE = 100;
const BUBBLE_WIDTH = 160;

export const DesktopPet = () => {
  const { currentFact, nextFact, isTalking, setTalking } = usePetStore();
  const { lottieRef, playInteractAnim } = usePetAnim(isTalking);

  // 自动切换冷知识
  useEffect(() => {
    const timer = setInterval(() => {
      nextFact();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextFact]);

  const handlePress = () => {
    playInteractAnim();
    nextFact();
    setTalking(true);
    // 3秒后自动隐藏气泡（可选，目前需求是常驻或切换，这里保持常驻显示）
  };

  const { pan, panResponder } = usePetDrag(
    ScreenHelper.width - PET_SIZE - 20, // 初始位置 X
    ScreenHelper.height - PET_SIZE - 150, // 初始位置 Y
    PET_SIZE,
    PET_SIZE,
    handlePress
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* 对话气泡 */}
      {isTalking && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText} numberOfLines={3}>
            {currentFact}
          </Text>
          <View style={styles.bubbleArrow} />
        </View>
      )}

      {/* 宠物动画 */}
      <View style={styles.petContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../../assets/animations/rolling_cat_animation.json')}
          style={styles.lottie}
          autoPlay
          loop
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: PET_SIZE,
    height: PET_SIZE,
    zIndex: 9999, // 确保在最上层
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    width: PET_SIZE,
    height: PET_SIZE,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    position: 'absolute',
    bottom: PET_SIZE - 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    width: BUBBLE_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 5,
  },
  bubbleText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
});
