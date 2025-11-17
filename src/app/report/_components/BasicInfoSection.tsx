import { Card, Separator, Text, XStack, YStack } from 'tamagui';

interface BasicInfoSectionProps {
  brand: string;
  score: number | null;
  countNum: number;
}

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ label, value, isLast = false }: InfoRowProps) {
  return (
    <>
      <XStack paddingVertical="$2" justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color="$gray11" width={100}>
          {label}
        </Text>
        <Text fontSize="$3" fontWeight="500" color="$color" flex={1}>
          {value}
        </Text>
      </XStack>
      {!isLast && <Separator />}
    </>
  );
}

export function BasicInfoSection({ brand, score, countNum }: BasicInfoSectionProps) {
  return (
    <Card
      elevate
      padding="$4"
      marginHorizontal="$4"
      marginBottom="$3"
      backgroundColor="$background"
      borderRadius="$4"
    >
      <YStack space="$2">
        <Text fontSize="$6" fontWeight="600" marginBottom="$2" color="$color">
          基本信息
        </Text>
        <InfoRow label="品牌：" value={brand || '暂无'} />
        <InfoRow label="评分：" value={score ? `${score}分` : '暂无'} />
        <InfoRow label="评分人数：" value={`${countNum || 0}人`} isLast />
      </YStack>
    </Card>
  );
}
