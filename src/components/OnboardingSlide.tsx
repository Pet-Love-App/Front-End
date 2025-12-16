import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import { YStack, Text } from 'tamagui';

interface Props {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  maxImageWidth?: number;
  maxImageHeight?: number;
  index?: number;
}

export function OnboardingSlide({
  title,
  description,
  image,
  maxImageWidth = 300,
  maxImageHeight = 300,
}: Props) {
  return (
    <YStack
      flex={1}
      justifyContent="flex-start"
      alignItems="center"
      paddingHorizontal="$6"
      paddingTop="$4"
    >
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        {image ? (
          <Image
            source={image}
            style={{ width: maxImageWidth, height: maxImageHeight, resizeMode: 'contain' }}
            accessible
            accessibilityLabel={title}
          />
        ) : null}
      </View>

      <Text fontSize="$8" fontWeight="700" marginTop="$3" marginBottom="$2" textAlign="center">
        {title}
      </Text>

      {description ? (
        <Text fontSize="$4" color="$gray10" textAlign="center" style={{ flexShrink: 1 }}>
          {description}
        </Text>
      ) : null}
    </YStack>
  );
}

export default OnboardingSlide;
