import { View, Text, Button, FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client'; // 修正路径
import { adminRecalculateReputation } from '@/src/lib/supabase/services/reputation'; // 修正路径
import { analyzeReputationDistribution } from '@/src/lib/supabase/services/audit'; // 修正路径

export default function ReputationAudit() {
  const [distribution, setDistribution] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // 获取信用分分布
    analyzeReputationDistribution().then(({ data }) => {
      setDistribution(data);
    });

    // 获取用户列表
    supabase
      .from('reputation_summaries')
      .select(
        `
        *,
        user:profiles(username, id)
      `
      )
      .order('score', { ascending: false })
      .then(({ data }) => {
        setUsers(data || []);
      });
  }, []);

  const handleAdjustScore = async (adminId: string, userId: string) => {
    Alert.prompt('调整信用分', '输入新的信用分（0-100）', async (score) => {
      if (!score || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
        Alert.alert('错误', '请输入有效的分数（0-100）');
        return;
      }

      await adminRecalculateReputation(adminId, userId, {
        score: Number(score),
      });

      // 刷新列表
      supabase
        .from('reputation_summaries')
        .select(`*, user:profiles(username, id)`)
        .order('score', { ascending: false })
        .then(({ data }) => {
          setUsers(data as any[]);
        });
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20 }}>信用分审计</Text>

      {/* 信用分分布 */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>信用分分布</Text>
        {distribution && (
          <View>
            <Text>0-20分：{distribution['0-20']}人</Text>
            <Text>21-40分：{distribution['21-40']}人</Text>
            <Text>41-60分：{distribution['41-60']}人</Text>
            <Text>61-80分：{distribution['61-80']}人</Text>
            <Text>81-100分：{distribution['81-100']}人</Text>
          </View>
        )}
      </View>

      {/* 用户列表 */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <View>
              <Text>
                {item.user.username} (ID: {item.user.id})
              </Text>
              <Text>
                当前分数：{item.score} 分（{item.level}）
              </Text>
            </View>
            <Button title="调整" onPress={() => handleAdjustScore('admin_id_here', item.user.id)} />
          </View>
        )}
      />
    </View>
  );
}
