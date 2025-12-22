import { Text, styled, GetProps } from 'tamagui';

const StyledText = styled(Text, {
  color: '$color',

  variants: {
    type: {
      default: { fontSize: '$6', lineHeight: 24 },
      title: { fontSize: '$12', fontWeight: 'bold', lineHeight: 32 },
      subtitle: { fontSize: '$9', fontWeight: 'bold' },
      semibold: { fontSize: '$6', fontWeight: '600', lineHeight: 24 },
      caption: { fontSize: '$4', color: '$color8' },
      link: { fontSize: '$6', lineHeight: 30, color: '$blue' },
    },
    muted: {
      true: { color: '$color9' },
    },
    subtle: {
      true: { color: '$color7' },
    },
  } as const,
});

export type ThemedTextProps = GetProps<typeof StyledText>;

export function ThemedText(props: ThemedTextProps) {
  return <StyledText {...props} />;
}
