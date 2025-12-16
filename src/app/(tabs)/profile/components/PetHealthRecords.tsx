/**
 * 宠物健康档案组件
 * 显示疫苗接种和驱虫记录
 */

import { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { YStack, XStack, Text, Card, Separator } from 'tamagui';
import { Calendar, Syringe, Bug, Plus, Edit3, Trash2 } from '@tamagui/lucide-icons';
import { Button } from '@/src/design-system/components';
import { supabasePetHealthService } from '@/src/lib/supabase';
import type { PetHealthRecord, HealthRecordType } from '@/src/types/petHealth';
import { AddHealthRecordModal } from './AddHealthRecordModal';

interface Props {
  petId: number;
  petName: string;
}

export function PetHealthRecords({ petId, petName }: Props) {
  const [records, setRecords] = useState<PetHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<HealthRecordType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [petId, filter]);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await supabasePetHealthService.getPetHealthRecords(
      petId,
      filter === 'all' ? undefined : filter
    );
    setRecords(data || []);
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除记录', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await supabasePetHealthService.deleteHealthRecord(id);
          loadRecords();
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const vaccineRecords = records.filter((r) => r.record_type === 'vaccine');
  const dewormingRecords = records.filter((r) => r.record_type === 'deworming');

  return (
    <YStack flex={1} padding="$4" gap="$4">
      {/* 标题和筛选 */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$7" fontWeight="bold">
          {petName} 的健康档案
        </Text>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onPress={() => setShowAddModal(true)}
        >
          添加记录
        </Button>
      </XStack>

      {/* 筛选按钮 */}
      <XStack gap="$2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'primary' : 'outline'}
          onPress={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          size="sm"
          variant={filter === 'vaccine' ? 'primary' : 'outline'}
          leftIcon={<Syringe size={16} />}
          onPress={() => setFilter('vaccine')}
        >
          {`疫苗 (${vaccineRecords.length})`}
        </Button>
        <Button
          size="sm"
          variant={filter === 'deworming' ? 'primary' : 'outline'}
          leftIcon={<Bug size={16} />}
          onPress={() => setFilter('deworming')}
        >
          {`驱虫 (${dewormingRecords.length})`}
        </Button>
      </XStack>

      {/* 记录列表 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$3">
          {loading ? (
            <Text textAlign="center" color="$gray10">
              加载中...
            </Text>
          ) : records.length === 0 ? (
            <Card padding="$6" alignItems="center">
              <Text color="$gray10">暂无记录</Text>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id} padding="$4" elevate>
                <YStack gap="$2">
                  {/* 标题行 */}
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$2" alignItems="center">
                      {record.record_type === 'vaccine' ? (
                        <Syringe size={20} color="$blue10" />
                      ) : (
                        <Bug size={20} color="$green10" />
                      )}
                      <Text fontSize="$6" fontWeight="600">
                        {record.name}
                      </Text>
                    </XStack>
                    <XStack gap="$2">
                      <YStack
                        padding="$2"
                        borderRadius="$2"
                        pressStyle={{ opacity: 0.7, backgroundColor: '$gray3' }}
                        cursor="pointer"
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

                  {/* 日期信息 */}
                  <XStack gap="$4">
                    <XStack gap="$1" alignItems="center">
                      <Calendar size={16} color="$gray10" />
                      <Text fontSize="$3" color="$gray11">
                        {formatDate(record.date)}
                      </Text>
                    </XStack>
                    {record.next_date && (
                      <Text fontSize="$3" color="$orange10">
                        下次: {formatDate(record.next_date)}
                      </Text>
                    )}
                  </XStack>

                  {/* 详细信息 */}
                  {(record.brand || record.dosage || record.clinic) && (
                    <>
                      <Separator />
                      <YStack gap="$1">
                        {record.brand && (
                          <Text fontSize="$3" color="$gray11">
                            品牌: {record.brand}
                          </Text>
                        )}
                        {record.dosage && (
                          <Text fontSize="$3" color="$gray11">
                            剂量: {record.dosage}
                          </Text>
                        )}
                        {record.clinic && (
                          <Text fontSize="$3" color="$gray11">
                            诊所: {record.clinic}
                          </Text>
                        )}
                      </YStack>
                    </>
                  )}

                  {/* 备注 */}
                  {record.notes && (
                    <>
                      <Separator />
                      <Text fontSize="$3" color="$gray11">
                        {record.notes}
                      </Text>
                    </>
                  )}
                </YStack>
              </Card>
            ))
          )}
        </YStack>
      </ScrollView>

      {/* 添加记录模态框 */}
      <AddHealthRecordModal
        petId={petId}
        petName={petName}
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadRecords}
      />
    </YStack>
  );
}
