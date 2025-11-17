/**
 * 识别的添加剂/成分列表组件
 */
import { Button, Card, Spinner, Text, XStack, YStack } from 'tamagui';

interface IdentifiedItemsSectionProps {
  title: string;
  items: string[];
  type: 'additive' | 'ingredient';
  buttonColor: string;
  loadingItem: string | null;
  onItemClick: (item: string) => void;
}

export function IdentifiedItemsSection({
  title,
  items,
  type,
  buttonColor,
  loadingItem,
  onItemClick,
}: IdentifiedItemsSectionProps) {
  if (!items || items.length === 0) return null;

  const textColor = buttonColor.replace('3', '11');

  return (
    <Card
      elevate
      padding="$4"
      marginHorizontal="$4"
      marginBottom="$3"
      backgroundColor="$background"
      borderRadius="$4"
    >
      <YStack space="$3">
        <Text fontSize="$6" fontWeight="600" color="$color">
          {title} ({items.length})
        </Text>
        <Text fontSize="$2" color="$gray10">
          点击查看详情
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {items.map((item, index) => (
            <Button
              key={index}
              size="$2"
              backgroundColor={buttonColor}
              color={textColor}
              borderRadius="$3"
              onPress={() => onItemClick(item)}
              disabled={loadingItem === item}
              icon={loadingItem === item ? <Spinner size="small" color={textColor} /> : undefined}
            >
              {item}
            </Button>
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}
