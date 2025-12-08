import { Text, XStack } from 'tamagui';

import { tagColors } from '@/src/design-system/tokens';

interface TagProps {
  name: string;
  index: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { px: '$1.5', py: 2, fontSize: '$1' as const },
  md: { px: '$2', py: '$1', fontSize: '$2' as const },
  lg: { px: '$2.5', py: '$1.5', fontSize: '$3' as const },
};

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#333333' : '#FFFFFF';
}

export default function Tag({ name, index, size = 'md' }: TagProps) {
  const backgroundColor = tagColors[index % tagColors.length];
  const textColor = getContrastColor(backgroundColor);
  const styles = sizeStyles[size];

  return (
    <XStack
      backgroundColor={backgroundColor}
      paddingHorizontal={styles.px}
      paddingVertical={styles.py}
      borderRadius="$full"
      marginRight="$1.5"
      marginBottom="$1.5"
    >
      <Text fontSize={styles.fontSize} fontWeight="500" color={textColor}>
        {name}
      </Text>
    </XStack>
  );
}
