import { StyleSheet, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

import { ThemedText } from '@/src/components/ThemedText';
import { spacing } from '@/src/design-system/tokens';

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
  testID?: string;
}

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
  testID = 'lottie-animation-container',
}: LottieAnimationProps) {
  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={[{ width, height }, animationStyle]}
      />
      {message && <ThemedText style={styles.message}>{message}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing[4],
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
