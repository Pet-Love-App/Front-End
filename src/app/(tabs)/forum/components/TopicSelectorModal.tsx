/**
 * TopicSelectorModal - 话题选择模态框
 *
 * 允许用户选择或创建新话题
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, Search, Hash, TrendingUp, Plus } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';
import { supabaseForumService } from '@/src/lib/supabase';

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

const BRAND_COLOR = '#FEBE98'; // 应用主题色 - 温暖的桃色

export function TopicSelectorModal({
  visible,
  onClose,
  onConfirm,
  initialSelected = [],
}: TopicSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(initialSelected);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          style={[styles.topicItem, isSelected && styles.topicItemSelected]}
          onPress={() => toggleTopic(item)}
          activeOpacity={0.7}
          disabled={!isSelected && selectedTopics.length >= 5}
        >
          <View style={styles.topicLeft}>
            <Hash size={18} color={isSelected ? BRAND_COLOR : '#6B7280'} strokeWidth={2} />
            <Text style={[styles.topicName, isSelected && styles.topicNameSelected]}>
              {item.name}
            </Text>
            {item.isHot && (
              <View style={styles.hotBadge}>
                <TrendingUp size={12} color="#FF6B6B" strokeWidth={2.5} />
              </View>
            )}
          </View>

          {item.postCount !== undefined && (
            <Text style={styles.postCount}>{formatCount(item.postCount)} 帖</Text>
          )}
        </TouchableOpacity>
      );
    },
    [selectedTopics, toggleTopic]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择话题</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <X size={24} color="#262626" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索或创建新话题"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {canCreateNew && (
            <TouchableOpacity style={styles.createNew} onPress={createNewTopic} activeOpacity={0.7}>
              <Plus size={20} color={BRAND_COLOR} strokeWidth={2} />
              <Text style={styles.createNewText}>创建话题 "#{searchQuery}"</Text>
            </TouchableOpacity>
          )}

          {selectedTopics.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>已选择 {selectedTopics.length}/5</Text>
              <View style={styles.selectedTopics}>
                {selectedTopics.map((topic) => (
                  <View key={topic.id} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>#{topic.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{searchQuery ? '搜索结果' : '热门话题'}</Text>
          </View>

          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                selectedTopics.length === 0 && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedTopics.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  selectedTopics.length === 0 && styles.confirmButtonTextDisabled,
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
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
    backgroundColor: '#F3F4F6',
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
    color: '#262626',
    marginLeft: 10,
  },
  createNew: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5FE',
    borderRadius: 12,
  },
  createNewText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_COLOR,
    marginLeft: 8,
  },
  selectedContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    backgroundColor: BRAND_COLOR,
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
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicItemSelected: {
    backgroundColor: '#E8F5FE',
    borderColor: BRAND_COLOR,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#262626',
    marginLeft: 8,
  },
  topicNameSelected: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  hotBadge: {
    marginLeft: 6,
  },
  postCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
