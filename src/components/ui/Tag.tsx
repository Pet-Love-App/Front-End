import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from 'tamagui';

// 用户提供的颜色列表
const TAG_COLORS = ['#CA848A', '#DE8286', '#A78C7B', '#D8C8BD'];

/**
 * 计算给定十六进制颜色的亮度，并返回对比度最高的文本颜色（黑色或白色）。
 * @param hexColor - 十六进制颜色字符串 (例如, '#RRGGBB')
 * @returns 'black' 或 'white'
 */
const getContrastingTextColor = (hexColor: string): 'black' | 'white' => {
  if (!hexColor) return 'black';

  // 移除 '#'
  const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  // 将十六进制转换为 RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // W3C 亮度计算公式
  // http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 根据亮度决定文本颜色
  // 阈值 0.5 是一个常用的分界点
  return luminance > 0.5 ? 'black' : 'white';
};

interface TagProps {
  name: string;
  // 通过 index 决定颜色
  index: number;
}

const Tag: React.FC<TagProps> = ({ name, index }) => {
  // 循环使用颜色
  const backgroundColor = TAG_COLORS[index % TAG_COLORS.length];
  const textColor = getContrastingTextColor(backgroundColor);

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
