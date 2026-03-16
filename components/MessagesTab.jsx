import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { getPageChats } from '@/Api/api';
import useSocketEvent from '@/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '@/contexts/SocketContext';

const BRAND = '#6e226e';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getChatUserName = (chat, platform) => {
  if (platform === 'instagram') {
    return chat.user?.name || chat.user?.username || 'Unknown User';
  }
  return chat.messenger_user_id?.name ?? 'Unknown User';
};

const getChatUserPicture = (chat, platform) => {
  if (platform === 'instagram') {
    return chat.user?.profile_pic || null;
  }
  const pic = chat.messenger_user_id?.picture;
  if (!pic) return null;
  if (typeof pic === 'string') return pic;
  return pic.data?.url ?? pic.url ?? null;
};

const getChatLastMessage = (chat, platform) => {
  if (platform === 'instagram') {
    const latest = chat.latest_message;
    if (!latest) return '';
    const text = latest.message?.text || latest.text || '';
    if (text) return text;
    if (latest.type === 'story_mention') return '📷 Story mention';
    if (latest.type === 'story_reply') return '📷 Story reply';
    if (latest.type === 'image' || latest.type === 'photo') return '📷 Photo';
    if (latest.type === 'video') return '🎥 Video';
    if (latest.type === 'audio') return '🎵 Audio';
    if (latest.type === 'sticker') return '🏷️ Sticker';
    if (latest.type === 'share') return '🔗 Shared post';
    if (latest.attachments?.length > 0) {
      const att = latest.attachments[0];
      if (att.type === 'story_mention') return '📷 Story mention';
      if (att.type === 'image') return '📷 Photo';
      if (att.type === 'video') return '🎥 Video';
      return '📎 Attachment';
    }
    return '[Media]';
  }
  return chat.last_message || '';
};

const getChatLastMessageTime = (chat, platform) => {
  if (platform === 'instagram') {
    return chat.latest_message?.sent_at
      || chat.latest_message?.created_at
      || chat.updated_at
      || chat.created_at
      || '';
  }
  return chat.last_message_at ?? chat.created_at ?? '';
};

const getChatIsDone = (chat, platform) => {
  return chat.is_done ?? false;
};

const getChatSeenByAgent = (chat, platform) => {
  if (platform === 'instagram') {
    return chat.seenByAgent ?? true;
  }
  return chat.seenByAgent ?? false;
};

const getChatRecipientId = (chat, platform) => {
  if (platform === 'instagram') {
    return chat.user?.id || chat.ig_user_id || '';
  }
  return chat.messenger_user_id?.psid || chat.messenger_user_id?._id || chat.psid || '';
};

const FilterTab = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-1 py-2.5 rounded-lg ${isActive ? '' : 'bg-white border border-slate-200'}`}
    style={isActive ? { backgroundColor: BRAND } : {}}
  >
    <Text className={`text-sm font-medium text-center ${isActive ? 'text-white' : 'text-slate-500'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const MessageCard = ({ chat, onPress, platform }) => {
  const [imgErr, setImgErr] = useState(false);
  const userName = getChatUserName(chat, platform);
  const userPic = getChatUserPicture(chat, platform);
  const lastMsg = getChatLastMessage(chat, platform);
  const lastMsgTime = formatTime(getChatLastMessageTime(chat, platform));
  const isDone = getChatIsDone(chat, platform);
  const seenByAgent = getChatSeenByAgent(chat, platform);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 mb-3 border border-slate-200"
    >
      <View className="flex-row">
        <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mr-3 overflow-hidden">
          {userPic && !imgErr ? (
            <Image
              source={{ uri: userPic }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              resizeMode="cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <Text className="text-xl">👤</Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-semibold text-slate-800 flex-1 mr-2" numberOfLines={1}>
              {userName}
            </Text>
            <View className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: isDone ? '#10B981' : '#EF4444' }}
              />
              {!seenByAgent && (
                <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: BRAND }} />
              )}
            </View>
          </View>

          <Text className="text-sm text-slate-500 mb-1.5" numberOfLines={1}>
            {lastMsg}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-slate-400">{lastMsgTime}</Text>
            <View className="flex-row items-center">
              {isDone ? (
                <View className="px-2 py-0.5 rounded-full bg-green-50 mr-1">
                  <Text className="text-[10px] text-green-600 font-medium">Done</Text>
                </View>
              ) : (
                <View className="px-2 py-0.5 rounded-full bg-amber-50">
                  <Text className="text-[10px] text-amber-600 font-medium">Pending</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MessagesTab = ({ pageId, pageName, platform = 'facebook', onRegisterRefresh }) => {
  const [repliedFilter, setRepliedFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const isFetching = useRef(false);

  const fetchChats = useCallback(async (page = 1, reset = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (page === 1) { setLoading(true); setError(''); }
    else setLoadingMore(true);

    try {
      const result = await getPageChats({ pageId, platform, page });

      if (result.success) {
        const newChats = result.chats || [];
        if (reset || page === 1) {
          setChats(newChats);
        } else {
          setChats((prev) => [...prev, ...newChats]);
        }
        setCurrentPage(page);
        setTotalPages(result.pageInfo?.totalPages ?? 1);
      } else {
        if (page === 1) setError(result.message || 'Failed to load chats');
      }
    } catch (err) {
      if (page === 1) setError(err.message);
    }

    setLoading(false);
    setLoadingMore(false);
    isFetching.current = false;
  }, [pageId, platform]);

  useEffect(() => {
    fetchChats(1, true);
  }, [pageId, platform]);

  useEffect(() => {
    if (onRegisterRefresh) {
      onRegisterRefresh(() => fetchChats(1, true));
    }
  }, [onRegisterRefresh, fetchChats]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // useSocketEvent(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
  // if (!data) return;
  // fetchChats(1, true);
  // }, [pageId]);

  // useSocketEvent(SOCKET_EVENTS.IG_NEW_MESSAGE, (data) => {
  //   if (!data) return;
  //   if (platform !== 'instagram') return;
  //   fetchChats(1, true);
  // }, [pageId, platform]);

  useSocketEvent(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
  if (!data) return;
  const chatId = data.chat_id || data.chatId || data.conversation_id;
  if (!chatId) return;

  setChats(prev => {
    const existingIndex = prev.findIndex(c => c._id === chatId);

    if (existingIndex >= 0) {
      const updated = [...prev];
      const chat = { ...updated[existingIndex] };
      chat.last_message = data.message?.text || data.text || chat.last_message;
      chat.last_message_at = data.sent_at || data.created_at || new Date().toISOString();
      chat.seenByAgent = false;
      updated.splice(existingIndex, 1);
      return [chat, ...updated];
    }

    return prev;
  });
}, [pageId]);

useSocketEvent(SOCKET_EVENTS.IG_NEW_MESSAGE, (data) => {
  if (!data) return;
  if (platform !== 'instagram') return;
  const chatId = data.chat_id || data.chatId || data.conversation_id;
  if (!chatId) return;

  setChats(prev => {
    const existingIndex = prev.findIndex(c => c._id === chatId);

    if (existingIndex >= 0) {
      const updated = [...prev];
      const chat = { ...updated[existingIndex] };
      chat.latest_message = {
        text: data.message?.text || data.text || '',
        sent_at: data.sent_at || data.created_at || new Date().toISOString(),
      };
      chat.seenByAgent = false;
      updated.splice(existingIndex, 1);
      return [chat, ...updated];
    }

    return prev;
  });
}, [pageId, platform]);

  const filteredChats = chats.filter((chat) => {
    const isDone = getChatIsDone(chat, platform);

    if (repliedFilter === 'replied' && !isDone) return false;
    if (repliedFilter === 'not_replied' && isDone) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = getChatUserName(chat, platform).toLowerCase();
      const msg = getChatLastMessage(chat, platform).toLowerCase();
      if (!name.includes(q) && !msg.includes(q)) return false;
    }

    return true;
  });

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages && !isFetching.current) {
      fetchChats(currentPage + 1);
    }
  };

  const handleChatPress = (chat) => {
    const chatPageId = platform === 'instagram'
      ? (chat.page_id || pageId)
      : pageId;

    router.push({
      pathname: '/pages/message',
      params: {
        chatId: chat._id,
        userName: getChatUserName(chat, platform),
        userPicture: getChatUserPicture(chat, platform) || '',
        pageId: chatPageId,
        platform: platform,
        recipientId: getChatRecipientId(chat, platform),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="text-slate-500 text-sm mt-3">Loading messages...</Text>
      </View>
    );
  }

  if (error && chats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load messages</Text>
        <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={() => fetchChats(1, true)} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}>
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
        <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-2 mb-3 border border-slate-200">
          <Search size={18} color="#94A3B8" />
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search by name or message..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-sm text-slate-800"
          />
        </View>

        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</Text>
        <View className="flex-row gap-2">
          <FilterTab title="All" isActive={repliedFilter === 'all'} onPress={() => setRepliedFilter('all')} />
          <FilterTab title="Done" isActive={repliedFilter === 'replied'} onPress={() => setRepliedFilter('replied')} />
          <FilterTab title="Pending" isActive={repliedFilter === 'not_replied'} onPress={() => setRepliedFilter('not_replied')} />
        </View>
      </View>

      {filteredChats.length > 0 && (
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-xs text-slate-400">
            Showing {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {filteredChats.map((chat) => (
        <MessageCard
          key={chat._id}
          chat={chat}
          platform={platform}
          onPress={() => handleChatPress(chat)}
        />
      ))}

      {currentPage < totalPages && (
        <TouchableOpacity
          onPress={handleLoadMore}
          activeOpacity={0.7}
          className="w-full py-3 rounded-lg items-center justify-center mb-4"
          style={{ backgroundColor: '#6e226e12' }}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color={BRAND} />
          ) : (
            <Text className="text-sm font-semibold" style={{ color: BRAND }}>Load More Messages</Text>
          )}
        </TouchableOpacity>
      )}

      {filteredChats.length === 0 && !loading && (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-4xl mb-4">📩</Text>
          <Text className="text-slate-400 text-base">No messages found</Text>
          <Text className="text-slate-400 text-sm mt-1">Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
};

export default MessagesTab;