import { styled, GetProps, Text, XStack } from 'tamagui';

const BadgeContainer = styled(XStack, {
  name: 'Badge',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  paddingHorizontal: '$2',
  paddingVertical: '$1',

  variants: {
    variant: {
      default: { backgroundColor: '$color3' },
      primary: { backgroundColor: '$primaryLight' },
      success: { backgroundColor: '$greenLight' },
      warning: { backgroundColor: '$yellowLight' },
      error: { backgroundColor: '$redLight' },
      info: { backgroundColor: '$blueLight' },
    },
    size: {
      sm: { paddingHorizontal: '$1.5', paddingVertical: 2 },
      md: { paddingHorizontal: '$2', paddingVertical: '$1' },
      lg: { paddingHorizontal: '$2.5', paddingVertical: '$1.5' },
    },
    outline: {
      true: {
        backgroundColor: 'transparent',
        borderWidth: 1,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const BadgeText = styled(Text, {
  name: 'BadgeText',
  fontWeight: '500',

  variants: {
    variant: {
      default: { color: '$color11' },
      primary: { color: '$primaryDark' },
      success: { color: '$success8' },
      warning: { color: '$warning8' },
      error: { color: '$error8' },
      info: { color: '$info8' },
    },
    size: {
      sm: { fontSize: '$1' },
      md: { fontSize: '$2' },
      lg: { fontSize: '$3' },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type BadgeProps = GetProps<typeof BadgeContainer> & {
  children: React.ReactNode;
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  outline,
  ...props
}: BadgeProps) {
  return (
    <BadgeContainer
      variant={variant}
      size={size}
      outline={outline}
      borderColor={outline ? `$${variant === 'default' ? 'color6' : variant}` : undefined}
      {...props}
    >
      <BadgeText variant={variant} size={size}>
        {children}
      </BadgeText>
    </BadgeContainer>
  );
}
