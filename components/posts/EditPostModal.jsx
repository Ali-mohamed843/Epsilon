import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { X, ImagePlus, VideoIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateFacebookPost } from '@/Api/api';

const BRAND = '#6e226e';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EditPostModal = ({ visible, onClose, pageId, post, onPostUpdated }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setMessage(post.message ?? '');
      setFile(null);
      const url = post.links?.[0]?.link ?? post.links?.[0]?.thumbnail_url ?? null;
      setExistingUrl(url);
    }
  }, [post]);

  if (!post) return null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Gallery permission is required.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: post.post_type === 'video' ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop().toLowerCase();
      const mimeType = post.post_type === 'video'
        ? (ext === 'mov' ? 'video/quicktime' : 'video/mp4')
        : ({ png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/jpeg');
      setFile({
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName || `upload_${Date.now()}.${ext}`,
      });
      setExistingUrl(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await updateFacebookPost({
      pageId,
      postId: post.post_id,
      message: message.trim() || null,
      file: file || null,
      existingUrl,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Post updated successfully!');
      onClose();
      if (onPostUpdated) onPostUpdated();
    } else {
      Alert.alert('Error', result.message || 'Failed to update post');
    }
  };

  const previewUri = file?.uri ?? existingUrl ?? null;
  const isVideo = post.post_type === 'video';
  const hasMedia = post.post_type === 'image' || post.post_type === 'video';

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
            <Text className="text-lg font-bold text-slate-800">Edit Post</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} disabled={loading}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5 py-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="What's on your mind?"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-800"
                style={{ backgroundColor: '#f8fafc', minHeight: 90 }}
              />
            </View>

            {hasMedia && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-1.5">
                  {isVideo ? 'Video' : 'Image'}
                </Text>

                {previewUri ? (
                  <View className="relative rounded-lg overflow-hidden border border-slate-200">
                    {!isVideo ? (
                      <Image
                        source={{ uri: previewUri }}
                        style={{ width: '100%', height: 180 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-full items-center justify-center bg-slate-100"
                        style={{ height: 180 }}
                      >
                        <VideoIcon size={36} color="#94A3B8" />
                        <Text className="text-slate-400 text-xs mt-2">Video selected</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={pickMedia}
                      activeOpacity={0.8}
                      className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Text className="text-white text-xs font-semibold">Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickMedia}
                    activeOpacity={0.7}
                    className="w-full rounded-lg border-2 border-dashed border-slate-300 items-center justify-center bg-slate-50"
                    style={{ height: 130 }}
                  >
                    <ImagePlus size={28} color="#94A3B8" />
                    <Text className="text-slate-400 text-sm mt-2">Tap to select media</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
              className="w-full py-3.5 rounded-lg items-center justify-center mb-4"
              style={{ backgroundColor: BRAND }}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text className="text-white text-sm font-bold">Save Changes</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default EditPostModal;