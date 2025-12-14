import { Feather } from '@expo/vector-icons';
import { Spinner, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';

import { infoScale } from '@/src/design-system/tokens';

interface AIReportButtonProps {
  hasReport: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export function AIReportButton({ hasReport, isLoading, onPress }: AIReportButtonProps) {
  if (isLoading) {
    return (
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        backgroundColor={infoScale.info2}
        borderRadius="$4"
        borderWidth={1}
        borderColor={infoScale.info4}
      >
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <Spinner size="small" color={infoScale.info9} />
          <Text fontSize="$4" color={infoScale.info9}>
            加载中...
          </Text>
        </XStack>
      </YStack>
    );
  }

  if (!hasReport) {
    return null;
  }

  return (
    <Button
      size="$4"
      height={48}
      fontSize={16}
      theme="blue"
      icon={<Feather name="file-text" size={18} />}
      onPress={onPress}
      backgroundColor={infoScale.info4}
      borderColor={infoScale.info6}
      borderWidth={1}
      pressStyle={{
        backgroundColor: infoScale.info5,
        scale: 0.98,
      }}
      hoverStyle={{
        backgroundColor: infoScale.info5,
      }}
    >
      <Text fontSize="$4" fontWeight="600" color={infoScale.info10}>
        查看 AI 分析报告
      </Text>
    </Button>
  );
}
