/**
 * 添加健康记录模态框组件
 */

import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Dialog, YStack, XStack, Text, Input, TextArea, Separator } from 'tamagui';
import { Calendar, Syringe, Bug, X } from '@tamagui/lucide-icons';
import { Button } from '@/src/design-system/components';
import { supabasePetHealthService } from '@/src/lib/supabase';
import type { HealthRecordType } from '@/src/types/petHealth';

interface Props {
  petId: number;
  petName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddHealthRecordModal({ petId, petName, open, onOpenChange, onSuccess }: Props) {
  const [recordType, setRecordType] = useState<HealthRecordType>('vaccine');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDate, setNextDate] = useState('');
  const [brand, setBrand] = useState('');
  const [dosage, setDosage] = useState('');
  const [clinic, setClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入记录名称');
      return;
    }

    if (!date) {
      Alert.alert('提示', '请选择日期');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabasePetHealthService.createHealthRecord({
        pet_id: petId,
        record_type: recordType,
        name: name.trim(),
        date,
        next_date: nextDate || undefined,
        brand: brand.trim() || undefined,
        dosage: dosage.trim() || undefined,
        clinic: clinic.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (error) {
        Alert.alert('错误', (error as any)?.message || '添加记录失败');
        return;
      }

      Alert.alert('成功', '健康记录已添加');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      Alert.alert('错误', err.message || '添加记录失败');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setNextDate('');
    setBrand('');
    setDosage('');
    setClinic('');
    setNotes('');
  };

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          key="content"
          animateOnly={['transform', 'opacity']}
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding="$4"
          backgroundColor="$background"
          width="90%"
          maxWidth={400}
          maxHeight="80%"
        >
          {/* 标题栏 */}
          <XStack justifyContent="space-between" alignItems="center">
            <Dialog.Title fontSize={20} fontWeight="700">
              添加健康记录
            </Dialog.Title>
            <YStack
              padding="$2"
              borderRadius="$2"
              pressStyle={{ opacity: 0.7, backgroundColor: '$gray3' }}
              cursor="pointer"
              onPress={() => onOpenChange(false)}
            >
              <X size={20} color="$gray11" />
            </YStack>
          </XStack>

          <Text fontSize={14} color="$gray11">
            为 {petName} 添加健康记录
          </Text>

          <Separator />

          {/* 表单内容 - 可滚动 */}
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <YStack gap="$4">
              {/* 记录类型选择 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  记录类型
                </Text>
                <XStack gap="$2">
                  <Button
                    size="sm"
                    variant={recordType === 'vaccine' ? 'primary' : 'outline'}
                    leftIcon={<Syringe size={16} />}
                    onPress={() => setRecordType('vaccine')}
                    flex={1}
                  >
                    疫苗接种
                  </Button>
                  <Button
                    size="sm"
                    variant={recordType === 'deworming' ? 'primary' : 'outline'}
                    leftIcon={<Bug size={16} />}
                    onPress={() => setRecordType('deworming')}
                    flex={1}
                  >
                    驱虫记录
                  </Button>
                </XStack>
              </YStack>

              {/* 记录名称 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  记录名称 *
                </Text>
                <Input
                  placeholder={recordType === 'vaccine' ? '如：狂犬疫苗' : '如：体内驱虫'}
                  value={name}
                  onChangeText={setName}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 日期 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  日期 *
                </Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 下次日期 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  下次日期（可选）
                </Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={nextDate}
                  onChangeText={setNextDate}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 品牌 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  品牌（可选）
                </Text>
                <Input
                  placeholder="疫苗或药品品牌"
                  value={brand}
                  onChangeText={setBrand}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 剂量 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  剂量（可选）
                </Text>
                <Input
                  placeholder="如：0.5ml"
                  value={dosage}
                  onChangeText={setDosage}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 诊所 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  诊所/医院（可选）
                </Text>
                <Input
                  placeholder="接种或购买地点"
                  value={clinic}
                  onChangeText={setClinic}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 备注 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  备注（可选）
                </Text>
                <TextArea
                  placeholder="添加备注信息"
                  value={notes}
                  onChangeText={setNotes}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                  minHeight={80}
                />
              </YStack>
            </YStack>
          </ScrollView>

          {/* 按钮 */}
          <XStack gap="$2" marginTop="$2">
            <Button
              size="md"
              variant="outline"
              onPress={() => onOpenChange(false)}
              flex={1}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              size="md"
              variant="primary"
              onPress={handleSubmit}
              flex={1}
              loading={loading}
              disabled={loading}
            >
              添加
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
