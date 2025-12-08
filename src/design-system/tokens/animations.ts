import { Easing } from 'react-native';

// 动画时长 (ms)
export const duration = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
  pageTransition: 350,
  modalOpen: 300,
  modalClose: 250,
  tooltip: 150,
  skeleton: 1500,
} as const;

// 缓动函数
export const easing = {
  linear: Easing.linear,
  easeIn: Easing.ease,
  easeInQuad: Easing.in(Easing.quad),
  easeInCubic: Easing.in(Easing.cubic),
  easeInQuart: Easing.in(Easing.poly(4)),
  easeOut: Easing.out(Easing.ease),
  easeOutQuad: Easing.out(Easing.quad),
  easeOutCubic: Easing.out(Easing.cubic),
  easeOutQuart: Easing.out(Easing.poly(4)),
  easeInOut: Easing.inOut(Easing.ease),
  easeInOutQuad: Easing.inOut(Easing.quad),
  easeInOutCubic: Easing.inOut(Easing.cubic),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.5),
  backIn: Easing.in(Easing.back(1.5)),
  backOut: Easing.out(Easing.back(1.5)),
} as const;

// 弹簧配置 (Reanimated)
export const springConfig = {
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  default: {
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  stiff: {
    damping: 25,
    mass: 1,
    stiffness: 300,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  slow: {
    damping: 20,
    mass: 1.5,
    stiffness: 80,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
} as const;

// Tamagui 动画配置
export const tamaguiAnimations = {
  bouncy: { type: 'spring' as const, damping: 10, mass: 0.9, stiffness: 100 },
  lazy: { type: 'spring' as const, damping: 20, stiffness: 60 },
  quick: { type: 'spring' as const, damping: 20, mass: 1.2, stiffness: 250 },
  tooltip: { type: 'spring' as const, damping: 10, mass: 0.9, stiffness: 100 },
  medium: { type: 'spring' as const, damping: 15, mass: 1, stiffness: 150 },
  slow: { type: 'spring' as const, damping: 20, mass: 1.5, stiffness: 80 },
} as const;

// 常用动画预设
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.fast,
    easing: easing.easeIn,
  },
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.9, opacity: 0 },
    duration: duration.fast,
    easing: easing.easeIn,
  },
  slideInUp: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  slideInDown: {
    from: { translateY: -20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  slideInLeft: {
    from: { translateX: -20, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  slideInRight: {
    from: { translateX: 20, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  press: {
    from: { scale: 1 },
    to: { scale: 0.96 },
    duration: duration.faster,
    easing: easing.easeOut,
  },
  pulse: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    duration: duration.slow,
    easing: easing.easeInOut,
  },
} as const;

export type Duration = keyof typeof duration;
export type SpringConfig = keyof typeof springConfig;
export type AnimationPreset = keyof typeof animationPresets;
