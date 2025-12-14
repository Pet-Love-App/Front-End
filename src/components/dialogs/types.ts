/**
 * 弹窗组件类型定义
 */

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'default';

export type DialogSize = 'small' | 'medium' | 'large' | 'fullscreen';

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  type?: DialogType;
  size?: DialogSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface ConfirmDialogProps extends BaseDialogProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  destructive?: boolean;
  icon?: string;
}

export interface FormDialogProps extends BaseDialogProps {
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export interface ContentDialogProps extends BaseDialogProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}

export interface ToastConfig {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface AlertConfig {
  title: string;
  message: string;
  type?: DialogType;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  icon?: string;
}
