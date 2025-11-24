import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

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
            backgroundColor="white"
            borderRadius="$8"
            padding="$6"
            gap="$5"
            maxWidth={500}
            width="90%"
            borderWidth={1}
            borderColor="#E5E7EB"
          >
            {/* 标题栏 */}
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1.5">
                <Text fontSize={26} fontWeight="900" color="#111827" letterSpacing={0.5}>
                  选择扫描模式
                </Text>
                <Text fontSize={14} fontWeight="600" color="#6B7280">
                  选择适合的方式进行扫描
                </Text>
              </YStack>
              <Pressable onPress={onClose}>
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$10"
                  backgroundColor="#F3F4F6"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="xmark" size={20} color="#6B7280" />
                </YStack>
              </Pressable>
            </XStack>

            {/* 扫描模式选项 */}
            <YStack gap="$3">
              {SCAN_MODE_OPTIONS.map((option) => (
                <ScanModeOptionCard key={option.mode} option={option} onSelect={handleSelectMode} />
              ))}
            </YStack>

            {/* 提示信息 */}
            <YStack
              backgroundColor="#FFF5ED"
              padding="$4"
              borderRadius="$8"
              borderWidth={1.5}
              borderColor="#FFE4D1"
            >
              <XStack alignItems="center" gap="$2.5">
                <YStack
                  width={32}
                  height={32}
                  borderRadius="$8"
                  backgroundColor="#FEBE98"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="lightbulb.fill" size={16} color="white" />
                </YStack>
                <Text fontSize={14} color="#1E40AF" fontWeight="600" flex={1} lineHeight={20}>
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

  const iconColor = option.mode === 'known-brand' ? '#FEBE98' : '#10B981';
  const bgColor = option.mode === 'known-brand' ? '#FFF5ED' : '#D1FAE5';
  const borderColor = option.mode === 'known-brand' ? '#FFE4D1' : '#A7F3D0';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={isPressed}>
      <YStack
        backgroundColor="white"
        borderRadius="$10"
        borderWidth={2}
        borderColor={borderColor}
        padding="$4"
        pointerEvents="none"
      >
        <XStack gap="$3.5" alignItems="center">
          {/* 图标 */}
          <YStack
            width={68}
            height={68}
            backgroundColor={bgColor}
            borderRadius="$12"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={borderColor}
          >
            <IconSymbol name={option.icon} size={36} color={iconColor} />
          </YStack>

          {/* 内容 */}
          <YStack flex={1} gap="$2">
            <Text fontSize={18} fontWeight="800" color="#111827" letterSpacing={0.3}>
              {option.title}
            </Text>
            {option.description.map((desc, index) => (
              <Text key={index} fontSize={13} color="#6B7280" fontWeight="600" lineHeight={18}>
                • {desc}
              </Text>
            ))}
          </YStack>

          {/* 箭头 */}
          <YStack
            width={32}
            height={32}
            borderRadius="$8"
            backgroundColor="#F3F4F6"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
          </YStack>
        </XStack>
      </YStack>
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
