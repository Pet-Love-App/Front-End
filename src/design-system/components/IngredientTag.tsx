/**
 * IngredientTag - 成分标签组件
 *
 * 用于显示猫粮成分，根据成分类型显示不同颜色
 * 设计风格: 圆角胶囊形状，柔和色彩
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { styled, Text, Stack, GetProps, XStack } from 'tamagui';

// ============================================================================
// 类型定义
// ============================================================================
export type IngredientType = 'safe' | 'caution' | 'risk' | 'neutral' | 'premium';

export interface IngredientTagProps {
  /** 成分名称 */
  name: string;
  /** 成分类型 */
  type?: IngredientType;
  /** 成分描述 (tooltip) */
  description?: string;
  /** 是否可点击 */
  pressable?: boolean;
  /** 点击回调 */
  onPress?: () => void;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示图标 */
  showIcon?: boolean;
}

// ============================================================================
// 图标映射
// ============================================================================
const typeIcons: Record<IngredientType, string> = {
  safe: '✓',
  caution: '!',
  risk: '✕',
  neutral: '•',
  premium: '★',
};

// ============================================================================
// 样式组件
// ============================================================================
const TagContainer = styled(Stack, {
  name: 'TagContainer',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 9999,
  gap: '$1',

  variants: {
    type: {
      safe: {
        backgroundColor: '$safeLight',
        borderColor: '$safe',
        borderWidth: 1,
      },
      caution: {
        backgroundColor: '$cautionLight',
        borderColor: '$caution',
        borderWidth: 1,
      },
      risk: {
        backgroundColor: '$riskLight',
        borderColor: '$risk',
        borderWidth: 1,
      },
      neutral: {
        backgroundColor: '$color2',
        borderColor: '$borderColor',
        borderWidth: 1,
      },
      premium: {
        backgroundColor: '$primaryLight',
        borderColor: '$primary',
        borderWidth: 1,
      },
    },
    size: {
      sm: {
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      },
      md: {
        paddingHorizontal: '$2.5',
        paddingVertical: '$1.5',
      },
      lg: {
        paddingHorizontal: '$3',
        paddingVertical: '$2',
      },
    },
    pressable: {
      true: {
        cursor: 'pointer',
      },
    },
  } as const,

  defaultVariants: {
    type: 'neutral',
    size: 'md',
  },
});

const TagIcon = styled(Text, {
  name: 'TagIcon',
  fontWeight: '700',

  variants: {
    type: {
      safe: { color: '$safeText' },
      caution: { color: '$cautionText' },
      risk: { color: '$riskText' },
      neutral: { color: '$colorMuted' },
      premium: { color: '$primaryDark' },
    },
    size: {
      sm: { fontSize: 10 },
      md: { fontSize: 12 },
      lg: { fontSize: 14 },
    },
  } as const,
});

const TagText = styled(Text, {
  name: 'TagText',
  fontWeight: '500',

  variants: {
    type: {
      safe: { color: '$safeText' },
      caution: { color: '$cautionText' },
      risk: { color: '$riskText' },
      neutral: { color: '$color' },
      premium: { color: '$primaryDark' },
    },
    size: {
      sm: { fontSize: '$1' },
      md: { fontSize: '$2' },
      lg: { fontSize: '$3' },
    },
  } as const,
});

// ============================================================================
// 动画包装组件
// ============================================================================
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedTagWrapper({
  children,
  onPress,
  pressable,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  pressable?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (!pressable) {
    return <>{children}</>;
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={animatedStyle}
    >
      {children}
    </AnimatedPressable>
  );
}

// ============================================================================
// 主组件
// ============================================================================
export function IngredientTag({
  name,
  type = 'neutral',
  // description - reserved for future tooltip functionality
  pressable = false,
  onPress,
  size = 'md',
  showIcon = true,
}: IngredientTagProps) {
  const icon = typeIcons[type];

  return (
    <AnimatedTagWrapper pressable={pressable} onPress={onPress}>
      <TagContainer type={type} size={size} pressable={pressable}>
        {showIcon && (
          <TagIcon type={type} size={size}>
            {icon}
          </TagIcon>
        )}
        <TagText type={type} size={size}>
          {name}
        </TagText>
      </TagContainer>
    </AnimatedTagWrapper>
  );
}

// ============================================================================
// 成分标签列表组件
// ============================================================================
export interface IngredientTagListProps {
  /** 成分列表 */
  ingredients: {
    name: string;
    type?: IngredientType;
    description?: string;
  }[];
  /** 标签尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 点击回调 */
  onTagPress?: (ingredient: { name: string; type?: IngredientType }) => void;
  /** 最大显示数量 */
  maxDisplay?: number;
  /** 是否显示图标 */
  showIcons?: boolean;
}

const TagListContainer = styled(XStack, {
  name: 'TagListContainer',
  flexWrap: 'wrap',
  gap: '$2',
});

const MoreTag = styled(Stack, {
  name: 'MoreTag',
  paddingHorizontal: '$2.5',
  paddingVertical: '$1.5',
  borderRadius: 9999,
  backgroundColor: '$color3',
});

const MoreText = styled(Text, {
  name: 'MoreText',
  fontSize: '$2',
  color: '$colorMuted',
  fontWeight: '500',
});

export function IngredientTagList({
  ingredients,
  size = 'md',
  onTagPress,
  maxDisplay,
  showIcons = true,
}: IngredientTagListProps) {
  const displayIngredients = maxDisplay ? ingredients.slice(0, maxDisplay) : ingredients;
  const remainingCount = maxDisplay ? Math.max(0, ingredients.length - maxDisplay) : 0;

  return (
    <TagListContainer>
      {displayIngredients.map((ingredient, index) => (
        <IngredientTag
          key={`${ingredient.name}-${index}`}
          name={ingredient.name}
          type={ingredient.type}
          description={ingredient.description}
          size={size}
          showIcon={showIcons}
          pressable={!!onTagPress}
          onPress={() => onTagPress?.(ingredient)}
        />
      ))}
      {remainingCount > 0 && (
        <MoreTag>
          <MoreText>+{remainingCount}</MoreText>
        </MoreTag>
      )}
    </TagListContainer>
  );
}

export type { GetProps };
