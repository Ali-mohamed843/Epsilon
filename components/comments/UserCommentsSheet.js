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
import { getUserComments } from '@/Api/api';

const BRAND = '#6e226e';

const UserCommentRow = ({ comment }) => {
  const time = comment.created_time ? new Date(comment.created_time).toLocaleString() : '';

  return (
    <View className="py-3 px-4 border-b border-slate-100">
      <Text className="text-sm text-slate-800 mb-1">{comment.message}</Text>
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
          {comment.is_liked && (
            <View className="px-2 py-0.5 rounded bg-purple-100">
              <Text className="text-xs" style={{ color: BRAND }}>Liked</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const UserCommentsSheet = ({ visible, onClose, userId, userName, userPicture, pageId, platform = 'facebook' }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);

    const result = await getUserComments({ userId, pageId, platform, page: pageNum });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setComments(prev => reset ? result.comments : [...prev, ...result.comments]);
    setHasMore(pageNum < (result.pageInfo.totalPages ?? 1));
    setPage(pageNum);
  }, [userId, pageId, platform]);

  useEffect(() => {
    if (visible && userId) {
      setComments([]);
      setPage(1);
      setHasMore(true);
      fetchComments(1, true);
    }
  }, [visible]);

  const loadMore = () => {
    if (!loading && hasMore) fetchComments(page + 1);
  };

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
            <View className="flex-row items-center flex-1">
              <View className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-3 overflow-hidden">
                {userPicture ? (
                  <Image source={{ uri: userPicture }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                ) : (
                  <Text className="text-base">👤</Text>
                )}
              </View>
              <View>
                <Text className="text-base font-bold text-slate-800">{userName ?? 'User'}</Text>
                <Text className="text-xs text-slate-500">Comments</Text>
              </View>
            </View>
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
          ) : comments.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-slate-400 text-sm">No comments found</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <UserCommentRow comment={item} />}
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

export default UserCommentsSheet;