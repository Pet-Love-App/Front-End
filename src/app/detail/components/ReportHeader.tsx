/**
 * 详情页头部组件 - 显示猫粮图片、名称和标签
 */
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

interface ReportHeaderProps {
  name: string;
  tags: string[];
  imageUrl?: string | null;
}

export function ReportHeader({ name, tags, imageUrl }: ReportHeaderProps) {
  const { isExtraSmallScreen, isSmallScreen } = useResponsiveLayout();
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
          colors={[primaryScale.primary2 + '20', primaryScale.primary3 + '10', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      <YStack padding="$5" gap="$4" alignItems="center">
        {/* 猫粮图片 */}
        {imageUrl ? (
          <YStack
            borderRadius="$6"
            overflow="hidden"
            borderWidth={3}
            borderColor={primaryScale.primary5}
            alignSelf="center"
          >
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: imageSize,
                height: imageSize,
                backgroundColor: neutralScale.neutral2,
              }}
              resizeMode="cover"
            />
          </YStack>
        ) : (
          <YStack
            width={imageSize}
            height={imageSize}
            borderRadius="$6"
            backgroundColor={primaryScale.primary2}
            alignItems="center"
            justifyContent="center"
            borderWidth={3}
            borderColor={primaryScale.primary4}
            alignSelf="center"
          >
            <IconSymbol name="photo" size={imageSize * 0.35} color={primaryScale.primary8} />
            <Text fontSize="$3" color={primaryScale.primary8} marginTop="$2" fontWeight="500">
              暂无图片
            </Text>
          </YStack>
        )}

        {/* 猫粮名称和标签 */}
        <YStack width="100%" gap="$3" alignItems="center">
          <Text
            fontSize="$8"
            fontWeight="800"
            color={primaryScale.primary10}
            textAlign="center"
            lineHeight="$9"
            letterSpacing={-0.5}
          >
            {name}
          </Text>

          {tags && tags.length > 0 && (
            <XStack gap="$2" flexWrap="wrap" justifyContent="center">
              {tags.slice(0, 5).map((tag, index) => (
                <YStack
                  key={index}
                  backgroundColor={primaryScale.primary3}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1.5}
                  borderColor={primaryScale.primary6}
                >
                  <Text color={primaryScale.primary10} fontSize="$2" fontWeight="700">
                    # {tag}
                  </Text>
                </YStack>
              ))}
              {tags.length > 5 && (
                <YStack
                  backgroundColor={neutralScale.neutral3}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  borderWidth={1.5}
                  borderColor={neutralScale.neutral5}
                >
                  <Text color={neutralScale.neutral10} fontSize="$2" fontWeight="700">
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
