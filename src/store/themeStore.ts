import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // 默认跟随系统
      themeMode: 'system',

      // 设置主题模式
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        console.log('✅ 主题模式已切换:', mode);
      },

      // 水化状态
      _hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: 'themeStorage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化主题模式
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      // 水化完成后的回调
      onRehydrateStorage: () => (state) => {
        console.log('💧 主题状态恢复完成:', {
          themeMode: state?.themeMode,
        });
        state?.setHasHydrated(true);
      },
    }
  )
);
