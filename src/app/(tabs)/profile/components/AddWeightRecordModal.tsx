/**
 * 添加体重记录模态框组件
 */

import { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Dialog, YStack, XStack, Text, Input, TextArea, Separator } from 'tamagui';
import { Scale, X } from '@tamagui/lucide-icons';
import { Button } from '@/src/design-system/components';
import { supabasePetHealthService } from '@/src/lib/supabase';
import type { BodyConditionScore, Mood, PetWeightRecord } from '@/src/types/petHealth';

interface Props {
  petId: number;
  petName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editRecord?: PetWeightRecord; // 如果提供，则为编辑模式
}

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'active', label: '活跃', emoji: '🏃' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'sleepy', label: '困倦', emoji: '😴' },
  { value: 'anxious', label: '焦虑', emoji: '😟' },
  { value: 'sick', label: '不适', emoji: '🤒' },
];

const BCS_OPTIONS: { value: BodyConditionScore; label: string }[] = [
  { value: 1, label: '1 - 极度消瘦' },
  { value: 2, label: '2 - 消瘦' },
  { value: 3, label: '3 - 偏瘦' },
  { value: 4, label: '4 - 理想' },
  { value: 5, label: '5 - 超重' },
];

export function AddWeightRecordModal({
  petId,
  petName,
  open,
  onOpenChange,
  onSuccess,
  editRecord,
}: Props) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [bcs, setBcs] = useState<BodyConditionScore | undefined>(undefined);
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setWeight('');
    setUnit('kg');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setBcs(undefined);
    setMood(undefined);
    setNotes('');
  };

  // 编辑模式：填充现有数据
  useEffect(() => {
    if (editRecord) {
      setWeight(editRecord.weight.toString());
      setUnit(editRecord.unit);
      setRecordDate(editRecord.record_date);
      setBcs(editRecord.body_condition_score as BodyConditionScore | undefined);

      // 转换 PetMood 到 Mood
      if (!editRecord.mood) {
        setMood(undefined); // 明确处理 null/undefined，保留空心情状态
      } else if (editRecord.mood === 'active') {
        setMood('active');
      } else if (editRecord.mood === 'lethargic') {
        setMood('sick');
      } else {
        setMood('calm'); // 其他未映射的心情值
      }

      setNotes(editRecord.notes || '');
    } else {
      // 重置表单
      resetForm();
    }
  }, [editRecord, open]);

  const handleSubmit = async () => {
    const weightNum = parseFloat(weight);
    if (!weight.trim() || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('提示', '请输入有效的体重');
      return;
    }

    if (!recordDate) {
      Alert.alert('提示', '请选择日期');
      return;
    }

    setLoading(true);
    try {
      // 转换 Mood 到 PetMood (简化版)
      let petMood: 'active' | 'normal' | 'lethargic' | undefined;
      if (mood) {
        if (mood === 'active' || mood === 'happy') petMood = 'active';
        else if (mood === 'sick' || mood === 'anxious') petMood = 'lethargic';
        else petMood = 'normal';
      }

      const recordData = {
        pet_id: petId,
        weight: weightNum,
        unit,
        record_date: recordDate,
        body_condition_score: bcs,
        mood: petMood,
        notes: notes.trim() || undefined,
      };

      let error;
      if (editRecord) {
        // 编辑模式：更新现有记录
        const result = await supabasePetHealthService.updateWeightRecord(editRecord.id, recordData);
        error = result.error;
      } else {
        // 创建新记录
        const result = await supabasePetHealthService.createWeightRecord(recordData);
        error = result.error;
      }

      if (error) {
        Alert.alert('错误', (error as any)?.message || `${editRecord ? '更新' : '添加'}记录失败`);
        return;
      }

      Alert.alert('成功', `体重记录已${editRecord ? '更新' : '添加'}`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      Alert.alert('错误', err.message || '添加记录失败');
    } finally {
      setLoading(false);
    }
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
              {editRecord ? '编辑体重记录' : '添加体重记录'}
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
            为 {petName} {editRecord ? '编辑' : '添加'}体重记录
          </Text>

          <Separator />

          {/* 表单内容 - 可滚动 */}
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <YStack gap="$4">
              {/* 体重 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  体重 *
                </Text>
                <XStack gap="$2" alignItems="center">
                  <Input
                    placeholder="输入体重"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    backgroundColor="$gray2"
                    borderColor="$gray5"
                    flex={1}
                  />
                  <XStack gap="$2">
                    <Button
                      size="sm"
                      variant={unit === 'kg' ? 'primary' : 'outline'}
                      onPress={() => setUnit('kg')}
                    >
                      kg
                    </Button>
                    <Button
                      size="sm"
                      variant={unit === 'lb' ? 'primary' : 'outline'}
                      onPress={() => setUnit('lb')}
                    >
                      lb
                    </Button>
                  </XStack>
                </XStack>
              </YStack>

              {/* 日期 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  日期 *
                </Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={recordDate}
                  onChangeText={setRecordDate}
                  backgroundColor="$gray2"
                  borderColor="$gray5"
                />
              </YStack>

              {/* 体况评分 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  体况评分（可选）
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {BCS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={bcs === option.value ? 'primary' : 'outline'}
                      onPress={() => setBcs(option.value)}
                      flex={1}
                      minWidth="45%"
                    >
                      {option.label}
                    </Button>
                  ))}
                </XStack>
              </YStack>

              {/* 心情 */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600">
                  心情（可选）
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {MOODS.map((moodOption) => (
                    <Button
                      key={moodOption.value}
                      size="sm"
                      variant={mood === moodOption.value ? 'primary' : 'outline'}
                      onPress={() => setMood(moodOption.value)}
                      minWidth="30%"
                    >
                      <Text>
                        {moodOption.emoji} {moodOption.label}
                      </Text>
                    </Button>
                  ))}
                </XStack>
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
              {editRecord ? '保存' : '添加'}
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
