// src/app/(tabs)/profile/components/CreditScoreRing.tsx
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemeStore } from '@/src/store/themeStore';
import { neutralScale } from '@/src/design-system/tokens';
import { TouchableOpacity } from 'react-native';

interface CreditScoreRingProps {
  score: number;
  distribution: {
    profile: number; // 资料完整度占比
    credibility: number; // 评价可信度占比
    contribution: number; // 社区贡献占比
    compliance: number; // 合规性占比
  };
  onPress: () => void;
}

// 环形进度条的颜色配置
const RING_COLORS = [
  '#8B5CF6', // 资料完整度
  '#EC4899', // 评价可信度
  '#3B82F6', // 社区贡献
  '#10B981', // 合规性
];

export const CreditScoreRing = ({ score, distribution, onPress }: CreditScoreRingProps) => {
  const { themeMode } = useThemeStore();
  const strokeWidth = 8;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // 计算各部分的角度
  const profileAngle = (distribution.profile / 100) * circumference;
  const credibilityAngle = (distribution.credibility / 100) * circumference;
  const contributionAngle = (distribution.contribution / 100) * circumference;
  const complianceAngle = (distribution.compliance / 100) * circumference;

  // 计算各部分的起始角度
  const credibilityStart = profileAngle;
  const contributionStart = credibilityStart + credibilityAngle;
  const complianceStart = contributionStart + contributionAngle;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity
        style={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* 环形图 */}
        <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          {/* 背景圆环 */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={neutralScale.neutral3}
            strokeWidth={strokeWidth}
          />

          {/* 资料完整度 */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={RING_COLORS[0]}
            strokeWidth={strokeWidth}
            strokeDasharray={profileAngle}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* 评价可信度 */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={RING_COLORS[1]}
            strokeWidth={strokeWidth}
            strokeDasharray={credibilityAngle}
            strokeDashoffset={-credibilityStart}
            strokeLinecap="round"
          />

          {/* 社区贡献 */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={RING_COLORS[2]}
            strokeWidth={strokeWidth}
            strokeDasharray={contributionAngle}
            strokeDashoffset={-contributionStart}
            strokeLinecap="round"
          />

          {/* 合规性 */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={RING_COLORS[3]}
            strokeWidth={strokeWidth}
            strokeDasharray={complianceAngle}
            strokeDashoffset={-complianceStart}
            strokeLinecap="round"
          />
        </Svg>

        {/* 中心分数 */}
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#8B5CF6' }}>{score}</Text>
          <Text style={{ fontSize: 12, color: neutralScale.neutral8 }}>信誉分</Text>
        </View>
      </TouchableOpacity>

      {/* 图例 */}
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
        {[
          { label: '资料', color: RING_COLORS[0] },
          { label: '可信度', color: RING_COLORS[1] },
          { label: '贡献', color: RING_COLORS[2] },
          { label: '合规', color: RING_COLORS[3] },
        ].map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.color,
              }}
            />
            <Text style={{ fontSize: 10, color: neutralScale.neutral8 }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
