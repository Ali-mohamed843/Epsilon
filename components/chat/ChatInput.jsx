import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';

const BRAND = '#6e226e';

const ChatInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    await onSend(trimmed);
    setText('');
    setSending(false);
  };

  return (
    <View className="flex-row items-end px-4 py-3 bg-white border-t border-slate-200">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#94A3B8"
        multiline
        editable={!disabled && !sending}
        className="flex-1 bg-slate-50 rounded-2xl px-4 py-2.5 mr-3 text-sm text-slate-800 border border-slate-200"
        style={{ maxHeight: 100 }}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || sending || disabled}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: text.trim() ? BRAND : '#CBD5E1' }}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Send size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;