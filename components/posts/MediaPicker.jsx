import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { ImagePlus, VideoIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const BRAND_COLOR = '#6e226e';

const MediaPicker = ({ type, file, onFilePicked, onRemove }) => {
  const isVideo = type === 'video';

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: isVideo ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 300,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileExtension = uri.split('.').pop().toLowerCase();
      let mimeType;
      if (isVideo) {
        mimeType = fileExtension === 'mov' ? 'video/quicktime' : 'video/mp4';
      } else {
        const mimeMap = { png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
        mimeType = mimeMap[fileExtension] || 'image/jpeg';
      }

      onFilePicked({
        uri: uri,
        mimeType: mimeType,
        fileName: asset.fileName || `upload_${Date.now()}.${fileExtension}`,
      });
    }
  };

  if (file) {
    return (
      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-700 mb-1.5">
          {isVideo ? 'Selected Video' : 'Selected Image'}
        </Text>
        <View className="relative rounded-lg overflow-hidden border border-slate-200">
          {!isVideo ? (
            <Image
              source={{ uri: file.uri }}
              style={{ width: '100%', height: 180 }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full items-center justify-center bg-slate-100"
              style={{ height: 180 }}
            >
              <VideoIcon size={36} color="#94A3B8" />
              <Text className="text-slate-500 text-xs mt-2 px-4" numberOfLines={1}>
                {file.fileName}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onRemove}
            activeOpacity={0.7}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 items-center justify-center"
          >
            <X size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">
        {isVideo ? 'Add Video' : 'Add Image'}
      </Text>
      <TouchableOpacity
        onPress={pickMedia}
        activeOpacity={0.7}
        className="w-full rounded-lg border-2 border-dashed border-slate-300 items-center justify-center bg-slate-50"
        style={{ height: 130 }}
      >
        {isVideo ? (
          <VideoIcon size={28} color="#94A3B8" />
        ) : (
          <ImagePlus size={28} color="#94A3B8" />
        )}
        <Text className="text-slate-400 text-sm mt-2">
          Tap to select {isVideo ? 'a video' : 'an image'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MediaPicker;