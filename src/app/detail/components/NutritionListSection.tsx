/**
 * 营养成分列表 - 显示各营养成分详情
 */
import { Card, Separator, Text, XStack, YStack } from 'tamagui';

import type { Ingredient } from '@/src/lib/supabase/services/additive';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

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
        <Text fontSize="$3" color="$foreground">
          {name}
        </Text>
        {label && (
          <Text fontSize="$3" fontWeight="600" color={primaryScale.primary9}>
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
      borderColor={neutralScale.neutral3}
    >
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="600" marginBottom="$2" color="$foreground">
          营养成分详情
        </Text>
        <YStack marginTop="$2">
          {ingredients.map((item, index) => (
            <NutritionItem
              key={item.id || index}
              name={item.name}
              label={item.label ?? undefined}
              isLast={index === ingredients.length - 1}
            />
          ))}
        </YStack>
      </YStack>
    </Card>
  );
}
