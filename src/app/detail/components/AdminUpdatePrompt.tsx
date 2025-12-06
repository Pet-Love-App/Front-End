/**
 * AdminUpdatePrompt Component
 *
 * 管理员专用：允许重新扫描并更新已有营养成分信息
 */

import { router } from 'expo-router';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface AdminUpdatePromptProps {
  /** 猫粮ID */
  catfoodId: number;
  /** 猫粮名称 */
  catfoodName: string;
}

/**
 * 管理员更新提示组件
 * 显示管理员权限标识，允许重新扫描更新营养信息
 */
export function AdminUpdatePrompt({ catfoodId, catfoodName }: AdminUpdatePromptProps) {
  /**
   * 跳转到拍照扫描页面 - 重新录入配料表
   */
  const handleUpdateIngredients = () => {
    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: String(catfoodId),
        catfoodName,
        scanType: 'ingredients',
      },
    });
  };

  return (
    <Card
      size="$2"
      bordered
      backgroundColor="$orange2"
      borderColor="$orange6"
      marginHorizontal="$3"
      marginBottom="$3"
      paddingVertical="$3"
      paddingHorizontal="$3.5"
      borderRadius="$4"
      borderWidth={1.5}
    >
      <YStack gap="$2.5">
        {/* 管理员标识 */}
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="crown.fill" size={18} color="$orange10" />
          <Text fontSize="$3" color="$orange11" fontWeight="700">
            管理员权限
          </Text>
        </XStack>

        {/* 说明文字 */}
        <Text fontSize="$2" color="$orange11" lineHeight={18}>
          可以重新扫描并覆盖更新已有的营养成分数据
        </Text>

        {/* 操作按钮 */}
        <XStack
          paddingVertical="$2.5"
          paddingHorizontal="$3.5"
          backgroundColor="$orange9"
          borderRadius="$3"
          alignItems="center"
          justifyContent="center"
          gap="$2"
          pressStyle={{
            opacity: 0.8,
            scale: 0.98,
          }}
          onPress={handleUpdateIngredients}
        >
          <IconSymbol name="arrow.triangle.2.circlepath" size={18} color="white" />
          <Text fontSize="$3" color="white" fontWeight="700">
            重新扫描更新
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}
