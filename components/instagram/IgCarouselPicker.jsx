import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Plus, Video, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const BRAND = '#6e226e';

const IgCarouselPicker = ({ files, onFilesChange }) => {
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Gallery permission is required.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 300,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newFiles = result.assets.map(asset => {
        const ext = asset.uri.split('.').pop().toLowerCase();
        const isVid = ['mp4', 'mov', 'avi'].includes(ext);
        return {
          uri: asset.uri,
          mimeType: isVid ? (ext === 'mov' ? 'video/quicktime' : 'video/mp4') : ({ png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/jpeg'),
          fileName: asset.fileName || `upload_${Date.now()}.${ext}`,
        };
      });
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => onFilesChange(files.filter((_, i) => i !== index));

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">Media ({files.length}/10)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {files.map((file, index) => {
            const isVid = file.mimeType?.startsWith('video');
            return (
              <View key={index} className="relative mr-2 rounded-lg overflow-hidden border border-slate-200" style={{ width: 100, height: 100 }}>
                {!isVid ? (
                  <Image source={{ uri: file.uri }} style={{ width: 100, height: 100 }} resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-slate-100">
                    <Video size={24} color="#94A3B8" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 items-center justify-center"
                >
                  <X size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })}

          {files.length < 10 && (
            <TouchableOpacity
              onPress={pickMedia}
              activeOpacity={0.7}
              className="rounded-lg border-2 border-dashed border-slate-300 items-center justify-center bg-slate-50"
              style={{ width: 100, height: 100 }}
            >
              <Plus size={24} color="#94A3B8" />
              <Text className="text-slate-400 text-xs mt-1">Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default IgCarouselPicker;