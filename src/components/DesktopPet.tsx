import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Easing,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { usePetDrag } from '../hooks/usePetDrag';
import { usePetAnim } from '../hooks/usePetAnim';
import { usePetStore } from '../hooks/usePetStore';
import { ScreenHelper } from '../utils/screenHelper';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const PET_SIZE = 90;
const TAB_BAR_HEIGHT = 85;

export const DesktopPet = () => {
  const { currentFact, nextFact, isTalking, setTalking, isVisible, setVisible } = usePetStore();
  const { lottieRef } = usePetAnim();
  const [showMenu, setShowMenu] = useState(false);

  // 气泡动画
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;

  // 气泡出现动画
  useEffect(() => {
    if (isTalking) {
      Animated.parallel([
        Animated.spring(bubbleScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      bubbleScale.setValue(0);
      bubbleAnim.setValue(0);
    }
  }, [isTalking, currentFact, bubbleAnim, bubbleScale]);

  // 自动切换冷知识
  useEffect(() => {
    const timer = setInterval(() => {
      nextFact();
    }, 6000);
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

  // 拖拽功能 - 初始位置在左下角 tab 栏上方
  const { pan, panResponder } = usePetDrag(
    15, // 初始 X 位置（左侧）
    ScreenHelper.height - PET_SIZE - TAB_BAR_HEIGHT - 80, // 初始 Y 位置（tab 上方）
    PET_SIZE,
    PET_SIZE + 40 // 包含气泡的高度
  );

  if (!isVisible) return null;

  // 判断是否为提示语
  const isTipMessage = currentFact.includes('长按');

  return (
    <>
      {/* 可拖拽的容器 */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={styles.touchArea}
        >
          {/* 对话气泡 */}
          {isTalking && (
            <Animated.View
              style={[
                styles.bubbleContainer,
                {
                  opacity: bubbleAnim,
                  transform: [
                    { scale: bubbleScale },
                    {
                      translateY: bubbleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isTipMessage ? ['#FFE5B4', '#FFDAB9'] : ['#E8F5E9', '#C8E6C9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bubble}
              >
                <Text style={[styles.bubbleText, isTipMessage && styles.tipText]}>
                  {currentFact}
                </Text>
              </LinearGradient>
              {/* 气泡箭头 */}
              <View style={styles.arrowContainer}>
                <View
                  style={[
                    styles.bubbleArrow,
                    { borderTopColor: isTipMessage ? '#FFDAB9' : '#C8E6C9' },
                  ]}
                />
              </View>
            </Animated.View>
          )}

          {/* 宠物动画 */}
          <View style={styles.petContainer}>
            <LottieView
              ref={lottieRef}
              source={require('../../assets/animations/scary_cat.json')}
              style={styles.lottie}
              autoPlay={true}
              loop={true}
              speed={0.8}
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
              如果隐藏后想重新显示，请前往"个人-设置"进行重新开启。
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
    height: PET_SIZE + 80,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  touchArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  petContainer: {
    width: PET_SIZE,
    height: PET_SIZE,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  // 气泡样式
  bubbleContainer: {
    marginBottom: -10,
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 100,
    maxWidth: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 17,
    textAlign: 'left',
    fontWeight: '500',
  },
  tipText: {
    color: '#E65100',
    fontWeight: '600',
  },
  arrowContainer: {
    alignItems: 'center',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
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
    backgroundColor: '#FF6B6B',
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
