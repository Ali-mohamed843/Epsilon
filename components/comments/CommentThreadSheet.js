import React, { useState, useEffect, useCallback, useRef } from 'react';
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
          {(comment.is_hided || comment.hidden) && (
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
  const [threadList, setThreadList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const childrenRef = useRef(null);
  const isLoadingRef = useRef(false);

  const fetchThread = useCallback(async (pageNum = 1) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (pageNum === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    const result = await getCommentThread({ pageId, commentId, platform, page: pageNum });

    isLoadingRef.current = false;

    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const comments = result.comments;
    const pageInfo = result.pageInfo;

    setTotalPages(pageInfo?.totalPages ?? 1);
    setTotalItems(pageInfo?.totalItems ?? 0);
    setPage(pageNum);

    if (!comments || comments.length === 0) {
      if (pageNum === 1) setThreadList([]);
      return;
    }

    const parentComment = comments[0];

    if (pageNum === 1) {
      childrenRef.current = parentComment.child_comments ?? [];
      const list = [
        { ...parentComment, _threadKey: `parent-${parentComment._id}`, _isParent: true },
        ...(childrenRef.current).map((c, i) => ({
          ...c,
          _threadKey: `child-${c._id ?? i}-p1`,
          _isParent: false,
        })),
      ];
      setThreadList(list);
    } else {
      const newChildren = parentComment.child_comments ?? [];
      const existingKeys = new Set(threadList.map(t => t._id));
      const uniqueNew = newChildren.filter(c => !existingKeys.has(c._id));

      if (uniqueNew.length > 0) {
        setThreadList(prev => [
          ...prev,
          ...uniqueNew.map((c, i) => ({
            ...c,
            _threadKey: `child-${c._id ?? i}-p${pageNum}`,
            _isParent: false,
          })),
        ]);
      }
    }
  }, [pageId, commentId, platform, threadList]);

  useEffect(() => {
    if (visible && commentId) {
      setThreadList([]);
      setPage(1);
      setTotalPages(1);
      setTotalItems(0);
      childrenRef.current = null;
      fetchThread(1);
    }
  }, [visible, commentId]);

  const handleLoadMore = () => {
    if (!loadingMore && !isLoadingRef.current && page < totalPages) {
      fetchThread(page + 1);
    }
  };

  const replyCount = threadList.length > 1 ? threadList.length - 1 : 0;

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
            <View>
              <Text className="text-base font-bold text-slate-800">Comment Thread</Text>
              <Text className="text-xs text-slate-400">
                {replyCount > 0 ? `${replyCount} replies` : ''}{totalItems > 0 ? ` · ${totalItems} total` : ''}
              </Text>
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

          {loading ? (
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
              keyExtractor={(item) => item._threadKey}
              renderItem={({ item }) => (
                <ThreadCommentRow comment={item} isParent={item._isParent} />
              )}
              ListFooterComponent={
                <View>
                  {loadingMore && (
                    <ActivityIndicator size="small" color={BRAND} style={{ padding: 16 }} />
                  )}
                  {!loadingMore && page < totalPages && (
                    <TouchableOpacity
                      onPress={handleLoadMore}
                      activeOpacity={0.8}
                      className="py-3 mx-4 my-3 rounded-xl items-center"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Text className="text-white text-sm font-semibold">
                        Load More ({page}/{totalPages})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CommentThreadSheet;