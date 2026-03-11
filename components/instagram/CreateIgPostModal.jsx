import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import IgPostTypeDropdown from './IgPostTypeDropdown';
import IgMediaPicker from './IgMediaPicker';
import IgCarouselPicker from './IgCarouselPicker';
import { createInstagramPost } from '@/Api/api';

const BRAND = '#6e226e';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TYPE_CONFIG = {
  post:     { needsImage: true,  needsVideo: false, needsCarousel: false, label: 'Image' },
  story:    { needsImage: true,  needsVideo: true,  needsCarousel: false, label: 'Image or Video' },
  reel:     { needsImage: false, needsVideo: true,  needsCarousel: false, label: 'Video' },
  carousel: { needsImage: false, needsVideo: false, needsCarousel: true,  label: 'Multiple Media' },
};

const CreateIgPostModal = ({ visible, onClose, pageId, onPostCreated }) => {
  const [postType, setPostType] = useState('post');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [carouselFiles, setCarouselFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const config = TYPE_CONFIG[postType];

  const resetForm = () => {
    setPostType('post');
    setMessage('');
    setFile(null);
    setCarouselFiles([]);
  };

  const handleClose = () => {
    if (!loading) { resetForm(); onClose(); }
  };

  const handleTypeChange = (type) => {
    setPostType(type);
    setFile(null);
    setCarouselFiles([]);
  };

  const canSubmit = () => {
    if (postType === 'carousel') return carouselFiles.length >= 2;
    if (postType === 'story') return file !== null;
    if (postType === 'reel') return file !== null;
    if (postType === 'post') return file !== null;
    return false;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setLoading(true);
    try {
      const result = await createInstagramPost({
        pageId,
        type: postType,
        message: message.trim() || undefined,
        file: file || undefined,
        files: carouselFiles,
      });

      setLoading(false);
      if (result.success) {
        Alert.alert('Success', 'Instagram post created successfully!');
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
      <TouchableOpacity activeOpacity={1} onPress={handleClose} className="flex-1 bg-black/50 items-center justify-center px-5">
        <TouchableOpacity activeOpacity={1} onPress={() => {}} className="w-full bg-white rounded-2xl overflow-hidden" style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}>

          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-800">Create Instagram Post</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} disabled={loading}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 py-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <IgPostTypeDropdown selectedType={postType} onSelect={handleTypeChange} />

            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Caption (optional)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Write a caption..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-800"
                style={{ backgroundColor: '#f8fafc', minHeight: 90 }}
              />
            </View>

            {config.needsCarousel && (
              <IgCarouselPicker files={carouselFiles} onFilesChange={setCarouselFiles} />
            )}

            {(config.needsImage && !config.needsVideo) && (
              <IgMediaPicker
                acceptVideo={false}
                file={file}
                onFilePicked={setFile}
                onRemove={() => setFile(null)}
                label="Image"
              />
            )}

            {config.needsVideo && !config.needsImage && (
              <IgMediaPicker
                acceptVideo={true}
                file={file}
                onFilePicked={setFile}
                onRemove={() => setFile(null)}
                label="Video"
              />
            )}

            {config.needsImage && config.needsVideo && (
              <IgMediaPicker
                acceptVideo={true}
                file={file}
                onFilePicked={setFile}
                onRemove={() => setFile(null)}
                label="Image or Video"
              />
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!canSubmit() || loading}
              className="w-full py-3.5 rounded-lg items-center justify-center mb-4"
              style={{ backgroundColor: canSubmit() && !loading ? BRAND : '#d1d5db' }}
            >
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-sm font-bold">Publish Post</Text>}
            </TouchableOpacity>
          </ScrollView>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CreateIgPostModal;