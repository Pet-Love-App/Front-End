import { CollectCard } from '@/src/components/collect-card';
import { LottieAnimation } from '@/src/components/lottie-animation';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, View } from 'react-native';

//顶部的搜索栏，支持输入文字
export default function CollectScreen() {
    const [searchText, setSearchText] = useState('');
    const {collects, loadCollects, deleteCollect, addCollect} = useCollectDatabase();
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
            addCommentsBatch 
        } = require('@/src/database/collectExtendedService');
        
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
                // 添加剂列表
                additives: [
                    { name: '牛磺酸', category: '营养强化剂', description: '猫咪必需的氨基酸，有助于视力和心脏健康' },
                    { name: '维生素E', category: '抗氧化剂', description: '天然抗氧化剂，保护细胞免受自由基损伤' },
                    { name: 'DHA', category: '营养强化剂', description: '促进大脑和视力发育' },
                    { name: '益生菌', category: '功能性添加剂', description: '维护肠道健康，促进消化' },
                    { name: '叶酸', category: '维生素', description: '支持细胞生长和DNA合成' },
                    { name: '生物素', category: '维生素', description: '改善毛发和皮肤健康' },
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
                        rating: 5
                    },
                    {
                        userName: '三只猫的妈妈',
                        userAvatar: 'https://i.pravatar.cc/150?img=23',
                        content: '性价比很高，三只猫都很喜欢吃，比之前的粮食适口性好多了',
                        likeCount: 856,
                        commentTime: Date.now() - 86400000 * 3,
                        rating: 4.5
                    },
                    {
                        userName: '喵星人研究员',
                        userAvatar: 'https://i.pravatar.cc/150?img=45',
                        content: '营养配比科学，蛋白质含量高，我家挑食的猫都愿意吃',
                        likeCount: 623,
                        commentTime: Date.now() - 86400000 * 1,
                        rating: 4.8
                    }
                ]
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
                // 添加剂列表
                additives: [
                    { name: '鱼油', category: '营养强化剂', description: '富含Omega-3脂肪酸，促进大脑发育' },
                    { name: '牛磺酸', category: '营养强化剂', description: '幼猫生长必需氨基酸' },
                    { name: '维生素A', category: '维生素', description: '支持视力和免疫系统发育' },
                    { name: '维生素D3', category: '维生素', description: '促进钙磷吸收，强健骨骼' },
                    { name: '锌', category: '矿物质', description: '支持免疫系统和皮肤健康' },
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
                        rating: 5
                    },
                    {
                        userName: '猫咪繁育师',
                        userAvatar: 'https://i.pravatar.cc/150?img=56',
                        content: '我们猫舍一直用这款，小猫断奶后适口性很好，营养全面',
                        likeCount: 1834,
                        commentTime: Date.now() - 86400000 * 10,
                        rating: 4.9
                    },
                    {
                        userName: '布偶猫家长',
                        userAvatar: 'https://i.pravatar.cc/150?img=67',
                        content: '价格虽然贵但是值得，肉含量高，我家布偶长得特别好',
                        likeCount: 1523,
                        commentTime: Date.now() - 86400000 * 2,
                        rating: 4.8
                    }
                ]
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
                
                // 2. 添加添加剂数据
                if (item.additives && item.additives.length > 0) {
                    const additives = item.additives.map(a => ({
                        ...a,
                        foodId: item.id
                    }));
                    await addAdditivesBatch(additives);
                }
                
                // 3. 添加营养成分数据
                if (item.nutrition && item.nutrition.length > 0) {
                    const nutrition = item.nutrition.map(n => ({
                        ...n,
                        foodId: item.id
                    }));
                    await addNutritionBatch(nutrition);
                }
                
                // 4. 添加高赞评论数据
                if (item.topComments && item.topComments.length > 0) {
                    const comments = item.topComments.map(c => ({
                        ...c,
                        foodId: item.id,
                        likes: c.likeCount
                    }));
                    await addCommentsBatch(comments);
                }
            }
            
            Alert.alert('✅ 成功', '已添加2条完整测试数据（包含添加剂、营养成分、高赞评论）');
            await loadCollects(); // 重新加载列表
        } catch (error) {
            console.error('添加测试数据失败:', error);
            Alert.alert('❌ 失败', '添加测试数据失败');
        }
    };


    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchBar}>
                <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
                <ThemedText style={styles.searchInput} onPress={() => Alert.alert('搜索', '点击了搜索栏')}>
                    {searchText || '搜索历史报告...'}
                </ThemedText>
            </View>
            
            {/* 测试按钮 */}
            <View style={styles.testButtonContainer}>
                <Button title="➕ 添加2条测试数据" onPress={addTestData} />
            </View>
            
            {/* 显示数据列表或空状态 */}
            {collects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <BottomAnimation />
                    <ThemedText style={styles.emptyText}>
                        还没有收藏数据{'\n'}点击上方按钮添加测试数据
                    </ThemedText>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
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
                                    params: {
                                        id: item.id,
                                        data: JSON.stringify(item)
                                    }
                                });
                            }}
                            onLongPress={() => {
                                Alert.alert(
                                    '删除',
                                    `确定要删除 ${item.name} 吗？`,
                                    [
                                        { text: '取消', style: 'cancel' },
                                        { 
                                            text: '删除', 
                                            style: 'destructive',
                                            onPress: async () => {
                                                await deleteCollect(item.id);
                                                Alert.alert('✅', '已删除');
                                            }
                                        },
                                    ]
                                );
                            }}
                        />
                    ))}
                </ScrollView>
            )}
        </ThemedView>
    );
}


//底部显示一个动画
export function BottomAnimation() {
    return (
        <LottieAnimation
            source={require('@/assets/animations/cat_mark_loading.json')}
            width={150}
            height={150}
        />
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchBar: {
        top: "7%",
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#888',
    },
    testButtonContainer: {
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.6,
    },
});