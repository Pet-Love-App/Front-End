/**
 * ToastManager - Toast 全局管理器
 * 提供全局的 Toast 显示功能
 */

import React, { useEffect, useState } from 'react';
import { YStack } from 'tamagui';
import { Toast } from './Toast';
import type { ToastConfig } from './types';
import { create } from 'zustand';

interface ToastWithId extends ToastConfig {
  id: string;
}

interface ToastStore {
  toasts: ToastWithId[];
  addToast: (config: ToastConfig) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Zustand store for managing toasts
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (config) => {
    const id = config.id || `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastWithId = { ...config, id };
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Toast Manager Component
export function ToastManager() {
  const { toasts, removeToast } = useToastStore();

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="box-none"
      zIndex={9999}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </YStack>
  );
}

// Helper functions for easy toast usage
export const toast = {
  success: (message: string, description?: string, config?: Partial<ToastConfig>) => {
    useToastStore.getState().addToast({
      type: 'success',
      message,
      description,
      ...config,
    });
  },

  error: (message: string, description?: string, config?: Partial<ToastConfig>) => {
    useToastStore.getState().addToast({
      type: 'error',
      message,
      description,
      ...config,
    });
  },

  warning: (message: string, description?: string, config?: Partial<ToastConfig>) => {
    useToastStore.getState().addToast({
      type: 'warning',
      message,
      description,
      ...config,
    });
  },

  info: (message: string, description?: string, config?: Partial<ToastConfig>) => {
    useToastStore.getState().addToast({
      type: 'info',
      message,
      description,
      ...config,
    });
  },

  custom: (config: ToastConfig) => {
    useToastStore.getState().addToast(config);
  },

  dismiss: (id: string) => {
    useToastStore.getState().removeToast(id);
  },

  dismissAll: () => {
    useToastStore.getState().clearAll();
  },
};
