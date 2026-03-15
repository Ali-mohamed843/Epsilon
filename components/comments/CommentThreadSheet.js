import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import { getCommentThread } from '@/Api/api';

const BRAND = '#6e226e';

const ThreadCommentRow = ({ comment, isParent }) => {
  const time = comment.created_time ? new Date(comment.created_time).toLocaleString() : '';
  const avatarUrl = comment.from?.picture;
  const name = comment.from?.name ?? 'Unknown';

  return (
    <View
      className="py-3 px-4 border-b border-slate-100"
      style={isParent ? { backgroundColor: '#F8FAFC' } : { paddingLeft: 32 }}
    >
      <View className="flex-row items-center mb-1.5">
        <View className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center mr-2 overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} />
          ) : (
            <Text className="text-xs">👤</Text>
          )}
        </View>
        <Text className="text-xs font-semibold text-slate-800 flex-1">{name}</Text>
        {isParent && (
          <View className="px-2 py-0.5 rounded bg-purple-100">
            <Text className="text-xs font-medium" style={{ color: BRAND }}>Original</Text>
          </View>
        )}
      </View>
      <Text className="text-sm text-slate-700 mb-1">{comment.message}</Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-slate-400">{time}</Text>
        <View className="flex-row gap-1">
          {comment.is_done && (
            <View className="px-2 py-0.5 rounded bg-green-100">
              <Text className="text-xs text-green-700">Done</Text>
            </View>
          )}
          {comment.is_hided && (
            <View className="px-2 py-0.5 rounded bg-amber-100">
              <Text className="text-xs text-amber-700">Hidden</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentThreadSheet = ({ visible, onClose, pageId, commentId, platform = 'facebook' }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchThread = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);

    const result = await getCommentThread({ pageId, commentId, platform, page: pageNum });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const incoming = result.comments;
    setComments(prev => reset ? incoming : [...prev, ...incoming]);
    setHasMore(pageNum < (result.pageInfo.totalPages ?? 1));
    setPage(pageNum);
  }, [pageId, commentId, platform]);

  useEffect(() => {
    if (visible && commentId) {
      setComments([]);
      setPage(1);
      setHasMore(true);
      fetchThread(1, true);
    }
  }, [visible]);

  const loadMore = () => {
    if (!loading && hasMore) fetchThread(page + 1);
  };

  const buildThreadList = () => {
    if (comments.length === 0) return [];
    const parent = comments[0];
    const children = parent.child_comments ?? [];
    return [
      { ...parent, _isParent: true },
      ...children.map(c => ({ ...c, _isParent: false })),
    ];
  };

  const threadList = buildThreadList();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          className="bg-white rounded-2xl w-[92%]"
          style={{ maxHeight: '80%' }}
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
            <Text className="text-base font-bold text-slate-800">Comment Thread</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {error && (
            <View className="px-4 py-3">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {loading && comments.length === 0 ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : threadList.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-slate-400 text-sm">No comments in thread</Text>
            </View>
          ) : (
            <FlatList
              data={threadList}
              keyExtractor={(item, index) => item._id ?? `thread-${index}`}
              renderItem={({ item }) => (
                <ThreadCommentRow comment={item} isParent={item._isParent} />
              )}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                loading ? <ActivityIndicator size="small" color={BRAND} style={{ padding: 16 }} /> : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CommentThreadSheet;