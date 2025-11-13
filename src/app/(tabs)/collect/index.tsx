import { CollectCard } from '@/src/components/CollectCard';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//顶部的搜索栏，支持输入文字
export default function CollectScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const { collects, loadCollects, deleteCollect, addCollect } = useCollectDatabase();
  const router = useRouter();

  // 初始加载数据
  useEffect(() => {
    loadCollects();
  }, []);

  // 添加测试数据（包括猫粮详细信息，添加剂，营养成分，高赞评论）的函数
  const addTestData = async () => {
    const { addCollect } = require('@/src/database/collectService');
    const {
      addAdditivesBatch,
      addNutritionBatch,
      addCommentsBatch,
    } = require('@/src/database/collectExtendedService');
    // 引入后端搜索 API（文件名为 addictive.ts，所以使用 addictive 路径）
    const { searchAdditive, searchIngredient } = require('@/src/api/addictive');
    // 引入主数据 upsert 方法
    const { upsertAdditiveMaster } = require('@/src/database/collectExtendedService');

    // 本次运行的简单缓存，避免重复网络请求
    const additiveCache = new Map<string, any>();
    const nutritionCache = new Map<string, any>();

    // 同义词映射：提升搜索命中率（仅用于查询，不写入）
    const additiveSynonyms: Record<string, string[]> = {
      紫胶: ['虫胶', '虫漆', '虫胶树脂'],
      维生素E: ['生育酚', 'VE', '维他命E'],
      DHA: ['二十二碳六烯酸', 'Omega-3 DHA', 'dha'],
      益生菌: ['乳酸菌', '益生元', '嗜酸乳杆菌'],
      叶酸: ['维生素B9', 'VB9', '叶酸盐'],
      生物素: ['维生素H', 'VB7', 'Biotin'],
    };

    const testData = [
      {
        id: Date.now().toString() + '_1',
        tag1: '成猫粮',
        tag2: '高蛋白',
        name: '皇家猫粮 K36',
        description: '专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素',
        collectCount: 12345,
        collectTime: Date.now(),
        brand: '皇家',
        price: 298,
        rating: 4.8,
        // 添加剂列表（只提供名称，其余信息将从本地 DB 或服务器补全）
        additives: [
          { name: '紫胶' },
          { name: '维生素E' },
          { name: 'DHA' },
          { name: '益生菌' },
          { name: '叶酸' },
          { name: '生物素' },
        ],
        // 营养成分列表
        nutrition: [
          { name: '粗蛋白', percentage: 38, value: 38, unit: '%' },
          { name: '粗脂肪', percentage: 18, value: 18, unit: '%' },
          { name: '粗纤维', percentage: 3.5, value: 3.5, unit: '%' },
          { name: '粗灰分', percentage: 8, value: 8, unit: '%' },
          { name: '水分', percentage: 10, value: 10, unit: '%' },
          { name: '钙', percentage: 1.2, value: 1.2, unit: '%' },
          { name: '磷', percentage: 1.0, value: 1.0, unit: '%' },
          { name: '牛磺酸', percentage: 0.2, value: 0.2, unit: '%' },
        ],
        // 高赞评论（最多3条）
        topComments: [
          {
            userName: '橘猫铲屎官',
            userAvatar: 'https://i.pravatar.cc/150?img=12',
            content: '我家橘猫吃了三个月，毛发变得超级亮！而且便便也很健康，强烈推荐！',
            likeCount: 1288,
            commentTime: Date.now() - 86400000 * 7,
            rating: 5,
          },
          {
            userName: '三只猫的妈妈',
            userAvatar: 'https://i.pravatar.cc/150?img=23',
            content: '性价比很高，三只猫都很喜欢吃，比之前的粮食适口性好多了',
            likeCount: 856,
            commentTime: Date.now() - 86400000 * 3,
            rating: 4.5,
          },
          {
            userName: '喵星人研究员',
            userAvatar: 'https://i.pravatar.cc/150?img=45',
            content: '营养配比科学，蛋白质含量高，我家挑食的猫都愿意吃',
            likeCount: 623,
            commentTime: Date.now() - 86400000 * 1,
            rating: 4.8,
          },
        ],
      },
      {
        id: Date.now().toString() + '_2',
        tag1: '幼猫粮',
        tag2: '易消化',
        name: '渴望幼猫粮',
        description: '富含新鲜肉类，为快速成长的幼猫提供充足能量',
        collectCount: 8976,
        collectTime: Date.now(),
        brand: '渴望',
        price: 458,
        rating: 4.9,
        // 添加剂列表（只提供名称，其余信息将从本地 DB 或服务器补全）
        additives: [
          { name: '鱼油' },
          { name: '牛磺酸' },
          { name: '维生素A' },
          { name: '维生素D3' },
          { name: '锌' },
        ],
        // 营养成分列表
        nutrition: [
          { name: '粗蛋白', percentage: 42, value: 42, unit: '%' },
          { name: '粗脂肪', percentage: 20, value: 20, unit: '%' },
          { name: '粗纤维', percentage: 2.5, value: 2.5, unit: '%' },
          { name: '粗灰分', percentage: 7.5, value: 7.5, unit: '%' },
          { name: '水分', percentage: 8, value: 8, unit: '%' },
          { name: 'DHA', percentage: 0.5, value: 0.5, unit: '%' },
          { name: 'EPA', percentage: 0.3, value: 0.3, unit: '%' },
        ],
        // 高赞评论
        topComments: [
          {
            userName: '新手猫奴',
            userAvatar: 'https://i.pravatar.cc/150?img=33',
            content: '幼猫吃得很香，两个月长了不少，医生说发育得很好！',
            likeCount: 2156,
            commentTime: Date.now() - 86400000 * 5,
            rating: 5,
          },
          {
            userName: '猫咪繁育师',
            userAvatar: 'https://i.pravatar.cc/150?img=56',
            content: '我们猫舍一直用这款，小猫断奶后适口性很好，营养全面',
            likeCount: 1834,
            commentTime: Date.now() - 86400000 * 10,
            rating: 4.9,
          },
          {
            userName: '布偶猫家长',
            userAvatar: 'https://i.pravatar.cc/150?img=67',
            content: '价格虽然贵但是值得，肉含量高，我家布偶长得特别好',
            likeCount: 1523,
            commentTime: Date.now() - 86400000 * 2,
            rating: 4.8,
          },
        ],
      },
    ];

    try {
      for (const item of testData) {
        // 1. 添加基础收藏信息
        await addCollect({
          id: item.id,
          tag1: item.tag1,
          tag2: item.tag2,
          name: item.name,
          description: item.description,
          collectCount: item.collectCount,
          collectTime: item.collectTime,
          brand: item.brand,
          price: item.price,
          rating: item.rating,
        });

        // 2. 添加添加剂数据（先尝试用本地 master，再用后端补全）
        if (item.additives && item.additives.length > 0) {
          const additivesToInsert: any[] = [];
          for (const a of item.additives) {
            // 1) 优先从本地 additives_master 读取
            const {
              getAdditiveMasterByName,
              upsertAdditiveMaster,
            } = require('@/src/database/collectExtendedService');
            let master = await getAdditiveMasterByName(a.name);

            // 2) 如本地无，则按候选关键字调用后端并落库
            if (!master) {
              try {
                let remote: any = null;
                const base = a.name;
                const candidatesRaw = [
                  base,
                  base.replace(/\s+/g, ''),
                  base.toUpperCase(),
                  ...(additiveSynonyms[base] || []),
                ];
                const seen = new Set<string>();
                const candidates = candidatesRaw.filter((c) => {
                  const k = c.trim();
                  if (!k || seen.has(k)) return false;
                  seen.add(k);
                  return true;
                });

                for (const kw of candidates) {
                  const res = await (searchAdditive ? searchAdditive(kw) : Promise.resolve(null));
                  const data = res?.additive ?? res?.data ?? res;
                  if (Array.isArray(data)) remote = data[0] ?? null;
                  else remote = data ?? null;
                  if (remote) break;
                }

                if (remote && (remote.name || remote.type || remote.applicable_range)) {
                  const id = await upsertAdditiveMaster({
                    id: remote.id,
                    name: remote.name || a.name,
                    en_name: remote.en_name,
                    type: remote.type,
                    applicable_range: remote.applicable_range,
                    raw: remote,
                  });
                  if (id) {
                    master = {
                      id,
                      name: remote.name || a.name,
                      en_name: remote.en_name,
                      type: remote.type,
                      applicable_range: remote.applicable_range,
                    } as any;
                  }
                }
              } catch (e) {
                console.warn('Additive remote search error:', a.name, e);
              }
            }

            const missing = !master;
            const enriched = {
              foodId: item.id,
              name: a.name,
              category: master?.type ?? undefined,
              description: master?.applicable_range ?? undefined,
              additiveId: master?.id ?? null,
            };
            additivesToInsert.push(enriched);

            if (missing) {
              Alert.alert(
                '提示',
                `未在数据库/服务器找到“${a.name}”的添加剂信息，将以占位记录保存。`
              );
            }
          }

          if (additivesToInsert.length > 0) {
            await addAdditivesBatch(additivesToInsert);
          }
        }

        // 3. 添加营养成分数据（先尝试用后端搜索补全）
        if (item.nutrition && item.nutrition.length > 0) {
          const nutritionToInsert: any[] = [];
          for (const n of item.nutrition) {
            let remote: any = null;
            try {
              const res = await (searchIngredient
                ? searchIngredient(n.name)
                : Promise.resolve(null));
              const data = res?.data ?? res;
              if (Array.isArray(data) && data.length > 0) remote = data[0];
              else if (data && typeof data === 'object') remote = data;
            } catch (e) {
              console.warn('Nutrition remote search error:', n.name, e);
            }

            const enriched = {
              foodId: item.id,
              name: n.name,
              percentage: (remote && (remote.percentage ?? remote.percent)) ?? n.percentage,
              value: (remote && (remote.value ?? remote.amount)) ?? n.value,
              unit: (remote && remote.unit) ?? n.unit,
            };
            nutritionToInsert.push(enriched);
          }

          if (nutritionToInsert.length > 0) {
            await addNutritionBatch(nutritionToInsert);
          }
        }

        // 4. 添加高赞评论数据
        if (item.topComments && item.topComments.length > 0) {
          const comments = item.topComments.map((c) => ({
            foodId: item.id,
            userName: c.userName,
            userAvatar: c.userAvatar,
            content: c.content ?? '（无内容）',
            likes: c.likeCount,
            rating: c.rating,
            commentTime: c.commentTime,
          }));
          if (comments.length > 0) {
            await addCommentsBatch(comments);
          }
        }
      }
      // 添加完成后刷新列表
      Alert.alert('✅ 成功', '已添加测试数据');
      await loadCollects();
    } catch (e) {
      console.error('Error adding test data:', e);
      Alert.alert('❌ 失败', '添加测试数据失败，请重试');
    }
  };

  // 删除某个收藏
  const handleDelete = async (id: string) => {
    Alert.alert('确认删除', '您确定要删除这个收藏吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await deleteCollect(id);
            // 删除成功后重新加载列表
            loadCollects();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      {/* 搜索框区域 */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + 16 }]}>
        <Image source={require('@/assets/appIcon.png')} style={styles.logo} />
        <View style={styles.searchBox}>
          <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
          <ThemedText style={styles.searchText} numberOfLines={1}>
            {searchText || '搜索您收藏的猫粮...'}
          </ThemedText>
        </View>
        <Button title="添加测试数据" onPress={addTestData} />
      </View>

      {/* 收藏列表区域 */}
      <ScrollView style={styles.listContainer}>
        {collects.map((item) => (
          <CollectCard
            key={item.id}
            tag1={item.tag1}
            tag2={item.tag2}
            name={item.name}
            description={item.description}
            collectCount={item.collectCount}
            onPress={() => {
              router.push({
                pathname: '/report/[id]',
                params: { id: item.id, data: JSON.stringify(item) },
              });
            }}
            onLongPress={() => {
              Alert.alert('删除', `确定要删除 ${item.name} 吗？`, [
                { text: '取消', style: 'cancel' },
                {
                  text: '删除',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteCollect(item.id);
                    Alert.alert('✅', '已删除');
                  },
                },
              ]);
            }}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
    marginRight: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
});
