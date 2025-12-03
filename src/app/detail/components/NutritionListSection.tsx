import { Ingredient } from '@/src/services/api/additive/types';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';

interface NutritionListSectionProps {
  ingredients: Ingredient[];
}

interface NutritionItemProps {
  name: string;
  label?: string;
  isLast?: boolean;
}

function NutritionItem({ name, label, isLast = false }: NutritionItemProps) {
  return (
    <>
      <XStack paddingVertical="$2" justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" color="$color">
          {name}
        </Text>
        {label && (
          <Text fontSize="$3" fontWeight="600" color="$orange10">
            {label}
          </Text>
        )}
      </XStack>
      {!isLast && <Separator />}
    </>
  );
}

export function NutritionListSection({ ingredients }: NutritionListSectionProps) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$5"
      bordered
      borderColor="$gray4"
    >
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="600" marginBottom="$2" color="$color">
          营养成分详情
        </Text>
        <YStack marginTop="$2">
          {ingredients.map((item, index) => (
            <NutritionItem
              key={item.id || index}
              name={item.name}
              label={item.label}
              isLast={index === ingredients.length - 1}
            />
          ))}
        </YStack>
      </YStack>
    </Card>
  );
}
