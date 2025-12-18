/**
 * DismissKeyboardView - 全局键盘收起组件
 *
 * 点击任意非输入区域自动收起键盘
 * 使用 onTouchStart 在触摸开始时收起键盘，不阻止事件传递给子组件
 * 只在键盘显示时才触发收起，避免不必要的操作
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { Keyboard, View, StyleSheet, Platform, EmitterSubscription } from 'react-native';

interface DismissKeyboardViewProps {
  children: React.ReactNode;
}

export function DismissKeyboardView({ children }: DismissKeyboardViewProps) {
  const isKeyboardVisible = useRef(false);

  // 监听键盘状态
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription: EmitterSubscription = Keyboard.addListener(showEvent, () => {
      isKeyboardVisible.current = true;
    });

    const hideSubscription: EmitterSubscription = Keyboard.addListener(hideEvent, () => {
      isKeyboardVisible.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 触摸开始时收起键盘（仅在键盘显示时）
  const handleTouchStart = useCallback(() => {
    if (isKeyboardVisible.current) {
      Keyboard.dismiss();
    }
  }, []);

  return (
    <View style={styles.container} onTouchStart={handleTouchStart}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
