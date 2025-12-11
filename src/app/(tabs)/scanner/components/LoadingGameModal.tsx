import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useLoadingGame } from '../hooks/useLoadingGame';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { PRIMARY_PALETTE, SEMANTIC_COLORS, NEUTRAL_PALETTE } from '@/src/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingGameModalProps {
  visible: boolean;
  onClose: () => void;
  isFinished: boolean; // AI分析是否完成
}

export const LoadingGameModal = ({ visible, onClose, isFinished }: LoadingGameModalProps) => {
  const { catY, obstacleX, score, isGameOver, jump, resetGame } = useLoadingGame(
    visible && !isFinished,
    () => {}
  );

  // 每次弹窗显示时重置游戏
  useEffect(() => {
    if (visible) {
      resetGame();
    }
  }, [visible]);

  // 当AI分析完成时，停止游戏但不重置，等待用户关闭

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} // 禁止物理返回键关闭，强制等待或玩游戏
    >
      <View style={styles.container}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.content}>
          {/* 标题区域 */}
          <View style={styles.header}>
            <Text style={styles.title}>{isFinished ? 'AI 分析完成！' : 'AI 正在分析中...'}</Text>
            <Text style={styles.subtitle}>
              {isFinished ? '您的猫粮分析报告已生成' : '等待的时候，来玩个小游戏吧！点击屏幕跳跃'}
            </Text>
          </View>

          {/* 游戏区域 */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.gameArea}
            onPress={jump}
            disabled={isFinished || isGameOver}
          >
            {/* 地面 */}
            <View style={styles.ground} />

            {/* 分数 */}
            {!isFinished && <Text style={styles.score}>{score}</Text>}

            {/* 猫咪 */}
            <Animated.Image
              source={require('@/assets/loading_cat.png')}
              style={[
                styles.cat,
                {
                  transform: [{ translateY: catY }],
                },
              ]}
              resizeMode="contain"
            />

            {/* 障碍物 (小球) */}
            <Animated.View
              style={[
                styles.obstacle,
                {
                  transform: [{ translateX: obstacleX }],
                },
              ]}
            />

            {/* 游戏结束遮罩 */}
            {isGameOver && !isFinished && (
              <View style={styles.gameOverOverlay}>
                <Text style={styles.gameOverText}>游戏失败</Text>
                <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                  <Text style={styles.retryButtonText}>重来</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 完成遮罩 */}
            {isFinished && (
              <View style={styles.finishedOverlay}>
                <IconSymbol name="checkmark.circle.fill" size={50} color="#4ADE80" />
              </View>
            )}
          </TouchableOpacity>

          {/* 底部按钮 */}
          {isFinished && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>查看报告</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  gameArea: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: NEUTRAL_PALETTE.mediumGray,
  },
  score: {
    position: 'absolute',
    top: 10,
    right: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: NEUTRAL_PALETTE.mediumGray,
  },
  cat: {
    position: 'absolute',
    left: 20,
    bottom: 0, // 贴地
    width: 60,
    height: 60,
    zIndex: 10,
  },
  obstacle: {
    position: 'absolute',
    bottom: 0,
    left: 0, // 初始位置由 translateX 控制
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SEMANTIC_COLORS.errorDark,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SEMANTIC_COLORS.errorDark,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: SEMANTIC_COLORS.errorDark,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  finishedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: PRIMARY_PALETTE.main,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
