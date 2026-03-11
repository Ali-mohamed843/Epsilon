import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ImagePlus, Video, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const IgMediaPicker = ({ acceptVideo = false, file, onFilePicked, onRemove, label }) => {
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Gallery permission is required.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: acceptVideo ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 300,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop().toLowerCase();
      const mimeType = acceptVideo
        ? (ext === 'mov' ? 'video/quicktime' : 'video/mp4')
        : ({ png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/jpeg');

      onFilePicked({
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName || `upload_${Date.now()}.${ext}`,
      });
    }
  };

  if (file) {
    return (
      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
        <View className="relative rounded-lg overflow-hidden border border-slate-200">
          {!acceptVideo ? (
            <Image source={{ uri: file.uri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
          ) : (
            <View className="w-full items-center justify-center bg-slate-100" style={{ height: 180 }}>
              <Video size={36} color="#94A3B8" />
              <Text className="text-slate-500 text-xs mt-2 px-4" numberOfLines={1}>{file.fileName}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onRemove}
            activeOpacity={0.7}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 items-center justify-center"
          >
            <X size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      <TouchableOpacity
        onPress={pickMedia}
        activeOpacity={0.7}
        className="w-full rounded-lg border-2 border-dashed border-slate-300 items-center justify-center bg-slate-50"
        style={{ height: 130 }}
      >
        {acceptVideo ? <Video size={28} color="#94A3B8" /> : <ImagePlus size={28} color="#94A3B8" />}
        <Text className="text-slate-400 text-sm mt-2">Tap to select {acceptVideo ? 'a video' : 'an image'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IgMediaPicker;