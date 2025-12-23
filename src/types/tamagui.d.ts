import '@tamagui/core';

declare module '@tamagui/core' {
  interface TextProps {
    color?: any;
  }

  interface StackProps {
    backgroundColor?: any;
    borderColor?: any;
    borderLeftColor?: any;
    borderRightColor?: any;
    borderTopColor?: any;
    borderBottomColor?: any;
    borderRadius?: any;
    width?: any;
    height?: any;
    paddingHorizontal?: any;
    paddingVertical?: any;
  }
}

declare module 'tamagui' {
  interface TextProps {
    color?: any;
  }

  interface StackProps {
    backgroundColor?: any;
    borderColor?: any;
    borderLeftColor?: any;
    borderRightColor?: any;
    borderTopColor?: any;
    borderBottomColor?: any;
    borderRadius?: any;
    width?: any;
    height?: any;
    paddingHorizontal?: any;
    paddingVertical?: any;
  }

  interface YStackProps extends StackProps {}
  interface XStackProps extends StackProps {}
  interface ZStackProps extends StackProps {}
  interface SeparatorProps {
    borderColor?: any;
  }
  interface ButtonProps {
    borderColor?: any;
    backgroundColor?: any;
  }
}

export {};
