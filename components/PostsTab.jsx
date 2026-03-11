import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Plus, ThumbsUp, MessageCircle, Share2, Eye, Play } from 'lucide-react-native';
import { getPagePosts } from '@/Api/api';
import CreatePostModal from '@/components/posts/CreatePostModal';
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
  if (post.links?.length > 0 && post.links[0].link) return post.links[0].link;
  if (post.thumbnail_url) return post.thumbnail_url;
  if (post.screenshotUrl) return post.screenshotUrl;
  if (post.links?.length > 0 && post.links[0].thumbnail_url) return post.links[0].thumbnail_url;
  return null;
};

const PostCard = ({ post, pageName, platform }) => {
  const [imgError, setImgError] = useState(false);
  const avatarLetter = pageName?.charAt(0)?.toUpperCase() || 'P';
  const fromName = post.from?.name || pageName;
  const mediaUrl = getMediaUrl(post);
  const isVideo = post.post_type === 'video';
  const hasMedia = mediaUrl && !imgError;
  const message = post.message || post.caption || '';
  const truncatedMessage = message.length > 200 ? message.substring(0, 200) + '...' : message;
  const isInstagram = platform === 'instagram';

  const handleOpenPost = () => {
    if (post.permalink) Linking.openURL(post.permalink).catch(() => {});
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
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
        {/* {post.permalink && (
          <TouchableOpacity onPress={handleOpenPost} activeOpacity={0.7}>
            <Text className="text-xs font-medium" style={{ color: BRAND_COLOR }}>Open</Text>
          </TouchableOpacity>
        )} */}
      </View>

      {message.length > 0 && (
        <Text className="text-[13px] text-slate-600 leading-5 mb-3">{truncatedMessage}</Text>
      )}

      {hasMedia && (
        <TouchableOpacity onPress={handleOpenPost} activeOpacity={0.9} className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-slate-100">
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
        <TouchableOpacity onPress={handleOpenPost} activeOpacity={0.9} className="w-full h-32 rounded-lg mb-3 bg-slate-100 items-center justify-center">
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

      {!isInstagram && (
        <View className="flex-row pt-3 border-t border-slate-100">
          <View className="flex-row items-center mr-4">
            <ThumbsUp size={16} color="#64748B" />
            <Text className="text-[13px] text-slate-500 ml-1.5">{formatNumber(post.reactions ?? post.likes ?? 0)}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <MessageCircle size={16} color="#64748B" />
            <Text className="text-[13px] text-slate-500 ml-1.5">{formatNumber(post.comments_counts ?? post.number_of_comments ?? post.comments_count ?? 0)}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Share2 size={16} color="#64748B" />
            <Text className="text-[13px] text-slate-500 ml-1.5">{formatNumber(post.shares ?? 0)}</Text>
          </View>
          {isVideo && (
            <View className="flex-row items-center">
              <Eye size={16} color="#64748B" />
              <Text className="text-[13px] text-slate-500 ml-1.5">{formatNumber(post.views ?? 0)}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const PostsTab = ({ pageId, pageName, platform = 'facebook' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const perPage = 20;
  const isInstagram = platform === 'instagram';

  useEffect(() => {
    fetchPosts(1);
  }, [pageId, platform]);

  useSocketEvent(SOCKET_EVENTS.POST_ADD, (data) => {
    fetchPosts(1);
  }, [pageId]);

  useSocketEvent(SOCKET_EVENTS.POST_UPDATE, (data) => {
    fetchPosts(1);
  }, [pageId]);

  useSocketEvent(SOCKET_EVENTS.POST_DELETE, (data) => {
    setPosts((prev) => prev.filter((p) => p._id !== data._id && p.post_id !== data.post_id));
  }, [pageId]);

  const fetchPosts = async (page) => {
    if (page === 1) { setLoading(true); setError(''); }
    else setLoadingMore(true);

    try {
      const result = await getPagePosts({ pageId, platform, page, perPage });
      if (result.success) {
        const newPosts = result.posts || [];
        if (newPosts.length > 0) {
      console.log('First post fields:', JSON.stringify(newPosts[0], null, 2));
    }
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
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchPosts(currentPage + 1);
  };

  const handlePostCreated = () => fetchPosts(1);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND_COLOR} />
        <Text className="text-slate-500 text-sm mt-3">Loading posts...</Text>
      </View>
    );
  }

  if (error && posts.length === 0) {
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
          onPostCreated={handlePostCreated}
        />
      ) : (
        <CreatePostModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          pageId={pageId}
          onPostCreated={handlePostCreated}
        />
      )}

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
        <PostCard key={post._id || post.post_id} post={post} pageName={pageName} platform={platform} />
      ))}

      {hasMore && posts.length > 0 && (
        <TouchableOpacity
          onPress={handleLoadMore}
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
    </View>
  );
};

export default PostsTab;