import { styled, GetProps, YStack, Image, Text } from 'tamagui';

const AvatarContainer = styled(YStack, {
  name: 'Avatar',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: '$color3',

  variants: {
    size: {
      xs: { width: 24, height: 24, borderRadius: 12 },
      sm: { width: 32, height: 32, borderRadius: 16 },
      md: { width: 40, height: 40, borderRadius: 20 },
      lg: { width: 56, height: 56, borderRadius: 28 },
      xl: { width: 80, height: 80, borderRadius: 40 },
      xxl: { width: 120, height: 120, borderRadius: 60 },
    },
    shape: {
      circle: {},
      square: {},
    },
  } as const,

  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

const AvatarImage = styled(Image, {
  name: 'AvatarImage',
  width: '100%',
  height: '100%',
});

const AvatarFallback = styled(YStack, {
  name: 'AvatarFallback',
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$primary',
});

const FallbackText = styled(Text, {
  name: 'AvatarFallbackText',
  color: 'white',
  fontWeight: '600',

  variants: {
    size: {
      xs: { fontSize: '$1' },
      sm: { fontSize: '$2' },
      md: { fontSize: '$4' },
      lg: { fontSize: '$6' },
      xl: { fontSize: '$8' },
      xxl: { fontSize: '$10' },
    },
  } as const,
});

type AvatarProps = GetProps<typeof AvatarContainer> & {
  src?: string | null;
  fallback?: string;
  fallbackIcon?: React.ReactNode;
};

export function Avatar({
  src,
  fallback,
  fallbackIcon,
  size = 'md',
  shape = 'circle',
  ...props
}: AvatarProps) {
  const borderRadius = shape === 'square' ? '$3' : undefined;
  const initials = fallback?.slice(0, 2).toUpperCase();

  return (
    <AvatarContainer size={size} shape={shape} borderRadius={borderRadius} {...props}>
      {src ? (
        <AvatarImage source={{ uri: src }} resizeMode="cover" />
      ) : (
        <AvatarFallback>
          {fallbackIcon || (initials && <FallbackText size={size}>{initials}</FallbackText>)}
        </AvatarFallback>
      )}
    </AvatarContainer>
  );
}
