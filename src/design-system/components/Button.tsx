import { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button as TamaguiButton, Spinner, Text, styled, GetProps } from 'tamagui';

const StyledButton = styled(TamaguiButton, {
  name: 'Button',
  borderRadius: '$4',
  pressStyle: { scale: 0.97, opacity: 0.9 },
  animation: 'quick',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        hoverStyle: { backgroundColor: '$primaryDark' },
      },
      secondary: {
        backgroundColor: '$color3',
        hoverStyle: { backgroundColor: '$color4' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        hoverStyle: { backgroundColor: '$color2' },
      },
      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: { backgroundColor: '$color2' },
      },
      danger: {
        backgroundColor: '$red',
        hoverStyle: { backgroundColor: '$red10' },
      },
    },
    size: {
      sm: { height: 42, paddingHorizontal: '$3' },
      md: { height: 52, paddingHorizontal: '$4' },
      lg: { height: 60, paddingHorizontal: '$5' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    rounded: {
      true: { borderRadius: 9999 },
    },
  } as const,
});

type StyledButtonProps = GetProps<typeof StyledButton>;

interface ButtonProps extends StyledButtonProps {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const getTextColor = (variant?: string) => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return 'white';
    default:
      return '$color11';
  }
};

// 映射 size 到 Tamagui 字体大小 token
const FONT_SIZE_MAP: Record<string, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export const Button = forwardRef<React.ElementRef<typeof StyledButton>, ButtonProps>(
  ({ children, loading, disabled, leftIcon, rightIcon, variant, size, testID, ...props }, ref) => {
    const textColor = getTextColor(variant as string);
    const fontSize = FONT_SIZE_MAP[size as string] || 16;

    // 同时设置 testID 和 accessibilityLabel 以支持 Detox E2E 测试
    const a11yProps = testID ? { testID, accessibilityLabel: testID, nativeID: testID } : {};

    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        opacity={disabled ? 0.5 : 1}
        variant={variant}
        size={size}
        {...a11yProps}
        {...props}
      >
        {loading ? (
          <Spinner size="small" color={textColor} />
        ) : (
          <View style={styles.row}>
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
            {typeof children === 'string' ? (
              <Text color={textColor} fontSize={fontSize} fontWeight="600">
                {children}
              </Text>
            ) : children ? (
              <View>{children}</View>
            ) : null}
            {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
          </View>
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
