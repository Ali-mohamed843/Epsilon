import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { X, ChevronDown, Send } from 'lucide-react-native';
import { getInquiryTypes, getSavedReplies } from '@/Api/api';

const BRAND = '#6e226e';

const REPLY_TYPES = [
  { key: 'reply', label: 'Reply' },
  { key: 'private', label: 'Private Message' },
];

const Dropdown = ({ label, value, options, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.key === value);

  return (
    <View className="mb-3">
      <Text className="text-xs font-medium text-slate-500 mb-1">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50"
      >
        <Text className={`text-sm ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color="#94A3B8" />
      </TouchableOpacity>
      {open && (
        <View
          className="border border-slate-200 rounded-lg mt-1 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {options.length === 0 ? (
            <View className="px-3 py-3">
              <Text className="text-sm text-slate-400">No options</Text>
            </View>
          ) : (
            options.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => { onSelect(opt.key); setOpen(false); }}
                activeOpacity={0.7}
                className="px-3 py-2.5"
                style={{
                  borderBottomWidth: i < options.length - 1 ? 1 : 0,
                  borderBottomColor: '#F1F5F9',
                  backgroundColor: value === opt.key ? '#F5F3FF' : 'transparent',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: value === opt.key ? BRAND : '#334155' }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const ReplyModal = ({ visible, onClose, comment, pageId, platform = 'instagram' }) => {
  const [replyText, setReplyText] = useState('');
  const [replyType, setReplyType] = useState('reply');
  const [inquiryType, setInquiryType] = useState(null);
  const [savedReply, setSavedReply] = useState(null);
  const [inquiryTypes, setInquiryTypes] = useState([]);
  const [savedReplies, setSavedReplies] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingData(true);

    const [inquiryResult, repliesResult] = await Promise.all([
      getInquiryTypes(),
      getSavedReplies({ pageId, platform }),
    ]);

    if (inquiryResult.success) {
      setInquiryTypes(inquiryResult.inquiryTypes);
    }

    if (repliesResult.success) {
      setSavedReplies(repliesResult.replies);
    }

    setLoadingData(false);
  }, [pageId, platform]);

  useEffect(() => {
    if (visible) {
      setReplyText('');
      setReplyType('reply');
      setInquiryType(null);
      setSavedReply(null);
      fetchData();
    }
  }, [visible]);

  const handleSavedReplySelect = (key) => {
    setSavedReply(key);
    const found = savedReplies.find(r => r._id === key);
    if (found?.text) {
      setReplyText(found.text);
    }
  };

  const handleSubmit = async () => {
    if (!replyText.trim()) {
      Alert.alert('Empty Reply', 'Please type a reply.');
      return;
    }

    setSubmitting(true);

    console.log('=== Reply Submit ===');
    console.log('Comment ID:', comment?.comment_id);
    console.log('Reply Type:', replyType);
    console.log('Reply Text:', replyText);
    console.log('Inquiry Type:', inquiryType);
    console.log('Platform:', platform);
    console.log('Page ID:', pageId);

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Reply', 'Reply API will be connected.');
      onClose();
    }, 500);
  };

  const inquiryOptions = inquiryTypes.map(t => ({ key: t._id, label: t.name }));
  const savedReplyOptions = savedReplies.map(r => ({ key: r._id, label: r.name ?? r.text?.substring(0, 40) ?? 'Saved Reply' }));

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View
          className="bg-white rounded-2xl w-[92%]"
          style={{ maxHeight: '85%' }}
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <View>
              <Text className="text-lg font-bold text-slate-800">Reply</Text>
              <Text className="text-xs text-slate-500">{comment?.from?.name ?? 'Unknown'}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : (
            <ScrollView className="px-4 pb-4" keyboardShouldPersistTaps="handled">
              <View className="mt-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Text className="text-xs text-slate-500 mb-1">Original Comment</Text>
                <Text className="text-sm text-slate-700">{comment?.message ?? ''}</Text>
              </View>

              <Dropdown
                label="Reply Type"
                value={replyType}
                options={REPLY_TYPES}
                onSelect={setReplyType}
                placeholder="Select type"
              />

              <Dropdown
                label="Saved Replies"
                value={savedReply}
                options={savedReplyOptions}
                onSelect={handleSavedReplySelect}
                placeholder="Select saved reply"
              />

              <Dropdown
                label="Inquiry Type"
                value={inquiryType}
                options={inquiryOptions}
                onSelect={setInquiryType}
                placeholder="Select inquiry type"
              />

              <View className="mb-4">
                <Text className="text-xs font-medium text-slate-500 mb-1">Reply</Text>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Type your reply..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm text-slate-800"
                  style={{ minHeight: 100 }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!replyText.trim() || submitting}
                activeOpacity={0.8}
                className="flex-row items-center justify-center py-3 rounded-xl mb-4"
                style={{
                  backgroundColor: replyText.trim() ? BRAND : '#CBD5E1',
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={16} color="#fff" />
                    <Text className="text-white text-sm font-semibold ml-2">
                      {replyType === 'private' ? 'Send Private Message' : 'Send Reply'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReplyModal;