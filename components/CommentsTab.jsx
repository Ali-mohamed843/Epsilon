import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Search, UserPlus, ThumbsUp, EyeOff, Eye, Trash2, CheckCircle, MessageCircle } from 'lucide-react-native';
import { getPageComments, deleteComment, hideComment, likeComment, markCommentDone, blockUser } from '@/Api/api';
import FilterButton from '@/components/comments/FilterButton';
import IconButton from '@/components/comments/IconButton';
import AssignModal from '@/components/comments/AssignModal';
import KebabMenu from '@/components/comments/KebabMenu';
import ReplyModal from '@/components/comments/ReplyModal';
import UserCommentsSheet from '@/components/comments/UserCommentsSheet';
import CommentThreadSheet from '@/components/comments/CommentThreadSheet';
import HistoryModal from '@/components/comments/HistoryModal';

const BRAND = '#6e226e';
const PER_PAGE = 30;

const CommentCard = ({ comment, platform, onViewHistory, onAssign, onLike, onReply, onHide, onDelete, onDone, onMenuSelect, isDeleting, isHiding, isLiking, isDoning }) => {
  const avatarUrl = comment.from?.picture;
  const name = comment.from?.name ?? 'Unknown';
  const time = comment.created_time ? new Date(comment.created_time).toLocaleString() : '';
  const isHidden = comment.is_hided === true;
  const isLiked = comment.is_liked === true;
  const isAssigned = !!comment.assigned_to;
  const isDone = comment.is_done === true;
  const isBusy = isDeleting || isHiding || isLiking || isDoning;
  const isFacebook = platform === 'facebook';

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
      {isBusy && (
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
          <ActivityIndicator
            size="small"
            color={isDeleting ? '#DC2626' : isDoning ? '#22C55E' : isLiking ? BRAND : '#F59E0B'}
          />
          <Text
            style={{
              color: isDeleting ? '#DC2626' : isDoning ? '#22C55E' : isLiking ? BRAND : '#F59E0B',
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {isDeleting ? 'Deleting...' : isDoning ? 'Marking done...' : 'Updating...'}
          </Text>
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
          <View className="flex-row items-center flex-wrap">
            <Text className="text-sm font-semibold text-slate-800 mb-0.5">{name}</Text>
            {isDone && (
              <View className="ml-2 px-2 py-0.5 rounded bg-green-100">
                <Text className="text-xs text-green-700 font-medium">Done</Text>
              </View>
            )}
            {isHidden && (
              <View className="ml-2 px-2 py-0.5 rounded bg-amber-100">
                <Text className="text-xs text-amber-700 font-medium">Hidden</Text>
              </View>
            )}
            {isFacebook && isLiked && (
              <View className="ml-2 px-2 py-0.5 rounded bg-purple-100">
                <Text className="text-xs font-medium" style={{ color: BRAND }}>Liked</Text>
              </View>
            )}
            {isAssigned && (
              <View className="ml-2 px-2 py-0.5 rounded bg-blue-100">
                <Text className="text-xs text-blue-700 font-medium">{comment.assigned_to.name}</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-slate-500">{time}</Text>
        </View>
        <KebabMenu onSelect={onMenuSelect} disabled={isBusy} platform={platform} />
      </View>

      <Text className="text-sm text-slate-700 leading-5 mb-4">{comment.message}</Text>

      {comment.pageHasReplied && (
        <View className="mb-3 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <Text className="text-xs text-green-600 font-medium">Replied</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onViewHistory}
            activeOpacity={0.7}
            disabled={isBusy}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: BRAND }}
          >
            <Text className="text-sm font-medium text-white">View History</Text>
          </TouchableOpacity>

          {isAssigned && !isDone && (
            <TouchableOpacity
              onPress={onDone}
              activeOpacity={0.7}
              disabled={isBusy}
              className="flex-row items-center px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#22C55E' }}
            >
              <CheckCircle size={16} color="#fff" />
              <Text className="text-sm font-medium text-white ml-1">Done</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row gap-1.5">
          <IconButton
            icon={UserPlus}
            color={isAssigned ? '#ffffff' : '#64748B'}
            bgColor={isAssigned ? '' : 'bg-slate-100'}
            style={isAssigned ? { backgroundColor: '#3B82F6' } : {}}
            onPress={onAssign}
            disabled={isBusy}
            size={14}
            buttonSize={7}
          />
          {isFacebook ? (
            <IconButton
              icon={ThumbsUp}
              color={isLiked ? '#ffffff' : BRAND}
              bgColor={isLiked ? '' : 'bg-purple-100'}
              style={isLiked ? { backgroundColor: BRAND } : {}}
              onPress={onLike}
              disabled={isBusy}
              size={14}
              buttonSize={7}
            />
          ) : (
            <IconButton
              icon={MessageCircle}
              color={BRAND}
              bgColor="bg-purple-100"
              onPress={onReply}
              disabled={isBusy}
              size={14}
              buttonSize={7}
            />
          )}
          <IconButton
            icon={isHidden ? Eye : EyeOff}
            color={isHidden ? '#F59E0B' : '#64748B'}
            bgColor={isHidden ? 'bg-amber-100' : 'bg-slate-100'}
            onPress={onHide}
            disabled={isBusy}
            size={14}
            buttonSize={7}
          />
          <IconButton
            icon={Trash2}
            color="#DC2626"
            bgColor="bg-red-100"
            onPress={onDelete}
            disabled={isBusy}
            size={14}
            buttonSize={7}
          />
        </View>
      </View>
    </View>
  );
};

const CommentsTab = ({ pageId, pageName, platform = 'facebook', onNavigateToPost }) => {
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
  const [hidingIds, setHidingIds] = useState(new Set());
  const [likingIds, setLikingIds] = useState(new Set());
  const [doningIds, setDoningIds] = useState(new Set());
  const [assignModal, setAssignModal] = useState({ visible: false, comment: null });
  const [replyModal, setReplyModal] = useState({ visible: false, comment: null });
  const [userSheet, setUserSheet] = useState({ visible: false, userId: null, userName: null, userPicture: null });
  const [threadSheet, setThreadSheet] = useState({ visible: false, commentId: null });
  const isFetching = useRef(false);
  const [historyModal, setHistoryModal] = useState({ visible: false, comment: null });

  const fetchComments = useCallback(async ({ pageNum = 1, reset = false } = {}) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);

    const result = await getPageComments({ pageId, platform, page: pageNum, perPage: PER_PAGE, search: searchQuery, sort });

    isFetching.current = false;
    setLoading(false);

    if (!result.success) { setError(result.message); return; }

    const incoming = result.comments;
    setComments(prev => reset ? incoming : [...prev, ...incoming]);
    setHasMore(incoming.length === PER_PAGE);
    setPage(pageNum);
  }, [pageId, platform, searchQuery, sort]);

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
    if (!loading && hasMore && !isFetching.current) fetchComments({ pageNum: page + 1 });
  };

  const addBusyId = (setter, id) => setter(prev => new Set([...prev, id]));
  const removeBusyId = (setter, id) => setter(prev => { const n = new Set(prev); n.delete(id); return n; });

  const handleDelete = useCallback((comment) => {
    const preview = comment.message?.length > 50 ? comment.message.substring(0, 50) + '...' : comment.message ?? '';
    Alert.alert('Delete Comment', `Delete "${preview}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          addBusyId(setDeletingIds, comment._id);
          const result = await deleteComment({ pageId, commentId: comment.comment_id, platform });
          if (result.success) {
            setComments(prev => prev.filter(c => c._id !== comment._id));
          } else {
            Alert.alert('Delete Failed', result.message);
          }
          removeBusyId(setDeletingIds, comment._id);
        }
      }
    ]);
  }, [pageId, platform]);

  const handleHide = useCallback((comment) => {
    const isHidden = comment.is_hided === true;
    const action = isHidden ? 'Unhide' : 'Hide';
    Alert.alert(`${action} Comment`, `${action} this comment?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action, onPress: async () => {
          addBusyId(setHidingIds, comment._id);
          const result = await hideComment({ pageId, commentId: comment.comment_id, platform });
          if (result.success) {
            setComments(prev => prev.map(c =>
              c._id === comment._id ? { ...c, is_hided: result.comment?.is_hided ?? !isHidden } : c
            ));
          } else {
            Alert.alert(`${action} Failed`, result.message);
          }
          removeBusyId(setHidingIds, comment._id);
        }
      }
    ]);
  }, [pageId, platform]);

  const handleLike = useCallback((comment) => {
    if (platform !== 'facebook') return;
    const isLiked = comment.is_liked === true;
    addBusyId(setLikingIds, comment._id);
    (async () => {
      const result = await likeComment({ pageId, commentId: comment.comment_id, platform, isLiked });
      if (result.success) {
        setComments(prev => prev.map(c =>
          c._id === comment._id
            ? { ...c, is_liked: result.comment.is_liked ?? !isLiked, page_actions: result.comment.page_actions }
            : c
        ));
      } else {
        Alert.alert(`${isLiked ? 'Unlike' : 'Like'} Failed`, result.message);
      }
      removeBusyId(setLikingIds, comment._id);
    })();
  }, [pageId, platform]);

  const handleReply = useCallback((comment) => {
    setReplyModal({ visible: true, comment });
  }, []);

  const handleReplyClose = useCallback(() => {
    setReplyModal({ visible: false, comment: null });
  }, []);

  const handleDone = useCallback((comment) => {
    Alert.alert('Mark as Done', 'Mark this comment as done?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Done', onPress: async () => {
          addBusyId(setDoningIds, comment._id);
          const result = await markCommentDone({ pageId, commentId: comment.comment_id, platform });
          if (result.success) {
            setComments(prev => prev.map(c =>
              c._id === comment._id ? { ...c, is_done: true } : c
            ));
          } else {
            Alert.alert('Failed', result.message);
          }
          removeBusyId(setDoningIds, comment._id);
        }
      }
    ]);
  }, [pageId, platform]);

  const handleAssign = useCallback((comment) => {
    setAssignModal({ visible: true, comment });
  }, []);

  const handleAssignClose = useCallback((success, selectedUser) => {
    if (success && selectedUser && assignModal.comment) {
      setComments(prev => prev.map(c =>
        c._id === assignModal.comment._id
          ? { ...c, assigned_to: { _id: selectedUser._id, name: selectedUser.name, email: selectedUser.email } }
          : c
      ));
    }
    setAssignModal({ visible: false, comment: null });
  }, [assignModal.comment]);

  const handleBlock = useCallback((comment) => {
    const userName = comment.from?.name ?? 'this user';
    Alert.alert('Block User', `Block ${userName}? They won't be able to comment on your posts.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block', style: 'destructive', onPress: async () => {
          const result = await blockUser({ pageId, userId: comment.from?.id, platform });
          if (result.success) {
            Alert.alert('Blocked', `${userName} has been blocked.`);
          } else {
            Alert.alert('Block Failed', result.message);
          }
        }
      }
    ]);
  }, [pageId, platform]);

  const getPostIdFromComment = (comment, platform) => {
  if (platform === 'instagram') {
    return comment.media?.id ?? comment.post_id ?? null;
  }
  return comment.post_id ?? null;
};

const handleMenuSelect = useCallback((comment, key) => {
  switch (key) {
    case 'view_platform': {
      const url = comment.post?.permalink_url;
      if (url) Linking.openURL(url);
      else Alert.alert('Error', 'No link available');
      break;
    }
    case 'view_post': {
      const postId = getPostIdFromComment(comment, platform);
      if (postId && onNavigateToPost) {
        onNavigateToPost(postId);
      } else {
        Alert.alert('Error', 'Cannot navigate to post');
      }
      break;
    }
    case 'user_comments': {
      setUserSheet({
        visible: true,
        userId: comment.from?.id,
        userName: comment.from?.name,
        userPicture: comment.from?.picture,
      });
      break;
    }
    case 'comment_thread': {
      setThreadSheet({
        visible: true,
        commentId: comment.comment_id,
      });
      break;
    }
    case 'block': {
      handleBlock(comment);
      break;
    }
  }
}, [handleBlock, platform, onNavigateToPost]);

  const filteredComments = comments.filter(c => {
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
          <FilterButton title="Replied" isActive={statusFilter === 'replied'} onPress={() => setStatusFilter('replied')} />
          <FilterButton title="Pending" isActive={statusFilter === 'pending'} onPress={() => setStatusFilter('pending')} />
        </View>
      </View>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {loading && comments.length === 0 && (
        <View className="items-center py-10"><ActivityIndicator size="large" color={BRAND} /></View>
      )}

      {filteredComments.map(item => (
        <CommentCard
          key={item._id}
          comment={item}
          platform={platform}
          isDeleting={deletingIds.has(item._id)}
          isHiding={hidingIds.has(item._id)}
          isLiking={likingIds.has(item._id)}
          isDoning={doningIds.has(item._id)}
          onViewHistory={() => setHistoryModal({ visible: true, comment: item })}
          onAssign={() => handleAssign(item)}
          onLike={() => handleLike(item)}
          onReply={() => handleReply(item)}
          onHide={() => handleHide(item)}
          onDelete={() => handleDelete(item)}
          onDone={() => handleDone(item)}
          onMenuSelect={(key) => handleMenuSelect(item, key)}
        />
      ))}

      {!loading && filteredComments.length === 0 && (
        <View className="items-center justify-center py-20">
          <Text className="text-4xl mb-4">💬</Text>
          <Text className="text-slate-400 text-base">No comments found</Text>
        </View>
      )}

      {hasMore && !loading && filteredComments.length > 0 && (
        <TouchableOpacity onPress={loadMore} activeOpacity={0.8} className="py-3 rounded-xl items-center mb-4" style={{ backgroundColor: BRAND }}>
          <Text className="text-white text-sm font-semibold">Load More</Text>
        </TouchableOpacity>
      )}

      {loading && comments.length > 0 && <ActivityIndicator size="small" color={BRAND} className="py-4" />}

      <AssignModal
        visible={assignModal.visible}
        commentId={assignModal.comment?._id}
        assignedTo={assignModal.comment?.assigned_to}
        platform={platform}
        onClose={handleAssignClose}
      />

      <ReplyModal
        visible={replyModal.visible}
        comment={replyModal.comment}
        pageId={pageId}
        platform={platform}
        onClose={handleReplyClose}
      />

      <UserCommentsSheet
        visible={userSheet.visible}
        userId={userSheet.userId}
        userName={userSheet.userName}
        userPicture={userSheet.userPicture}
        pageId={pageId}
        platform={platform}
        onClose={() => setUserSheet({ visible: false, userId: null, userName: null, userPicture: null })}
      />

      <CommentThreadSheet
        visible={threadSheet.visible}
        commentId={threadSheet.commentId}
        pageId={pageId}
        platform={platform}
        onClose={() => setThreadSheet({ visible: false, commentId: null })}
      />

      <HistoryModal
        visible={historyModal.visible}
        comment={historyModal.comment}
        platform={platform}
        onClose={() => setHistoryModal({ visible: false, comment: null })}
      />
    </View>
  );
};

export default CommentsTab;