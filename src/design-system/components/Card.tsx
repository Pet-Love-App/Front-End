import { styled, GetProps, YStack } from 'tamagui';

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$background',
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  overflow: 'hidden',

  variants: {
    variant: {
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      filled: {
        backgroundColor: '$backgroundMuted',
        borderWidth: 0,
      },
    },
    size: {
      sm: { padding: '$3' },
      md: { padding: '$4' },
      lg: { padding: '$5' },
    },
    pressable: {
      true: {
        cursor: 'pointer',
        pressStyle: { scale: 0.98, opacity: 0.9 },
        hoverStyle: { backgroundColor: '$backgroundHover' },
        animation: 'quick',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'outlined',
    size: 'md',
  },
});

export const CardHeader = styled(YStack, {
  name: 'CardHeader',
  paddingBottom: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  marginBottom: '$3',
});

export const CardContent = styled(YStack, {
  name: 'CardContent',
  gap: '$2',
});

export const CardFooter = styled(YStack, {
  name: 'CardFooter',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  marginTop: '$3',
});

export type CardProps = GetProps<typeof Card>;
