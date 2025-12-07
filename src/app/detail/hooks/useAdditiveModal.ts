import { useState } from 'react';

import type { Additive } from '@/src/lib/supabase';

/**
 * 添加剂详情模态框管理 Hook
 * 负责添加剂详情模态框的状态管理
 */
export function useAdditiveModal() {
  const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 显示添加剂详情
  const handleAdditivePress = (additive: Additive) => {
    setSelectedAdditive(additive);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAdditive(null);
  };

  return {
    selectedAdditive,
    modalVisible,
    handleAdditivePress,
    handleCloseModal,
  };
}
