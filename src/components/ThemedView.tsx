import { YStack, styled, GetProps } from 'tamagui';

const StyledView = styled(YStack, {
  backgroundColor: '$background',

  variants: {
    variant: {
      default: { backgroundColor: '$background' },
      subtle: { backgroundColor: '$backgroundSubtle' },
      muted: { backgroundColor: '$backgroundMuted' },
      elevated: { backgroundColor: '$backgroundElevated' },
    },
    padded: {
      true: { padding: '$4' },
      sm: { padding: '$2' },
      lg: { padding: '$6' },
    },
    centered: {
      true: { alignItems: 'center', justifyContent: 'center' },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
  },
});

export type ThemedViewProps = GetProps<typeof StyledView>;

export function ThemedView(props: ThemedViewProps) {
  return <StyledView {...props} />;
}
