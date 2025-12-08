import { forwardRef } from 'react';
import { Button as TamaguiButton, Spinner, styled, GetProps } from 'tamagui';

const StyledButton = styled(TamaguiButton, {
  name: 'Button',
  fontWeight: '600',
  borderRadius: '$4',
  pressStyle: { scale: 0.97, opacity: 0.9 },
  animation: 'quick',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: 'white',
        hoverStyle: { backgroundColor: '$primaryDark' },
      },
      secondary: {
        backgroundColor: '$color3',
        color: '$color11',
        hoverStyle: { backgroundColor: '$color4' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        color: '$color11',
        hoverStyle: { backgroundColor: '$color2' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$color11',
        hoverStyle: { backgroundColor: '$color2' },
      },
      danger: {
        backgroundColor: '$red',
        color: 'white',
        hoverStyle: { backgroundColor: '$error8' },
      },
    },
    size: {
      sm: { height: 32, paddingHorizontal: '$2', fontSize: '$3' },
      md: { height: 40, paddingHorizontal: '$3', fontSize: '$4' },
      lg: { height: 48, paddingHorizontal: '$4', fontSize: '$5' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    rounded: {
      true: { borderRadius: '$full' },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type StyledButtonProps = GetProps<typeof StyledButton>;

interface ButtonProps extends StyledButtonProps {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<React.ElementRef<typeof StyledButton>, ButtonProps>(
  ({ children, loading, disabled, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        opacity={disabled ? 0.5 : 1}
        {...props}
      >
        {loading ? (
          <Spinner size="small" color="$color" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
