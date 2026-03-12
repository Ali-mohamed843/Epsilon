import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Search, Pin, ThumbsUp, MessageCircle, Trash2 } from 'lucide-react-native';
import { getPageComments, deleteComment } from '@/Api/api';

const BRAND = '#6e226e';

const FilterButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`px-4 py-2 rounded-lg mr-2 border ${isActive ? 'border-0' : 'bg-white border-slate-200'}`}
    style={isActive ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
  >
    <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const CommentBadge = ({ type }) => {
  const isReply = type === 'reply';
  return (
    <View className={`px-2.5 py-1 rounded-md ${isReply ? 'bg-purple-100' : 'bg-pink-100'}`}>
      <Text
        className={`text-xs font-medium capitalize ${isReply ? 'text-purple-700' : 'text-pink-700'}`}
        style={!isReply ? { color: BRAND } : {}}
      >
        {type ?? 'direct'}
      </Text>
    </View>
  );
};

const IconButton = ({ icon: Icon, color = '#64748B', bgColor = 'bg-slate-100', onPress, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
    className={`w-9 h-9 rounded-lg ${bgColor} items-center justify-center`}
    style={disabled ? { opacity: 0.5 } : {}}
  >
    <Icon size={18} color={color} />
  </TouchableOpacity>
);

const CommentCard = ({ comment, onViewHistory, onPin, onLike, onMessage, onDelete, isDeleting }) => {
  const badgeType = comment.parent_id === comment.post_id ? 'direct' : 'reply';
  const avatarUrl = comment.from?.picture;
  const name = comment.from?.name ?? 'Unknown';
  const time = comment.created_time ? new Date(comment.created_time).toLocaleString() : '';

  return (
    <View
      className="bg-white rounded-xl p-4 mb-3 border border-slate-200"
      style={isDeleting ? { opacity: 0.5 } : {}}
    >
      {isDeleting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>Deleting...</Text>
        </View>
      )}

      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <Text className="text-lg">👤</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-800 mb-0.5">{name}</Text>
          <Text className="text-xs text-slate-500">{time}</Text>
        </View>
        <CommentBadge type={badgeType} />
      </View>

      <Text className="text-sm text-slate-700 leading-5 mb-4">{comment.message}</Text>

      {comment.pageHasReplied && (
        <View className="mb-3 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <Text className="text-xs text-green-600 font-medium">Replied</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onViewHistory}
          activeOpacity={0.7}
          disabled={isDeleting}
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: BRAND }}
        >
          <Text className="text-sm font-medium text-white">View History</Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          <IconButton icon={Pin} color="#64748B" bgColor="bg-slate-100" onPress={onPin} disabled={isDeleting} />
          <IconButton icon={ThumbsUp} color={BRAND} bgColor="bg-purple-100" onPress={onLike} disabled={isDeleting} />
          <IconButton icon={MessageCircle} color="#64748B" bgColor="bg-slate-100" onPress={onMessage} disabled={isDeleting} />
          <IconButton icon={Trash2} color="#DC2626" bgColor="bg-red-100" onPress={onDelete} disabled={isDeleting} />
        </View>
      </View>
    </View>
  );
};

const CommentsTab = ({ pageId, pageName, platform = 'facebook' }) => {
  const [sort, setSort] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingIds, setDeletingIds] = useState(new Set());

  const isFetching = useRef(false);
  const PER_PAGE = 30;

  const fetchComments = useCallback(
    async ({ pageNum = 1, reset = false } = {}) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      setError(null);

      const result = await getPageComments({
        pageId,
        platform,
        page: pageNum,
        perPage: PER_PAGE,
        search: searchQuery,
        sort,
      });

      isFetching.current = false;
      setLoading(false);

      if (!result.success) {
        setError(result.message);
        return;
      }

      const incoming = result.comments;
      setComments((prev) => (reset ? incoming : [...prev, ...incoming]));
      setHasMore(incoming.length === PER_PAGE);
      setPage(pageNum);
    },
    [pageId, platform, searchQuery, sort]
  );

  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    fetchComments({ pageNum: 1, reset: true });
  }, [pageId, platform, searchQuery, sort]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadMore = () => {
    if (!loading && hasMore && !isFetching.current) {
      fetchComments({ pageNum: page + 1 });
    }
  };

  const handleDelete = useCallback(
    (comment) => {
      const commentId = comment.comment_id;
      const commentName = comment.from?.name ?? 'this comment';
      const commentPreview =
        comment.message?.length > 50
          ? comment.message.substring(0, 50) + '...'
          : comment.message ?? '';

      Alert.alert(
        'Delete Comment',
        `Are you sure you want to delete ${commentName}'s comment?\n\n"${commentPreview}"`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setDeletingIds((prev) => new Set([...prev, comment._id]));

              const result = await deleteComment({
                pageId,
                commentId,
                platform,
              });

              if (result.success) {
                setComments((prev) => prev.filter((c) => c._id !== comment._id));
                Alert.alert('Deleted', 'Comment has been deleted successfully.');
              } else {
                Alert.alert(
                  'Delete Failed',
                  result.message || 'Something went wrong. Please try again.',
                  [{ text: 'OK' }]
                );
              }
              setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(comment._id);
                return next;
              });
            },
          },
        ],
        { cancelable: true }
      );
    },
    [pageId, platform]
  );

  const filteredComments = comments.filter((c) => {
    if (statusFilter === 'replied') return c.pageHasReplied === true;
    if (statusFilter === 'pending') return !c.pageHasReplied;
    return true;
  });

  return (
    <View className="flex-1">
      <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
        <View className="flex-row mb-3">
          <FilterButton title="New First" isActive={sort === 'desc'} onPress={() => setSort('desc')} />
          <FilterButton title="Old First" isActive={sort === 'asc'} onPress={() => setSort('asc')} />
        </View>

        <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-2 mb-3 border border-slate-200">
          <Search size={18} color="#94A3B8" />
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search comments..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-sm text-slate-800"
          />
        </View>

        <View className="flex-row">
          <FilterButton title="All" isActive={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
          <FilterButton
            title="Replied"
            isActive={statusFilter === 'replied'}
            onPress={() => setStatusFilter('replied')}
          />
          <FilterButton
            title="Pending"
            isActive={statusFilter === 'pending'}
            onPress={() => setStatusFilter('pending')}
          />
        </View>
      </View>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {loading && comments.length === 0 && (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      )}

      {filteredComments.map((item) => (
        <CommentCard
          key={item._id}
          comment={item}
          isDeleting={deletingIds.has(item._id)}
          onViewHistory={() => console.log('View history:', item.from?.name)}
          onPin={() => console.log('Pin:', item._id)}
          onLike={() => console.log('Like:', item._id)}
          onMessage={() => console.log('Message:', item.from?.name)}
          onDelete={() => handleDelete(item)}
        />
      ))}

      {!loading && filteredComments.length === 0 && (
        <View className="items-center justify-center py-20">
          <Text className="text-4xl mb-4">💬</Text>
          <Text className="text-slate-400 text-base">No comments found</Text>
          <Text className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</Text>
        </View>
      )}

      {hasMore && !loading && filteredComments.length > 0 && (
        <TouchableOpacity
          onPress={loadMore}
          activeOpacity={0.8}
          className="py-3 rounded-xl items-center mb-4"
          style={{ backgroundColor: BRAND }}
        >
          <Text className="text-white text-sm font-semibold">Load More</Text>
        </TouchableOpacity>
      )}

      {loading && comments.length > 0 && (
        <ActivityIndicator size="small" color={BRAND} className="py-4" />
      )}
    </View>
  );
};

export default CommentsTab;