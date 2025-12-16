/**
 * 宠物健康管理页面
 * 整合健康档案和体重记录
 */

import { useState } from 'react';
import { YStack, XStack, Text, Tabs } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { Heart, Activity } from '@tamagui/lucide-icons';
import { PetHealthRecords } from './components/PetHealthRecords';
import { PetWeightRecords } from './components/PetWeightRecords';

export default function PetHealthScreen() {
  const params = useLocalSearchParams<{ petId: string; petName: string }>();
  const petId = parseInt(params.petId || '0', 10);
  const petName = params.petName || '宠物';

  const [activeTab, setActiveTab] = useState('health');

  return (
    <YStack flex={1} backgroundColor="$background">
      <Tabs value={activeTab} onValueChange={setActiveTab} flexDirection="column" flex={1}>
        <Tabs.List backgroundColor="$background" paddingHorizontal="$4" paddingTop="$2">
          <Tabs.Tab flex={1} value="health">
            <XStack gap="$2" alignItems="center">
              <Heart size={18} />
              <Text>健康档案</Text>
            </XStack>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="weight">
            <XStack gap="$2" alignItems="center">
              <Activity size={18} />
              <Text>体重记录</Text>
            </XStack>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Content value="health" flex={1}>
          <PetHealthRecords petId={petId} petName={petName} />
        </Tabs.Content>

        <Tabs.Content value="weight" flex={1}>
          <PetWeightRecords petId={petId} petName={petName} />
        </Tabs.Content>
      </Tabs>
    </YStack>
  );
}
