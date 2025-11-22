import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';

/**
 * 扫描模式类型
 */
export type ScanMode = 'known-brand' | 'direct-additive' | null;

/**
 * 扫描模式配置
 */
interface ScanModeOption {
  mode: Exclude<ScanMode, null>;
  icon: any; // IconSymbol 接受的图标名称
  iconColor: string;
  title: string;
  description: string[];
}

interface ScanModeModalProps {
  /** 是否显示模态框 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 选择模式回调 */
  onSelectMode: (mode: ScanMode) => void;
}

/**
 * 扫描模式选择器配置
 */
const SCAN_MODE_OPTIONS: ScanModeOption[] = [
  {
    mode: 'known-brand',
    icon: 'magnifyingglass.circle.fill',
    iconColor: '$blue10',
    title: '扫描已知品牌',
    description: ['搜索数据库中的猫粮品牌', '查看或补充成分信息'],
  },
  {
    mode: 'direct-additive',
    icon: 'camera.fill',
    iconColor: '$green10',
    title: '直接扫描添加剂',
    description: ['拍照识别配料表', '快速分析添加剂成分'],
  },
];

/**
 * 扫描模式选择模态框
 *
 * 功能：
 * - 让用户选择扫描已知品牌或直接扫描添加剂
 * - 使用简洁的弹窗设计
 * - 响应式设计，适配不同屏幕尺寸
 *
 * 设计原则：
 * - Modal 使用 React Native 原生组件，提供更好的平台体验
 * - 布局使用 Tamagui 组件，统一主题和样式
 * - Pressable 确保触摸事件正常工作
 *
 * @example
 * ```tsx
 * <ScanModeModal
 *   visible={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSelectMode={(mode) => handleModeSelection(mode)}
 * />
 * ```
 */
export function ScanModeModal({ visible, onClose, onSelectMode }: ScanModeModalProps) {
  const handleSelectMode = (mode: ScanMode) => {
    onSelectMode(mode);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* 半透明背景 - 点击背景关闭 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 内容区域 - 阻止点击事件传递到背景 */}
        <YStack
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
          alignItems="center"
          width="100%"
        >
          {/* 内容布局 - 使用 Tamagui 组件 */}
          <YStack
            backgroundColor="$background"
            borderRadius="$6"
            padding="$5"
            gap="$4"
            maxWidth={500}
            width="90%"
          >
            {/* 标题栏 */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$8" fontWeight="bold">
                选择扫描模式
              </Text>
              <Button
                circular
                size="$3"
                icon={<IconSymbol name="xmark.circle.fill" size={28} color="$gray10" />}
                chromeless
                onPress={onClose}
              />
            </XStack>

            {/* 扫描模式选项 */}
            <YStack gap="$3">
              {SCAN_MODE_OPTIONS.map((option) => (
                <ScanModeOptionCard key={option.mode} option={option} onSelect={handleSelectMode} />
              ))}
            </YStack>

            {/* 提示信息 */}
            <YStack backgroundColor="$blue2" padding="$3" borderRadius="$4">
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <IconSymbol name="lightbulb.fill" size={16} color="$blue11" />
                <Text fontSize="$3" color="$blue11" textAlign="center">
                  提示：已知品牌可以查看详细的成分数据库信息
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </Pressable>
    </Modal>
  );
}

/**
 * 扫描模式选项卡片组件
 */
interface ScanModeOptionCardProps {
  option: ScanModeOption;
  onSelect: (mode: ScanMode) => void;
}

function ScanModeOptionCard({ option, onSelect }: ScanModeOptionCardProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = React.useCallback(() => {
    // 防抖：如果正在处理中，忽略重复点击
    if (isPressed) {
      console.log('⚠️ 防抖：忽略重复点击');
      return;
    }

    console.log('Card pressed:', option.mode);
    setIsPressed(true);
    onSelect(option.mode);

    // 500ms 后重置状态
    setTimeout(() => {
      setIsPressed(false);
    }, 500);
  }, [option.mode, onSelect, isPressed]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={isPressed}>
      <Card size="$4" bordered animation="bouncy" pointerEvents="none">
        <Card.Header padded>
          <XStack gap="$3" alignItems="center">
            {/* 图标 */}
            <YStack
              width={60}
              height={60}
              backgroundColor={option.iconColor}
              borderRadius="$10"
              alignItems="center"
              justifyContent="center"
            >
              <IconSymbol name={option.icon} size={32} color="white" />
            </YStack>

            {/* 内容 */}
            <YStack flex={1} gap="$2">
              <Text fontSize="$6" fontWeight="600">
                {option.title}
              </Text>
              {option.description.map((desc, index) => (
                <Text key={index} fontSize="$3" color="$gray11">
                  {desc}
                </Text>
              ))}
            </YStack>

            {/* 箭头 */}
            <IconSymbol name="chevron.right" size={24} color="$gray10" />
          </XStack>
        </Card.Header>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
