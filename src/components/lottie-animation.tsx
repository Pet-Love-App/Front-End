import { ThemedText } from '@/src/components/themed-text';
import LottieView from 'lottie-react-native';
import { StyleSheet, View, ViewStyle } from 'react-native';


interface LottieAnimationProps {
  source: any;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  message?: string;
  containerStyle?: ViewStyle;
  animationStyle?: ViewStyle;
}

/**
 * Lottie 动画组件
 * 
 * 可重用的动画组件，支持自定义大小、速度、文字等
 * <LottieAnimation 
 *   source={require('@/assets/animations/cat_loader.json')}
 *   width={150}
 *   height={150}
 *   message="加载中..."
 * />
 */
export function LottieAnimation({
  source,
  width = 200,
  height = 200,
  autoPlay = true,
  loop = true,
  speed = 1,
  message,
  containerStyle,
  animationStyle,
}: LottieAnimationProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={[
          {
            width,
            height,
          },
          animationStyle,
        ]}
      />
      
      {message && (
        <ThemedText style={styles.message}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});