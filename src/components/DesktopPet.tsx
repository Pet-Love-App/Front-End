import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { usePetDrag } from '../hooks/usePetDrag';
import { usePetAnim } from '../hooks/usePetAnim';
import { usePetStore } from '../hooks/usePetStore';
import { ScreenHelper } from '../utils/screenHelper';
import { BlurView } from 'expo-blur';

const PET_SIZE = 100;
const BUBBLE_WIDTH = 160;

export const DesktopPet = () => {
  const { currentFact, nextFact, isTalking, setTalking, isVisible, setVisible } = usePetStore();
  const { lottieRef } = usePetAnim();
  const [showMenu, setShowMenu] = useState(false);

  // 自动切换冷知识
  useEffect(() => {
    const timer = setInterval(() => {
      nextFact();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextFact]);

  const handlePress = () => {
    nextFact();
    setTalking(true);
  };

  const handleLongPress = () => {
    setShowMenu(true);
  };

  const handleHidePet = () => {
    setVisible(false);
    setShowMenu(false);
  };

  const { pan, panResponder } = usePetDrag(
    ScreenHelper.width - PET_SIZE - 20, // 初始位置 X
    ScreenHelper.height - PET_SIZE - 150, // 初始位置 Y
    PET_SIZE,
    PET_SIZE
  );

  if (!isVisible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* 使用 Pressable 处理点击和长按，同时嵌套 View 响应 PanResponder */}
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={styles.touchArea}
        >
          {/* 对话气泡 */}
          {isTalking && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{currentFact}</Text>
              <View style={styles.bubbleArrow} />
            </View>
          )}

          {/* 宠物动画 */}
          <View style={styles.petContainer}>
            <LottieView
              ref={lottieRef}
              source={require('../../assets/animations/rolling_cat_animation.json')}
              style={styles.lottie}
              autoPlay={true}
              loop={true}
              speed={1.0}
              resizeMode="contain"
              renderMode="HARDWARE"
            />
          </View>
        </Pressable>
      </Animated.View>

      {/* 长按菜单 Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>桌面宠物设置</Text>
            <Text style={styles.modalMessage}>
              如果隐藏后想重新显示，请前往“个人-设置”进行重新开启。
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowMenu(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleHidePet}
              >
                <Text style={styles.confirmButtonText}>隐藏宠物</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: PET_SIZE,
    height: PET_SIZE,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchArea: {
    width: '100%',
    height: '100%',
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
    width: BUBBLE_WIDTH, // 保持基础宽度，但允许内容撑开（如果需要完全自适应可移除 width）
    maxWidth: 200, // 限制最大宽度防止溢出屏幕太多
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 5,
    alignSelf: 'center', // 确保气泡相对于宠物居中
  },
  bubbleText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    textAlign: 'left',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B', // 使用醒目的颜色
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
