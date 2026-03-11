import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import PostTypeDropdown from './PostTypeDropdown';
import MediaPicker from './MediaPicker';
import { createFacebookPost } from '@/Api/api';

const BRAND_COLOR = '#6e226e';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CreatePostModal = ({ visible, onClose, pageId, onPostCreated }) => {
  const [postType, setPostType] = useState('status');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setPostType('status');
    setMessage('');
    setFile(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleTypeChange = (type) => {
    setPostType(type);
    setFile(null);
  };

  const canSubmit = () => {
    if (postType === 'status') return message.trim().length > 0;
    if (postType === 'image') return file !== null;
    if (postType === 'video') return file !== null;
    return false;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setLoading(true);

    try {
      const result = await createFacebookPost({
        pageId,
        type: postType,
        message: message.trim() || undefined,
        file: file || undefined,
      });

      setLoading(false);

      if (result.success) {
        Alert.alert('Success', 'Post has been created successfully!');
        resetForm();
        onClose();
        if (onPostCreated) onPostCreated();
      } else {
        Alert.alert('Error', result.message || 'Unknown error occurred');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1 bg-black/50 items-center justify-center px-5"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          className="w-full bg-white rounded-2xl overflow-hidden"
          style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-800">Create New Post</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} disabled={loading}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 py-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PostTypeDropdown selectedType={postType} onSelect={handleTypeChange} />

            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">
                {postType === 'status' ? 'Status Text' : 'Caption (optional)'}
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={
                  postType === 'status'
                    ? "What's on your mind?"
                    : 'Write a caption...'
                }
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-800"
                style={{ backgroundColor: '#f8fafc', minHeight: 90 }}
              />
            </View>

            {(postType === 'image' || postType === 'video') && (
              <MediaPicker
                type={postType}
                file={file}
                onFilePicked={setFile}
                onRemove={() => setFile(null)}
              />
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!canSubmit() || loading}
              className="w-full py-3.5 rounded-lg items-center justify-center mb-4"
              style={{
                backgroundColor: canSubmit() && !loading ? BRAND_COLOR : '#d1d5db',
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-sm font-bold">Publish Post</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CreatePostModal;