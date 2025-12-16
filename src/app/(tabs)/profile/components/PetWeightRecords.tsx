/**
 * 宠物体重记录列表组件
 */

import { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { YStack, XStack, Text, Card } from 'tamagui';
import { Plus, Edit3, Trash2, Activity } from '@tamagui/lucide-icons';
import { Button } from '@/src/design-system/components';
import { supabasePetHealthService } from '@/src/lib/supabase';
import type { PetWeightRecord } from '@/src/types/petHealth';
import { AddWeightRecordModal } from './AddWeightRecordModal';

interface Props {
  petId: number;
  petName: string;
  onRefresh?: () => void; // 通知父组件刷新
}

export function PetWeightRecords({ petId, petName, onRefresh }: Props) {
  const [records, setRecords] = useState<PetWeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PetWeightRecord | undefined>(undefined);

  useEffect(() => {
    loadRecords();
  }, [petId]);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await supabasePetHealthService.getPetWeightRecords(petId);
    setRecords(data || []);
    setLoading(false);
  };

  const handleSuccess = async () => {
    await loadRecords();
    setEditingRecord(undefined); // 清除编辑状态
    onRefresh?.(); // 通知父组件刷新图表
  };

  const handleEdit = (record: PetWeightRecord) => {
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRecord(undefined);
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除记录', '确定要删除这条体重记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await supabasePetHealthService.deleteWeightRecord(id);
          await loadRecords();
          onRefresh?.(); // 通知父组件刷新图表
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getMoodEmoji = (mood?: string | null) => {
    switch (mood) {
      case 'active':
        return '😊';
      case 'normal':
        return '😐';
      case 'lethargic':
        return '😔';
      default:
        return '';
    }
  };

  return (
    <YStack flex={1} gap="$3">
      {/* 标题栏 */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Activity size={20} />
          <Text fontSize="$6" fontWeight="600">
            历史记录
          </Text>
        </XStack>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onPress={() => setShowAddModal(true)}
        >
          添加记录
        </Button>
      </XStack>

      {/* 记录列表 */}
      <YStack gap="$2">
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {loading ? (
              <Text textAlign="center" color="$gray10">
                加载中...
              </Text>
            ) : records.length === 0 ? (
              <Card padding="$4" alignItems="center">
                <Text color="$gray10">暂无记录</Text>
              </Card>
            ) : (
              records.map((record) => (
                <Card key={record.id} padding="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1} gap="$1">
                      <XStack alignItems="center" gap="$2">
                        <Text fontSize="$6" fontWeight="600">
                          {record.weight} {record.unit}
                        </Text>
                        {record.mood && <Text fontSize="$5">{getMoodEmoji(record.mood)}</Text>}
                      </XStack>
                      <Text fontSize="$3" color="$gray11">
                        {formatDate(record.record_date)}
                      </Text>
                      {record.notes && (
                        <Text fontSize="$3" color="$gray10">
                          {record.notes}
                        </Text>
                      )}
                      {record.body_condition_score && (
                        <Text fontSize="$2" color="$blue10">
                          体况评分: {record.body_condition_score}/9
                        </Text>
                      )}
                    </YStack>

                    <XStack gap="$2">
                      <YStack
                        padding="$2"
                        borderRadius="$2"
                        pressStyle={{ opacity: 0.7, backgroundColor: '$gray3' }}
                        cursor="pointer"
                        onPress={() => handleEdit(record)}
                      >
                        <Edit3 size={18} color="$gray11" />
                      </YStack>
                      <YStack
                        padding="$2"
                        borderRadius="$2"
                        pressStyle={{ opacity: 0.7, backgroundColor: '$red3' }}
                        cursor="pointer"
                        onPress={() => handleDelete(record.id)}
                      >
                        <Trash2 size={18} color="$red10" />
                      </YStack>
                    </XStack>
                  </XStack>
                </Card>
              ))
            )}
          </YStack>
        </ScrollView>
      </YStack>

      {/* 添加/编辑记录模态框 */}
      <AddWeightRecordModal
        petId={petId}
        petName={petName}
        open={showAddModal}
        onOpenChange={handleCloseModal}
        onSuccess={handleSuccess}
        editRecord={editingRecord}
      />
    </YStack>
  );
}
