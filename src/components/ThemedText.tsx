import { Text, styled, GetProps } from 'tamagui';

const StyledText = styled(Text, {
  color: '$foreground',

  variants: {
    type: {
      default: { fontSize: '$6', lineHeight: 24 },
      title: { fontSize: '$12', fontWeight: 'bold', lineHeight: 32 },
      subtitle: { fontSize: '$9', fontWeight: 'bold' },
      semibold: { fontSize: '$6', fontWeight: '600', lineHeight: 24 },
      caption: { fontSize: '$4', color: '$foregroundMuted' },
      link: { fontSize: '$6', lineHeight: 30, color: '$info7' },
    },
    muted: {
      true: { color: '$foregroundMuted' },
    },
    subtle: {
      true: { color: '$foregroundSubtle' },
    },
  } as const,

  defaultVariants: {
    type: 'default',
  },
});

export type ThemedTextProps = GetProps<typeof StyledText>;

export function ThemedText(props: ThemedTextProps) {
  return <StyledText {...props} />;
}
