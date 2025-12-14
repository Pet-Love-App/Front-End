/**
 * CustomAlert - 自定义 Alert 组件
 * 用于替代原生 Alert.alert()
 */

import React from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { AlertConfig } from './types';
import { create } from 'zustand';

interface AlertState {
  alerts: (AlertConfig & { id: string; visible: boolean })[];
  showAlert: (config: AlertConfig) => void;
  hideAlert: (id: string) => void;
}

// Zustand store for managing alerts
export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  showAlert: (config) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    set((state) => ({
      alerts: [...state.alerts, { ...config, id, visible: true }],
    }));
  },
  hideAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },
}));

// Alert Manager Component
export function AlertManager() {
  const { alerts, hideAlert } = useAlertStore();

  return (
    <>
      {alerts.map((alert) => {
        const buttons = alert.buttons || [{ text: '确定', style: 'default' }];
        const hasCancel = buttons.some((btn) => btn.style === 'cancel');
        const primaryButton = buttons.find((btn) => btn.style !== 'cancel');
        const cancelButton = buttons.find((btn) => btn.style === 'cancel');

        return (
          <ConfirmDialog
            key={alert.id}
            open={alert.visible}
            onOpenChange={(open) => {
              if (!open) hideAlert(alert.id);
            }}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            icon={alert.icon}
            confirmText={primaryButton?.text || '确定'}
            cancelText={cancelButton?.text || '取消'}
            destructive={primaryButton?.style === 'destructive'}
            onConfirm={async () => {
              await primaryButton?.onPress?.();
              hideAlert(alert.id);
            }}
            onCancel={
              hasCancel
                ? () => {
                    cancelButton?.onPress?.();
                    hideAlert(alert.id);
                  }
                : undefined
            }
            showCloseButton={hasCancel}
            closeOnOverlayClick={hasCancel}
          />
        );
      })}
    </>
  );
}

// Helper function to show alert (replaces Alert.alert)
export const showAlert = (config: AlertConfig) => {
  useAlertStore.getState().showAlert(config);
};

// Compatibility wrapper for Alert.alert syntax
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[],
    options?: { cancelable?: boolean }
  ) => {
    showAlert({
      title,
      message: message || '',
      buttons: buttons || [{ text: '确定', style: 'default' }],
    });
  },
};
