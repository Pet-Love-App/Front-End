/**
 * PostDetailHeader - 帖子详情顶部栏
 *
 * 包含：返回按钮、标题、编辑/删除操作
 */

import React, { memo } from 'react';
import { ChevronLeft, Edit3, Trash2 } from '@tamagui/lucide-icons';
import { styled, XStack, Text, Button } from 'tamagui';

import { ForumColors } from '../../constants';

export interface PostDetailHeaderProps {
  /** 是否为帖子作者 */
  isAuthor: boolean;
  /** 关闭详情页 */
  onClose: () => void;
  /** 编辑帖子 */
  onEdit?: () => void;
  /** 删除帖子 */
  onDelete?: () => void;
}

// 样式组件
const HeaderContainer = styled(XStack, {
  name: 'PostDetailHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const LeftSection = styled(XStack, {
  name: 'LeftSection',
  alignItems: 'center',
  minWidth: 80,
});

const BackButton = styled(XStack, {
  name: 'BackButton',
  alignItems: 'center',
  gap: '$1',
  paddingVertical: '$2',
  paddingRight: '$2',
  pressStyle: {
    opacity: 0.6,
  },
});

const TitleText = styled(Text, {
  name: 'HeaderTitle',
  fontSize: 17,
  fontWeight: '600',
  color: ForumColors.clay,
  flex: 1,
  textAlign: 'center',
});

const ActionGroup = styled(XStack, {
  name: 'HeaderActions',
  alignItems: 'center',
  gap: '$3',
  minWidth: 80,
  justifyContent: 'flex-end',
});

const ActionButton = styled(Button, {
  name: 'ActionButton',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '$backgroundSubtle',
  pressStyle: {
    backgroundColor: '$backgroundHover',
    opacity: 0.8,
  },
});

/**
 * 帖子详情顶部栏组件
 */
function PostDetailHeaderComponent({ isAuthor, onClose, onEdit, onDelete }: PostDetailHeaderProps) {
  return (
    <HeaderContainer>
      <LeftSection>
        <BackButton onPress={onClose}>
          <ChevronLeft size={22} color={ForumColors.clay} />
          <Text fontSize={16} color={ForumColors.clay}>
            返回
          </Text>
        </BackButton>
      </LeftSection>

      <TitleText>帖子详情</TitleText>

      <ActionGroup>
        {isAuthor ? (
          <>
            <ActionButton onPress={onEdit}>
              <Edit3 size={20} color={ForumColors.clay} />
            </ActionButton>
            <ActionButton onPress={onDelete}>
              <Trash2 size={20} color={ForumColors.red} />
            </ActionButton>
          </>
        ) : (
          // 占位，保持标题居中
          <XStack width={40} />
        )}
      </ActionGroup>
    </HeaderContainer>
  );
}

export const PostDetailHeader = memo(PostDetailHeaderComponent);
