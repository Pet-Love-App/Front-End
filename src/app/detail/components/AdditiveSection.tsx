import { StyleSheet, View } from 'react-native';
import { Card, Text, YStack } from 'tamagui';
import { AdditiveBubble } from './AdditiveBubble';

interface Additive {
  name: string;
  type?: string;
  en_name?: string;
  applicable_range?: string;
}

interface AdditiveSectionProps {
  additives: Additive[];
  onAdditivePress: (additive: Additive) => void;
}

export function AdditiveSection({ additives, onAdditivePress }: AdditiveSectionProps) {
  if (!additives || additives.length === 0) return null;

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
      <YStack space="$3">
        <Text fontSize="$6" fontWeight="600" color="$color">
          添加剂成分
        </Text>
        <Text fontSize="$2" color="$gray10">
          点击气泡查看详情
        </Text>
        <View style={styles.bubblesContainer}>
          {additives.map((additive, index) => (
            <AdditiveBubble
              key={index}
              additive={additive}
              index={index}
              total={additives.length}
              onPress={onAdditivePress}
            />
          ))}
        </View>
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  bubblesContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
