import { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';

export const usePetAnim = (isTalking: boolean) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const playInteractAnim = () => {
    if (lottieRef.current) {
      lottieRef.current.play(0, 120); // 假设动画帧范围，可根据实际json调整
    }
  };

  return {
    lottieRef,
    playInteractAnim,
  };
};
