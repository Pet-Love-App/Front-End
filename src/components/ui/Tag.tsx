/**
 * Tag 标签组件
 * 使用统一的颜色系统
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from 'tamagui';

import { getContrastTextColor, getTagColor } from '@/src/constants/colors';

interface TagProps {
  name: string;
  /** 通过 index 决定颜色 */
  index: number;
}

const Tag: React.FC<TagProps> = ({ name, index }) => {
  const backgroundColor = getTagColor(index);
  const textColor = getContrastTextColor(backgroundColor);

  return (
    <View style={[styles.tag, { backgroundColor }]}>
      <Text style={[styles.tagText, { color: textColor }]}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Tag;
