import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

interface ReportHeaderProps {
  name: string;
  tags: string[];
  imageUrl?: string | null;
}

export function ReportHeader({ name, tags, imageUrl }: ReportHeaderProps) {
  const { isExtraSmallScreen, isSmallScreen } = useResponsiveLayout();

  // 响应式图片尺寸
  const imageSize = isExtraSmallScreen ? 100 : isSmallScreen ? 110 : 130;

  return (
    <Card
      padding="$0"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$5"
      overflow="hidden"
      bordered
      borderColor="$gray4"
    >
      {/* 渐变背景 */}
      <YStack position="absolute" width="100%" height="100%">
        <LinearGradient
          colors={['rgba(255, 123, 0, 0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      <XStack padding="$5" gap="$4" alignItems="center">
        {/* 猫粮图片 */}
        {imageUrl ? (
          <YStack
            borderRadius="$4"
            overflow="hidden"
            borderWidth={2}
            borderColor="$orange4"
            flexShrink={0}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: imageSize,
                height: imageSize,
                backgroundColor: '#f5f5f5',
              }}
              resizeMode="cover"
            />
          </YStack>
        ) : (
          <YStack
            width={imageSize}
            height={imageSize}
            borderRadius="$4"
            backgroundColor="$gray3"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$gray5"
            flexShrink={0}
          >
            <IconSymbol name="photo" size={imageSize * 0.37} color="$gray9" />
            <Text fontSize="$2" color="$gray9" marginTop="$2">
              暂无图片
            </Text>
          </YStack>
        )}

        {/* 文字信息 */}
        <YStack flex={1} gap="$3" justifyContent="center">
          {/* 猫粮名称 */}
          <Text fontSize="$8" fontWeight="bold" color="$orange11" lineHeight="$8">
            {name}
          </Text>

          {/* 标签 */}
          {tags && tags.length > 0 && (
            <XStack gap="$2" flexWrap="wrap">
              {tags.slice(0, 4).map((tag, index) => (
                <YStack
                  key={index}
                  backgroundColor="$orange3"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1}
                  borderColor="$orange5"
                >
                  <Text color="$orange11" fontSize="$2" fontWeight="600">
                    # {tag}
                  </Text>
                </YStack>
              ))}
              {tags.length > 4 && (
                <YStack
                  backgroundColor="$gray3"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1}
                  borderColor="$gray5"
                >
                  <Text color="$gray10" fontSize="$2" fontWeight="600">
                    +{tags.length - 4}
                  </Text>
                </YStack>
              )}
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
