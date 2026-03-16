import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { Plus, ThumbsUp, MessageCircle, Share2, Eye, Play, Pencil, Trash2, ArrowLeft } from 'lucide-react-native';
import { getPagePosts, deleteFacebookPost, getSinglePost } from '@/Api/api';
import CreatePostModal from '@/components/posts/CreatePostModal';
import EditPostModal from '@/components/posts/EditPostModal';
import CreateIgPostModal from '@/components/instagram/CreateIgPostModal';
import useSocketEvent from '@/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '@/contexts/SocketContext';

const BRAND_COLOR = '#6e226e';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
};

const getMediaUrl = (post) => {
  if (post.links?.length > 0) {
    const first = post.links[0];
    if (typeof first === 'string') return first;
    if (first?.link) return first.link;
    if (first?.thumbnail_url) return first.thumbnail_url;
  }
  if (post.thumbnail_url) return post.thumbnail_url;
  if (post.screenshotUrl) return post.screenshotUrl;
  return null;
};

const PostCard = ({ post, pageName, platform, onEdit, onDelete, isDeleting }) => {
  const [imgError, setImgError] = useState(false);
  const avatarLetter = pageName?.charAt(0)?.toUpperCase() || 'P';
  const fromName = post.from?.name || pageName;
  const mediaUrl = getMediaUrl(post);
  const isVideo = post.post_type === 'video';
  const hasMedia = mediaUrl && !imgError;
  const message = post.message || post.caption || '';
  const truncatedMessage = message.length > 200 ? message.substring(0, 200) + '...' : message;
  const isFacebook = platform === 'facebook';

  const handleOpenPost = () => {
    if (post.permalink) Linking.openURL(post.permalink).catch(() => {});
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(post) },
      ]
    );
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
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
            backgroundColor: 'rgba(255,255,255,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>Deleting...</Text>
        </View>
      )}

      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-2.5" style={{ backgroundColor: '#6e226e20' }}>
          <Text style={{ color: BRAND_COLOR }} className="font-semibold text-sm">{avatarLetter}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-800 mb-0.5">{fromName}</Text>
          <View className="flex-row items-center">
            <Text className="text-[11px] text-slate-500">{formatDate(post.created_time)}</Text>
            {post.post_type && (
              <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#6e226e15' }}>
                <Text className="text-[10px] font-medium capitalize" style={{ color: BRAND_COLOR }}>{post.post_type}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          {isFacebook && !isVideo && (
            <TouchableOpacity onPress={() => onEdit(post)} activeOpacity={0.7} disabled={isDeleting} className="p-2 mr-1">
              <Pencil size={16} color={BRAND_COLOR} />
            </TouchableOpacity>
          )}
          {isFacebook && (
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} disabled={isDeleting} className="p-2 mr-1">
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {message.length > 0 && (
        <Text className="text-[13px] text-slate-600 leading-5 mb-3">{truncatedMessage}</Text>
      )}

      {hasMedia && (
        <TouchableOpacity onPress={handleOpenPost} activeOpacity={0.9} disabled={isDeleting} className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-slate-100">
          <Image source={{ uri: mediaUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" onError={() => setImgError(true)} />
          {isVideo && (
            <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
              <View className="w-14 h-14 rounded-full bg-white/90 items-center justify-center">
                <Play size={24} color={BRAND_COLOR} fill={BRAND_COLOR} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}

      {!hasMedia && post.post_type && (
        <TouchableOpacity onPress={handleOpenPost} activeOpacity={0.9} disabled={isDeleting} className="w-full h-32 rounded-lg mb-3 bg-slate-100 items-center justify-center">
          {isVideo ? (
            <>
              <Play size={32} color="#94A3B8" />
              <Text className="text-slate-400 text-xs mt-2">Video post</Text>
            </>
          ) : (
            <Text className="text-slate-400 text-xs">{post.post_type} post</Text>
          )}
        </TouchableOpacity>
      )}

      {platform !== 'instagram' && (
        <View className="px-4 py-3">
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-5">
              <ThumbsUp size={18} color="#334155" />
              <Text className="text-[13px] font-semibold text-slate-700 ml-1.5">
                {formatNumber(post.reactions ?? post.likes ?? 0)}
              </Text>
            </View>
            <View className="flex-row items-center mr-5">
              <MessageCircle size={18} color="#334155" />
              <Text className="text-[13px] font-semibold text-slate-700 ml-1.5">
                {formatNumber(post.comments_counts ?? post.number_of_comments ?? post.comments_count ?? 0)}
              </Text>
            </View>
            <View className="flex-row items-center mr-5">
              <Share2 size={18} color="#334155" />
              <Text className="text-[13px] font-semibold text-slate-700 ml-1.5">
                {formatNumber(post.shares ?? 0)}
              </Text>
            </View>
            {isVideo && (
              <View className="flex-row items-center">
                <Eye size={18} color="#334155" />
                <Text className="text-[13px] font-semibold text-slate-700 ml-1.5">
                  {formatNumber(post.views ?? 0)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const PostsTab = ({ pageId, pageName, platform = 'facebook', onRegisterRefresh, focusPostId, onClearFocus }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [focusedPost, setFocusedPost] = useState(null);
  const [focusLoading, setFocusLoading] = useState(false);
  const [focusError, setFocusError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const perPage = 20;
  const isInstagram = platform === 'instagram';
  const isFocused = !!focusPostId;

  const fetchPosts = useCallback(async (page) => {
    if (page === 1) { setLoading(true); setError(''); }
    else setLoadingMore(true);

    try {
      const result = await getPagePosts({ pageId, platform, page, perPage });
      if (result.success) {
        const newPosts = result.posts || [];
        if (page === 1) setPosts(newPosts);
        else setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(newPosts.length >= perPage);
        setCurrentPage(page);
      } else {
        if (page === 1) setError(result.message || 'Failed to load posts');
      }
    } catch (err) {
      if (page === 1) setError(err.message || 'Something went wrong');
    }

    setLoading(false);
    setLoadingMore(false);
  }, [pageId, platform]);

  const fetchSinglePost = useCallback(async (postId) => {
    setFocusLoading(true);
    setFocusError(null);
    setFocusedPost(null);

    const result = await getSinglePost({ postId, platform });

    setFocusLoading(false);

    if (result.success && result.post) {
      setFocusedPost(result.post);
    } else {
      setFocusError(result.message || 'Post not found');
    }
  }, [platform]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (focusPostId) {
      fetchSinglePost(focusPostId);
    } else {
      setFocusedPost(null);
      setFocusError(null);
    }
  }, [focusPostId]);

  useEffect(() => {
    if (onRegisterRefresh) {
      onRegisterRefresh(() => fetchPosts(1));
    }
  }, [onRegisterRefresh, fetchPosts]);

  useSocketEvent(SOCKET_EVENTS.POST_ADD, (data) => {
    if (data?.page_id !== pageId) return;
    setPosts(prev => {
      const exists = prev.some(p => p._id === data._id || p.post_id === data.post_id);
      if (exists) return prev;
      return [data, ...prev];
    });
  }, [pageId]);

  useSocketEvent(SOCKET_EVENTS.POST_UPDATE, (data) => {
    if (data?.page_id !== pageId) return;
    setPosts(prev => prev.map(p =>
      (p._id === data._id || p.post_id === data.post_id) ? { ...p, ...data } : p
    ));
  }, [pageId]);

  useSocketEvent(SOCKET_EVENTS.POST_DELETE, (data) => {
    if (!data) return;
    setPosts(prev => prev.filter(p => p._id !== data._id && p.post_id !== data.post_id));
  }, [pageId]);

  const handleDelete = async (post) => {
    setDeletingPostId(post.post_id);
    const result = await deleteFacebookPost({ pageId, postId: post.post_id });
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.post_id !== post.post_id));
      if (isFocused) onClearFocus?.();
    } else {
      Alert.alert('Error', result.message || 'Failed to delete post');
    }
    setDeletingPostId(null);
  };

  if (!isFocused && loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND_COLOR} />
        <Text className="text-slate-500 text-sm mt-3">Loading posts...</Text>
      </View>
    );
  }

  if (!isFocused && error && posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load posts</Text>
        <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={() => fetchPosts(1)} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND_COLOR }}>
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {isInstagram ? (
        <CreateIgPostModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          pageId={pageId}
          onPostCreated={() => fetchPosts(1)}
        />
      ) : (
        <CreatePostModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          pageId={pageId}
          onPostCreated={() => fetchPosts(1)}
        />
      )}

      <EditPostModal
        visible={!!editingPost}
        onClose={() => setEditingPost(null)}
        pageId={pageId}
        post={editingPost}
        onPostUpdated={() => { setEditingPost(null); fetchPosts(1); }}
      />

      {isFocused ? (
        <>
          <TouchableOpacity
            onPress={onClearFocus}
            activeOpacity={0.7}
            className="flex-row items-center mb-4 py-2"
          >
            <ArrowLeft size={18} color={BRAND_COLOR} />
            <Text className="text-sm font-semibold ml-2" style={{ color: BRAND_COLOR }}>Back to all posts</Text>
          </TouchableOpacity>

          {focusLoading && (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={BRAND_COLOR} />
              <Text className="text-slate-500 text-sm mt-3">Loading post...</Text>
            </View>
          )}

          {focusError && !focusLoading && (
            <View className="items-center py-10">
              <Text className="text-red-500 text-base mb-2">Failed to load post</Text>
              <Text className="text-slate-400 text-xs mb-4">{focusError}</Text>
              <TouchableOpacity
                onPress={onClearFocus}
                activeOpacity={0.7}
                className="px-6 py-2.5 rounded-lg"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Text className="text-white text-sm font-semibold">View All Posts</Text>
              </TouchableOpacity>
            </View>
          )}

          {focusedPost && !focusLoading && (
            <PostCard
              post={focusedPost}
              pageName={pageName}
              platform={platform}
              onEdit={setEditingPost}
              onDelete={handleDelete}
              isDeleting={deletingPostId === focusedPost.post_id}
            />
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
            className="w-full py-3 rounded-lg flex-row items-center justify-center mb-4"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <Plus size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-white text-sm font-semibold ml-2">Add New Post</Text>
          </TouchableOpacity>

          {posts.map((post) => (
            <PostCard
              key={post._id || post.post_id}
              post={post}
              pageName={pageName}
              platform={platform}
              onEdit={setEditingPost}
              onDelete={handleDelete}
              isDeleting={deletingPostId === post.post_id}
            />
          ))}

          {hasMore && posts.length > 0 && (
            <TouchableOpacity
              onPress={() => { if (!loadingMore && hasMore) fetchPosts(currentPage + 1); }}
              activeOpacity={0.7}
              className="w-full py-3 rounded-lg items-center justify-center mb-4"
              style={{ backgroundColor: '#6e226e12' }}
              disabled={loadingMore}
            >
              {loadingMore
                ? <ActivityIndicator size="small" color={BRAND_COLOR} />
                : <Text className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>Load More Posts</Text>
              }
            </TouchableOpacity>
          )}

          {posts.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-slate-400 text-base">No posts yet</Text>
              <Text className="text-slate-400 text-sm mt-1">Create your first post!</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default PostsTab;