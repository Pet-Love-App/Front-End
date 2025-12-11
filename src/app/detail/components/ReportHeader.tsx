/**
 * 详情页头部组件 - 显示猫粮图片、名称和标签
 * 采用现代购物App风格设计
 */
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';
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
  const imageSize = isExtraSmallScreen ? 200 : isSmallScreen ? 220 : 240;

  return (
    <YStack
      marginHorizontal="$3"
      marginTop="$2"
      marginBottom="$3"
      borderRadius={20}
      overflow="hidden"
      backgroundColor="white"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {/* 顶部渐变背景区域 */}
      <YStack position="relative" paddingTop="$6" paddingBottom="$4">
        {/* 背景渐变 */}
        <YStack position="absolute" width="100%" height="100%">
          <LinearGradient
            colors={[primaryScale.primary2, primaryScale.primary1, '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: '100%', height: '100%' }}
          />
        </YStack>

        {/* 装饰性背景圆环 */}
        <YStack
          position="absolute"
          top={-60}
          right={-60}
          width={180}
          height={180}
          borderRadius={90}
          backgroundColor={primaryScale.primary3}
          opacity={0.3}
        />
        <YStack
          position="absolute"
          bottom={-40}
          left={-40}
          width={120}
          height={120}
          borderRadius={60}
          backgroundColor={primaryScale.primary4}
          opacity={0.2}
        />

        {/* 猫粮图片 */}
        <YStack alignItems="center" zIndex={1}>
          {imageUrl ? (
            <YStack borderRadius={20} overflow="hidden" borderWidth={4} borderColor="white">
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
              borderRadius={20}
              backgroundColor={primaryScale.primary2}
              alignItems="center"
              justifyContent="center"
              borderWidth={4}
              borderColor="white"
            >
              <IconSymbol name="photo" size={imageSize * 0.3} color={primaryScale.primary6} />
              <Text fontSize="$3" color={primaryScale.primary7} marginTop="$2" fontWeight="500">
                暂无图片
              </Text>
            </YStack>
          )}
        </YStack>
      </YStack>

      {/* 底部信息区域 */}
      <YStack padding="$4" paddingTop="$2" gap="$3" alignItems="center">
        {/* 猫粮名称 */}
        <Text
          fontSize="$7"
          fontWeight="800"
          color={neutralScale.neutral12}
          textAlign="center"
          lineHeight={32}
          letterSpacing={-0.5}
        >
          {name}
        </Text>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <XStack gap="$2" flexWrap="wrap" justifyContent="center" paddingHorizontal="$2">
            {tags.slice(0, 5).map((tag, index) => (
              <YStack
                key={index}
                backgroundColor={
                  index === 0
                    ? primaryScale.primary3
                    : index === 1
                      ? '#FEF3C7'
                      : neutralScale.neutral2
                }
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius={20}
                borderWidth={1}
                borderColor={
                  index === 0
                    ? primaryScale.primary5
                    : index === 1
                      ? '#FCD34D'
                      : neutralScale.neutral4
                }
              >
                <Text
                  color={
                    index === 0
                      ? primaryScale.primary10
                      : index === 1
                        ? '#92400E'
                        : neutralScale.neutral10
                  }
                  fontSize="$2"
                  fontWeight="600"
                >
                  {tag}
                </Text>
              </YStack>
            ))}
            {tags.length > 5 && (
              <YStack
                backgroundColor={neutralScale.neutral2}
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius={20}
                borderWidth={1}
                borderColor={neutralScale.neutral4}
              >
                <Text color={neutralScale.neutral9} fontSize="$2" fontWeight="600">
                  +{tags.length - 5}
                </Text>
              </YStack>
            )}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
