import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

interface ReportHeaderProps {
  name: string;
  tags: string[];
  imageUrl?: string | null;
}

export function ReportHeader({ name, tags, imageUrl }: ReportHeaderProps) {
  return (
    <Card elevate padding="$5" margin="$4" backgroundColor="$background" borderRadius="$4">
      <XStack space="$4">
        {/* 猫粮图片 */}
        {imageUrl && (
          <YStack>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                backgroundColor: '#f5f5f5',
              }}
              resizeMode="cover"
            />
          </YStack>
        )}

        {/* 文字信息 */}
        <YStack flex={1} space="$3" justifyContent="center">
          <Text fontSize="$8" fontWeight="bold" color="$color">
            {name}
          </Text>
          {tags && tags.length > 0 && (
            <XStack space="$2" flexWrap="wrap">
              {tags.map((tag, index) => (
                <YStack
                  key={index}
                  backgroundColor="$orange2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                >
                  <Text color="$orange10" fontSize="$2" fontWeight="600">
                    {tag}
                  </Text>
                </YStack>
              ))}
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
