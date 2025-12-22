import { forwardRef } from 'react';
import { Input as TamaguiInput, styled, GetProps, XStack, YStack, Text } from 'tamagui';

const StyledInput = styled(TamaguiInput, {
  name: 'Input',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  paddingHorizontal: '$3',
  backgroundColor: '$background',
  color: '$foreground',
  placeholderTextColor: '$placeholderColor',
  fontSize: '$5',

  focusStyle: {
    borderColor: '$borderColorFocus',
    outlineWidth: 0,
  },

  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  variants: {
    size: {
      sm: { height: 46, fontSize: '$4' },
      md: { height: 54, fontSize: '$5' },
      lg: { height: 62, fontSize: '$6' },
    },
    error: {
      true: {
        borderColor: '$red',
        focusStyle: { borderColor: '$red' },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        backgroundColor: '$color2',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

type StyledInputProps = GetProps<typeof StyledInput>;

interface InputProps extends StyledInputProps {
  label?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<React.ElementRef<typeof StyledInput>, InputProps>(
  ({ label, errorMessage, leftIcon, rightIcon, error, testID, ...props }, ref) => {
    const hasError = !!errorMessage || error;

    // 同时设置 testID 和 accessibilityLabel 以支持 Detox E2E 测试
    const a11yProps = testID ? { testID, accessibilityLabel: testID, nativeID: testID } : {};

    if (!label && !errorMessage && !leftIcon && !rightIcon) {
      return <StyledInput ref={ref} error={hasError} {...a11yProps} {...props} />;
    }

    return (
      <YStack gap="$1.5">
        {label && (
          <Text fontSize="$4" fontWeight="500" color="$foregroundMuted">
            {label}
          </Text>
        )}
        <XStack alignItems="center" position="relative">
          {leftIcon && (
            <YStack position="absolute" left="$3" zIndex={1}>
              {leftIcon}
            </YStack>
          )}
          <StyledInput
            ref={ref}
            error={hasError}
            paddingLeft={leftIcon ? '$9' : '$3'}
            paddingRight={rightIcon ? '$9' : '$3'}
            flex={1}
            {...a11yProps}
            {...props}
          />
          {rightIcon && (
            <YStack position="absolute" right="$3" zIndex={1}>
              {rightIcon}
            </YStack>
          )}
        </XStack>
        {errorMessage && (
          <Text fontSize="$3" color="$red">
            {errorMessage}
          </Text>
        )}
      </YStack>
    );
  }
);

Input.displayName = 'Input';
