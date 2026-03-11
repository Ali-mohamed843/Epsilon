import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  RefreshCw,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getChatMessages, sendChatMessage } from '@/Api/api';

const BRAND = '#6e226e';

const formatMsgTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDateDivider = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

const DateDivider = ({ date }) => (
  <View className="items-center my-5">
    <View className="px-4 py-1.5 bg-white rounded-full border border-slate-200">
      <Text className="text-xs font-medium text-slate-500">{date}</Text>
    </View>
  </View>
);

const MessageBubble = ({ message, isSent, userPicture, platform }) => {
  const [imgErr, setImgErr] = useState(false);

  let msgText = '';
  if (message.message?.text) {
    msgText = message.message.text;
  } else if (typeof message.text === 'string' && message.text) {
    msgText = message.text;
  } else if (message.message && typeof message.message === 'string') {
    msgText = message.message;
  }

  let attachmentLabel = '';
  if (!msgText) {
    const type = message.type;
    const attachments = message.attachments || [];
    const firstAtt = attachments[0];

    if (type === 'story_mention' || firstAtt?.type === 'story_mention') {
      attachmentLabel = '📷 Story mention';
    } else if (type === 'story_reply' || firstAtt?.type === 'story_reply') {
      attachmentLabel = '📷 Story reply';
    } else if (type === 'image' || firstAtt?.type === 'image' || type === 'photo') {
      attachmentLabel = '📷 Photo';
    } else if (type === 'video' || firstAtt?.type === 'video') {
      attachmentLabel = '🎥 Video';
    } else if (type === 'audio' || firstAtt?.type === 'audio') {
      attachmentLabel = '🎵 Audio';
    } else if (type === 'share' || firstAtt?.type === 'share') {
      attachmentLabel = '🔗 Shared post';
    } else if (type === 'sticker' || firstAtt?.type === 'sticker') {
      attachmentLabel = '🏷️ Sticker';
    } else if (type === 'reel' || firstAtt?.type === 'reel') {
      attachmentLabel = '🎬 Reel';
    } else if (attachments.length > 0) {
      attachmentLabel = '📎 Attachment';
    } else if (message.story) {
      attachmentLabel = '📷 Story';
    }
  }

  const time = formatMsgTime(message.sent_at ?? message.created_at ?? message.timestamp);
  const senderName = message.sender?.name ?? '';

  return (
    <View className={`flex-row mb-4 ${isSent ? 'flex-row-reverse' : ''}`}>
      <View
        className={`w-8 h-8 rounded-full items-center justify-center overflow-hidden ${isSent ? 'ml-2.5' : 'mr-2.5'}`}
        style={{ backgroundColor: isSent ? '#6e226e20' : '#e2e8f0' }}
      >
        {!isSent && userPicture && !imgErr ? (
          <Image
            source={{ uri: userPicture }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            resizeMode="cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Text className="text-sm">{isSent ? '📤' : '👤'}</Text>
        )}
      </View>

      <View className="max-w-[75%]">
        {!isSent && senderName ? (
          <Text className="text-[10px] text-slate-400 mb-1 ml-1">{senderName}</Text>
        ) : null}

        <View
          className={`px-4 py-3 rounded-2xl ${isSent ? 'rounded-br-sm' : 'bg-white border border-slate-200 rounded-bl-sm'}`}
          style={isSent ? { backgroundColor: BRAND } : {}}
        >
          {msgText ? (
            <Text className={`text-sm leading-5 ${isSent ? 'text-white' : 'text-slate-800'}`}>
              {msgText}
            </Text>
          ) : attachmentLabel ? (
            <Text className={`text-sm ${isSent ? 'text-white' : 'text-slate-600'}`}>
              {attachmentLabel}
            </Text>
          ) : (
            <Text className={`text-sm italic ${isSent ? 'text-white/60' : 'text-slate-400'}`}>
              [Attachment]
            </Text>
          )}
          <Text className={`text-[11px] mt-1 ${isSent ? 'text-white/60 text-right' : 'text-slate-400'}`}>
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

const TypingIndicator = ({ isVisible }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      const animateDot = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        ).start();
      };
      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View className="flex-row mb-4">
      <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mr-2.5">
        <Text className="text-sm">👤</Text>
      </View>
      <View className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm">
        <View className="flex-row gap-1">
          {[dot1, dot2, dot3].map((dot, index) => (
            <Animated.View
              key={index}
              style={{ transform: [{ translateY: dot }] }}
              className="w-2 h-2 rounded-full bg-slate-400"
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const ChatScreen = () => {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const isLargeScreen = width >= 1024;

  const chatId = params?.chatId;
  const userName = params?.userName || 'User';
  const userPicture = params?.userPicture || '';
  const pageId = params?.pageId || '';
  const platform = params?.platform || 'facebook';
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (chatId) fetchMessages();
  }, [chatId]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');

    console.log('========================================');
    console.log('[Chat] Fetching messages');
    console.log('[Chat] chatId:', chatId);
    console.log('[Chat] platform:', platform);
    console.log('[Chat] pageId:', pageId);
    console.log('========================================');

    try {
      const result = await getChatMessages(chatId, platform);

      console.log('[Chat] Result success:', result.success);
      console.log('[Chat] Messages count:', result.messages?.length ?? 0);

      if (result.success) {
        const rawMessages = result.messages || [];

        if (rawMessages.length > 0) {
          console.log('[Chat] First message sample:', JSON.stringify(rawMessages[0]).substring(0, 300));
        }

        const sorted = rawMessages.sort((a, b) => {
          const getTime = (msg) => {
            if (msg.timestamp && typeof msg.timestamp === 'number') return msg.timestamp;
            const dateStr = msg.sent_at || msg.created_at;
            if (dateStr) return new Date(dateStr).getTime();
            return 0;
          };
          return getTime(a) - getTime(b);
        });

        setMessages(sorted);
      } else {
        setError(result.message || 'Failed to load messages');
      }
    } catch (err) {
      console.log('[Chat] Error:', err.message);
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  const isPageMessage = (msg) => {
    if (platform === 'instagram') {
      if (msg.is_echo === true) return true;

      if (msg.sender_id && msg.sender_id === pageId) return true;

      if (msg.sender?.id && msg.sender.id === pageId) return true;

      if (msg.recipient_id && msg.recipient_id !== pageId && !msg.sender_id) return true;

      return false;
    }

    if (msg.sender?.id === pageId) return true;
    if (msg.is_echo === true) return true;
    if (msg.recipient?.id && msg.recipient.id !== pageId) return true;
    return false;
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || sending) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: { id: pageId, name: 'You' },
      sender_id: pageId,
      recipient: { id: '' },
      recipient_id: '',
      message: { text },
      text: text,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      timestamp: Date.now(),
      is_echo: true,
      _sending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const result = await sendChatMessage({ chatId, pageId, platform, text });

      if (result.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, _sending: false, _sent: true } : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, _sending: false, _failed: true } : m
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, _sending: false, _failed: true } : m
        )
      );
    }

    setSending(false);
  };

  const buildMessageList = () => {
    const items = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = msg.sent_at ?? msg.created_at;
      if (!isSameDay(lastDate, msgDate)) {
        items.push({ type: 'date', date: formatDateDivider(msgDate), key: `date_${msgDate}` });
        lastDate = msgDate;
      }
      items.push({ type: 'message', data: msg, key: msg._id || msg.mid || `msg_${Math.random()}` });
    });

    return items;
  };

  const messageList = buildMessageList();

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
          <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>

            <View className="bg-white px-4 py-3 flex-row items-center border-b border-slate-200">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="p-2 -ml-2 mr-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color="#64748B" />
              </TouchableOpacity>

              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 overflow-hidden">
                  {userPicture && !imgErr ? (
                    <Image
                      source={{ uri: userPicture }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                      resizeMode="cover"
                      onError={() => setImgErr(true)}
                    />
                  ) : (
                    <Text className="text-lg">👤</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-800" numberOfLines={1}>
                    {userName}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {platform === 'instagram' ? 'Instagram' : 'Facebook'} • {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={fetchMessages}
                activeOpacity={0.7}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: '#6e226e10' }}
              >
                <RefreshCw size={18} color={BRAND} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={BRAND} />
                <Text className="text-slate-500 text-sm mt-3">Loading messages...</Text>
              </View>
            ) : error && messages.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <Text className="text-red-500 text-base font-medium text-center mb-2">Failed to load messages</Text>
                <Text className="text-slate-400 text-sm text-center mb-4">{error}</Text>
                <TouchableOpacity onPress={fetchMessages} activeOpacity={0.7} className="px-6 py-2.5 rounded-lg" style={{ backgroundColor: BRAND }}>
                  <Text className="text-white text-sm font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 bg-slate-50"
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messageList.map((item) => {
                  if (item.type === 'date') {
                    return <DateDivider key={item.key} date={item.date} />;
                  }

                  const msg = item.data;
                  const isSent = isPageMessage(msg);

                  return (
                    <View key={item.key}>
                      <MessageBubble
                        message={msg}
                        isSent={isSent}
                        userPicture={userPicture}
                        platform={platform}
                      />
                      {msg._sending && (
                        <Text className={`text-[10px] text-slate-400 mb-2 ${isSent ? 'text-right mr-11' : 'ml-11'}`}>
                          Sending...
                        </Text>
                      )}
                      {msg._failed && (
                        <Text className={`text-[10px] text-red-400 mb-2 ${isSent ? 'text-right mr-11' : 'ml-11'}`}>
                          Failed to send
                        </Text>
                      )}
                    </View>
                  );
                })}

                {messages.length === 0 && (
                  <View className="items-center justify-center py-20">
                    <Text className="text-4xl mb-4">💬</Text>
                    <Text className="text-slate-400 text-base">No messages yet</Text>
                    <Text className="text-slate-400 text-sm mt-1">Start the conversation!</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View
              className="bg-white border-t border-slate-200 px-4 py-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <View className="flex-row items-end gap-2">
                <View className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 px-4 min-h-[42px] max-h-[100px] justify-center">
                  <TextInput
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    className="text-sm text-slate-800"
                    style={{ textAlignVertical: 'center', maxHeight: 80 }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSendMessage}
                  activeOpacity={0.7}
                  disabled={!inputMessage.trim() || sending}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: inputMessage.trim() && !sending ? BRAND : `${BRAND}50`,
                  }}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Send size={18} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;