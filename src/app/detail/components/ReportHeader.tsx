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

  // 响应式图片尺寸 - 纵向布局使用更大的尺寸
  const imageSize = isExtraSmallScreen ? 180 : isSmallScreen ? 200 : 220;

  return (
    <Card
      padding="$0"
      marginHorizontal="$3"
      marginTop="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$6"
      overflow="hidden"
    >
      {/* 渐变背景 */}
      <YStack position="absolute" width="100%" height="100%">
        <LinearGradient
          colors={['rgba(255, 140, 50, 0.08)', 'rgba(255, 180, 100, 0.03)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      {/* 纵向布局：图片在上，名称在下 */}
      <YStack padding="$5" gap="$4" alignItems="center">
        {/* 猫粮图片 */}
        {imageUrl ? (
          <YStack
            borderRadius="$6"
            overflow="hidden"
            borderWidth={3}
            borderColor="$orange6"
            alignSelf="center"
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
            borderRadius="$6"
            backgroundColor="$orange2"
            alignItems="center"
            justifyContent="center"
            borderWidth={3}
            borderColor="$orange5"
            alignSelf="center"
          >
            <IconSymbol name="photo" size={imageSize * 0.35} color="$orange9" />
            <Text fontSize="$3" color="$orange9" marginTop="$2" fontWeight="500">
              暂无图片
            </Text>
          </YStack>
        )}

        {/* 文字信息 */}
        <YStack width="100%" gap="$3" alignItems="center">
          {/* 猫粮名称 */}
          <Text
            fontSize="$8"
            fontWeight="800"
            color="$orange11"
            textAlign="center"
            lineHeight="$9"
            letterSpacing={-0.5}
          >
            {name}
          </Text>

          {/* 标签 */}
          {tags && tags.length > 0 && (
            <XStack gap="$2" flexWrap="wrap" justifyContent="center">
              {tags.slice(0, 5).map((tag, index) => (
                <YStack
                  key={index}
                  backgroundColor="$orange4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1.5}
                  borderColor="$orange7"
                >
                  <Text color="$orange11" fontSize="$2" fontWeight="700">
                    # {tag}
                  </Text>
                </YStack>
              ))}
              {tags.length > 5 && (
                <YStack
                  backgroundColor="$gray4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1.5}
                  borderColor="$gray6"
                >
                  <Text color="$gray11" fontSize="$2" fontWeight="700">
                    +{tags.length - 5}
                  </Text>
                </YStack>
              )}
            </XStack>
          )}
        </YStack>
      </YStack>
    </Card>
  );
}
