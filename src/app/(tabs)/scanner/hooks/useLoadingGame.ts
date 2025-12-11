import { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 游戏配置常量
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 50;
const CAT_SIZE = 60;
const OBSTACLE_SIZE = 30;
const OBSTACLE_SPEED = 5;
const MIN_OBSTACLE_GAP = 200; // 最小障碍物间隔

export const useLoadingGame = (isPlaying: boolean, onGameOver: () => void) => {
  // 游戏状态
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // 动画值
  const catY = useRef(new Animated.Value(0)).current;
  const obstacleX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // 物理状态引用（用于实时计算）
  const catVelocity = useRef(0);
  const catYValue = useRef(0);
  const obstacleXValue = useRef(SCREEN_WIDTH);
  const gameLoopRef = useRef<number | null>(null);
  const isJumping = useRef(false);

  // 初始化监听器
  useEffect(() => {
    const catListener = catY.addListener(({ value }) => {
      catYValue.current = value;
    });
    const obstacleListener = obstacleX.addListener(({ value }) => {
      obstacleXValue.current = value;
    });

    return () => {
      catY.removeListener(catListener);
      obstacleX.removeListener(obstacleListener);
    };
  }, []);

  // 游戏循环
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const loop = () => {
      // 1. 更新猫咪位置（重力）
      if (catYValue.current > 0 || isJumping.current) {
        catVelocity.current += GRAVITY;
        const newY = catYValue.current + catVelocity.current;

        if (newY >= 0) {
          // 落地
          catY.setValue(0);
          catYValue.current = 0; // Manually update ref
          catVelocity.current = 0;
          isJumping.current = false;
        } else {
          // 空中
          catY.setValue(newY);
          catYValue.current = newY; // Manually update ref
        }
      }

      // 2. 更新障碍物位置
      let newObstacleX = obstacleXValue.current - OBSTACLE_SPEED;
      if (newObstacleX < -OBSTACLE_SIZE) {
        // 重置障碍物
        newObstacleX = SCREEN_WIDTH + Math.random() * 200;
        setScore((s) => s + 1);
      }
      obstacleX.setValue(newObstacleX);
      obstacleXValue.current = newObstacleX; // Manually update ref

      // 3. 碰撞检测
      // 猫咪中心点 (50, SCREEN_HEIGHT - GROUND_HEIGHT - catY - CAT_SIZE/2)
      // 障碍物中心点 (obstacleX + OBSTACLE_SIZE/2, SCREEN_HEIGHT - GROUND_HEIGHT - OBSTACLE_SIZE/2)
      // 简化为矩形碰撞

      // 猫咪区域：X: 20~20+CAT_SIZE, Y: catYValue.current (注意Y轴向上为负)
      // 障碍物区域：X: obstacleXValue.current, Y: 0 (贴地)

      // 这里的坐标系：catY是相对于地面的偏移（负数向上），obstacleX是屏幕横坐标
      const catLeft = 20; // 猫咪固定在左侧
      const catRight = 20 + CAT_SIZE - 20; // 减去一点碰撞宽容度
      const catBottom = catYValue.current; // 0是地面

      const obsLeft = obstacleXValue.current + 5;
      const obsRight = obstacleXValue.current + OBSTACLE_SIZE - 5;
      const obsTop = -OBSTACLE_SIZE + 10; // 障碍物高度

      // 碰撞条件：水平重叠 且 垂直重叠
      if (
        catRight > obsLeft &&
        catLeft < obsRight &&
        catBottom > obsTop // 猫咪底部 低于 障碍物顶部 (注意都是负数或0)
      ) {
        handleGameOver();
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isGameOver]);

  const jump = () => {
    if (!isJumping.current && !isGameOver) {
      isJumping.current = true;
      catVelocity.current = JUMP_FORCE;
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    onGameOver();
  };

  const resetGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);

    // 重置动画值
    catY.setValue(0);
    obstacleX.setValue(SCREEN_WIDTH);

    // 关键：同时重置物理状态引用
    catVelocity.current = 0;
    catYValue.current = 0;
    obstacleXValue.current = SCREEN_WIDTH;
    isJumping.current = false;
  }, []);

  return {
    catY,
    obstacleX,
    score,
    isGameOver,
    jump,
    resetGame,
  };
};
