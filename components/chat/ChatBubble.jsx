import React from 'react';
import { View, Text, Image } from 'react-native';

const BRAND = '#6e226e';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const ChatBubble = ({ message, isPage, userName, userPicture }) => {
  const text = message.message || message.text || message.content || '';
  const time = formatTime(message.created_time || message.created_at || message.timestamp);
  const hasAttachment = message.attachments?.length > 0;
  const attachmentType = hasAttachment ? message.attachments[0]?.type : null;
  const attachmentUrl = hasAttachment ? (message.attachments[0]?.payload?.url || message.attachments[0]?.url) : null;

  if (isPage) {
    return (
      <View className="flex-row justify-end mb-3 pl-12">
        <View>
          <View className="rounded-2xl rounded-br-md px-4 py-2.5" style={{ backgroundColor: BRAND, maxWidth: 280 }}>
            {hasAttachment && attachmentType === 'image' && attachmentUrl && (
              <Image
                source={{ uri: attachmentUrl }}
                style={{ width: 200, height: 150, borderRadius: 8, marginBottom: text ? 8 : 0 }}
                resizeMode="cover"
              />
            )}
            {hasAttachment && attachmentType !== 'image' && (
              <Text className="text-white text-xs mb-1">📎 Attachment</Text>
            )}
            {text.length > 0 && (
              <Text className="text-white text-sm leading-5">{text}</Text>
            )}
          </View>
          <Text className="text-[10px] text-slate-400 mt-1 text-right">{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row mb-3 pr-12">
      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-2 overflow-hidden mt-1">
        {userPicture ? (
          <Image source={{ uri: userPicture }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        ) : (
          <Text className="text-sm">👤</Text>
        )}
      </View>
      <View>
        <Text className="text-[10px] text-slate-500 mb-1">{userName}</Text>
        <View className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-2.5" style={{ maxWidth: 280 }}>
          {hasAttachment && attachmentType === 'image' && attachmentUrl && (
            <Image
              source={{ uri: attachmentUrl }}
              style={{ width: 200, height: 150, borderRadius: 8, marginBottom: text ? 8 : 0 }}
              resizeMode="cover"
            />
          )}
          {hasAttachment && attachmentType !== 'image' && (
            <Text className="text-slate-600 text-xs mb-1">📎 Attachment</Text>
          )}
          {text.length > 0 && (
            <Text className="text-slate-800 text-sm leading-5">{text}</Text>
          )}
        </View>
        <Text className="text-[10px] text-slate-400 mt-1">{time}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;