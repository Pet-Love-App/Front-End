import { styled, GetProps, YStack, XStack, Text } from 'tamagui';

const DividerLine = styled(YStack, {
  name: 'Divider',
  backgroundColor: '$borderColor',

  variants: {
    orientation: {
      horizontal: { height: 1, width: '100%' },
      vertical: { width: 1, height: '100%' },
    },
    thickness: {
      thin: {},
      medium: {},
      thick: {},
    },
  } as const,

  defaultVariants: {
    orientation: 'horizontal',
    thickness: 'thin',
  },
});

type DividerProps = GetProps<typeof DividerLine> & {
  label?: string;
};

export function Divider({ label, orientation = 'horizontal', ...props }: DividerProps) {
  if (!label) {
    return <DividerLine orientation={orientation} {...props} />;
  }

  return (
    <XStack alignItems="center" gap="$3">
      <DividerLine orientation="horizontal" flex={1} {...props} />
      <Text fontSize="$3" color="$foregroundSubtle">
        {label}
      </Text>
      <DividerLine orientation="horizontal" flex={1} {...props} />
    </XStack>
  );
}
