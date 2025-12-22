/**
 * TopicSelectorModal - 话题选择模态框
 *
 * 允许用户选择或创建新话题
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Search, Hash, TrendingUp, Plus } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';
import { supabaseForumService } from '@/src/lib/supabase';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

interface Topic {
  id: string;
  name: string;
  postCount?: number;
  isHot?: boolean;
}

interface TopicSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (topics: Topic[]) => void;
  initialSelected?: Topic[];
}

export function TopicSelectorModal({
  visible,
  onClose,
  onConfirm,
  initialSelected = [],
}: TopicSelectorModalProps) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(initialSelected);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 样式定义
  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: colors.overlay as any,
        justifyContent: 'flex-end',
      },
      container: {
        backgroundColor: colors.cardBackground as any,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        paddingTop: 20,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border as any,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text as any,
      },
      closeButton: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundMuted as any,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
      },
      searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text as any,
        marginLeft: 10,
      },
      createNew: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        borderRadius: 12,
      },
      createNewText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary as any,
        marginLeft: 8,
      },
      selectedContainer: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 12,
        backgroundColor: colors.backgroundSubtle as any,
        borderRadius: 12,
      },
      selectedLabel: {
        fontSize: 12,
        color: colors.textSecondary as any,
        fontWeight: '600',
        marginBottom: 8,
      },
      selectedTopics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      selectedTag: {
        backgroundColor: colors.primary as any,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
      },
      selectedTagText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
      },
      section: {
        paddingHorizontal: 20,
        paddingVertical: 12,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary as any,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      list: {
        flex: 1,
      },
      listContent: {
        paddingHorizontal: 20,
        paddingBottom: 16,
      },
      topicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        backgroundColor: colors.backgroundSubtle as any,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
      },
      topicItemSelected: {
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        borderColor: colors.primary as any,
      },
      topicLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      topicName: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text as any,
        marginLeft: 8,
      },
      topicNameSelected: {
        color: colors.primary as any,
        fontWeight: '600',
      },
      hotBadge: {
        marginLeft: 6,
      },
      postCount: {
        fontSize: 13,
        color: colors.textTertiary as any,
      },
      footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border as any,
      },
      confirmButton: {
        backgroundColor: colors.primary as any,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
      },
      confirmButtonDisabled: {
        backgroundColor: colors.border as any,
      },
      confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
      },
      confirmButtonTextDisabled: {
        color: colors.textTertiary as any,
      },
    });
  }, [colors, isDark]);

  // 加载真实话题列表
  useEffect(() => {
    if (visible) {
      loadTopics();
    }
  }, [visible]);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const response = await supabaseForumService.getPosts({ pageSize: 100 });
      if (response.success && response.data) {
        // 从帖子中提取所有标签
        const tagMap = new Map<string, number>();
        response.data.forEach((post) => {
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tag: string) => {
              const count = tagMap.get(tag) || 0;
              tagMap.set(tag, count + 1);
            });
          }
        });

        // 转换为 Topic 对象并按使用次数排序
        const topicList: Topic[] = Array.from(tagMap.entries())
          .map(([name, postCount]) => ({
            id: name,
            name,
            postCount,
            isHot: postCount >= 3, // 使用次数 >= 3 则标记为热门
          }))
          .sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

        setTopics(topicList);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    return topics.filter((topic) => topic.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [topics, searchQuery]);

  const canCreateNew = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const exists = topics.some((topic) => topic.name.toLowerCase() === searchQuery.toLowerCase());
    return !exists;
  }, [searchQuery, topics]);

  const toggleTopic = useCallback((topic: Topic) => {
    setSelectedTopics((prev) => {
      const isSelected = prev.some((t) => t.id === topic.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== topic.id);
      } else {
        if (prev.length >= 5) {
          // 最多选择5个话题
          return prev;
        }
        return [...prev, topic];
      }
    });
  }, []);

  const createNewTopic = useCallback(() => {
    if (!searchQuery.trim() || !canCreateNew) return;

    const newTopic: Topic = {
      id: `new_${Date.now()}`,
      name: searchQuery.trim(),
      postCount: 0,
    };

    setSelectedTopics((prev) => {
      if (prev.length >= 5) return prev;
      return [...prev, newTopic];
    });
    setSearchQuery('');
  }, [searchQuery, canCreateNew]);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedTopics);
    onClose();
  }, [selectedTopics, onConfirm, onClose]);

  const formatCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const renderTopicItem = useCallback(
    ({ item }: { item: Topic }) => {
      const isSelected = selectedTopics.some((t) => t.id === item.id);

      return (
        <TouchableOpacity
          style={[dynamicStyles.topicItem, isSelected && dynamicStyles.topicItemSelected]}
          onPress={() => toggleTopic(item)}
          activeOpacity={0.7}
          disabled={!isSelected && selectedTopics.length >= 5}
        >
          <View style={dynamicStyles.topicLeft}>
            <Hash
              size={18}
              color={(isSelected ? colors.primary : colors.textTertiary) as any}
              strokeWidth={2}
            />
            <Text style={[dynamicStyles.topicName, isSelected && dynamicStyles.topicNameSelected]}>
              {item.name}
            </Text>
            {item.isHot && (
              <View style={dynamicStyles.hotBadge}>
                <TrendingUp size={12} color="#FF6B6B" strokeWidth={2.5} />
              </View>
            )}
          </View>

          {item.postCount !== undefined && (
            <Text style={dynamicStyles.postCount}>{formatCount(item.postCount)} 帖</Text>
          )}
        </TouchableOpacity>
      );
    },
    [selectedTopics, toggleTopic, dynamicStyles, colors]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={dynamicStyles.backdrop}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>选择话题</Text>
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.text as any} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.searchContainer}>
            <Search size={20} color={colors.textTertiary as any} strokeWidth={2} />
            <TextInput
              style={dynamicStyles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索或创建新话题"
              placeholderTextColor={colors.textTertiary as any}
            />
          </View>

          {canCreateNew && (
            <TouchableOpacity
              style={dynamicStyles.createNew}
              onPress={createNewTopic}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.primary as any} strokeWidth={2} />
              <Text style={dynamicStyles.createNewText}>创建话题 "#{searchQuery}"</Text>
            </TouchableOpacity>
          )}

          {selectedTopics.length > 0 && (
            <View style={dynamicStyles.selectedContainer}>
              <Text style={dynamicStyles.selectedLabel}>已选择 {selectedTopics.length}/5</Text>
              <View style={dynamicStyles.selectedTopics}>
                {selectedTopics.map((topic) => (
                  <View key={topic.id} style={dynamicStyles.selectedTag}>
                    <Text style={dynamicStyles.selectedTagText}>#{topic.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>{searchQuery ? '搜索结果' : '热门话题'}</Text>
          </View>

          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
            keyExtractor={(item) => item.id}
            style={dynamicStyles.list}
            contentContainerStyle={dynamicStyles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={dynamicStyles.footer}>
            <TouchableOpacity
              style={[
                dynamicStyles.confirmButton,
                selectedTopics.length === 0 && dynamicStyles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedTopics.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  dynamicStyles.confirmButtonText,
                  selectedTopics.length === 0 && dynamicStyles.confirmButtonTextDisabled,
                ]}
              >
                确定（{selectedTopics.length}）
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
