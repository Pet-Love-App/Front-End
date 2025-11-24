import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, XStack } from 'tamagui';

export const ForumColors = {
  sand: '#F2E8DA',
  peach: '#FEBE98',
  clay: '#E8A47E',
  borderTop: '#D8C8BD',
};

interface ForumHeaderProps {
  title: string;
  onClose?: () => void;
  right?: React.ReactNode;
}

export function ForumHeader({ title, onClose, right }: ForumHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: ForumColors.sand, zIndex: 100 }}>
      {/* 顶部 1px 线 */}
      <XStack height={1} backgroundColor={ForumColors.borderTop} />
      <XStack
        minHeight={56}
        padding="$3"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={ForumColors.sand}
        borderBottomWidth={1}
        borderColor={ForumColors.clay + '55'}
      >
        <Text fontSize="$7" fontWeight="700" color={ForumColors.clay}>{title}</Text>
        <XStack gap="$2" alignItems="center">
          {right}
          {onClose ? (
            <Button size="$3" chromeless onPress={onClose} backgroundColor={ForumColors.peach} color="#3c2e20" borderRadius="$3" paddingHorizontal="$3">关闭</Button>
          ) : null}
        </XStack>
      </XStack>
    </SafeAreaView>
  );
}
