import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, ChevronRight, User } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '@/components/Header';
import { getInstagramPages } from '@/Api/api';

const BRAND = '#6e226e';

const PageCard = ({ page, isPressed, onPress }) => {
  const [imgError, setImgError] = useState(false);

  const pictureUrl = typeof page.picture === 'string'
    ? page.picture
    : page.picture?.url ?? null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 mb-3"
      style={{
        borderWidth: 1.5,
        borderColor: isPressed ? BRAND : '#e2e8f0',
        shadowColor: isPressed ? BRAND : 'transparent',
        shadowOffset: { width: 0, height: isPressed ? 2 : 0 },
        shadowOpacity: isPressed ? 0.15 : 0,
        shadowRadius: isPressed ? 8 : 0,
        elevation: isPressed ? 4 : 0,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="w-14 h-14 rounded-xl items-center justify-center mr-3.5 overflow-hidden"
            style={{ backgroundColor: isPressed ? '#6e226e10' : '#f1f5f9' }}
          >
            {pictureUrl && !imgError ? (
              <Image
                source={{ uri: pictureUrl }}
                style={{ width: 56, height: 56 }}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <User size={24} color={isPressed ? BRAND : '#64748B'} strokeWidth={2} />
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-[15px] font-semibold"
              style={{ color: isPressed ? BRAND : '#1e293b' }}
              numberOfLines={1}
            >
              {page.name}
            </Text>
            {page.username ? (
              <Text
                className="text-xs mt-0.5"
                style={{ color: isPressed ? '#6e226e90' : '#94A3B8' }}
              >
                @{page.username}
              </Text>
            ) : null}
          </View>
        </View>
        <ChevronRight size={20} color={isPressed ? BRAND : '#CBD5E1'} />
      </View>
    </TouchableOpacity>
  );
};

const InstagramPagesScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pressedId, setPressedId] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError('');
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('User not found. Please log in again.');

        const result = await getInstagramPages(userId);
        if (result.success) {
          setPages(result.pages);
        } else {
          setError(result.message || 'Something went wrong.');
        }
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      }
      setLoading(false);
    };
    fetchPages();
  }, []);

  const handlePagePress = (page) => {
    setPressedId(page._id);
    setTimeout(() => {
      router.push({
        pathname: '/tabs/details/page-details',
        params: {
          pageId: page.igid,
          pageName: page.name,
          mongoId: page._id,
          platform: 'instagram',
          picture: typeof page.picture === 'string' ? page.picture : page.picture?.url,
        },
      });
    }, 150);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
        <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>
          {isTablet && (
            <View className="items-center py-4 bg-slate-50">
              <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: BRAND }}>
                Instagram Pages
              </Text>
            </View>
          )}

          <Header />

          <ScrollView
            className="flex-1 bg-slate-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 24 : 20,
              paddingTop: 24,
              paddingBottom: 40,
            }}
          >
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => router.push('/tabs/manage')}
                activeOpacity={0.7}
                className="p-1 -ml-1 mr-3"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              <Text className="text-2xl font-semibold text-slate-800">Instagram Pages</Text>
            </View>

            {loading && (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color={BRAND} />
                <Text className="text-slate-500 text-sm mt-3">Loading pages...</Text>
              </View>
            )}

            {!loading && error ? (
              <View className="items-center justify-center py-20 px-6">
                <Text className="text-red-500 text-base font-medium text-center mb-2">
                  Failed to load pages
                </Text>
                <Text className="text-slate-400 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {!loading && !error && pages.length === 0 && (
              <View className="items-center justify-center py-20">
                <Text className="text-slate-400 text-base">No Instagram pages found.</Text>
              </View>
            )}

            {!loading && !error && pages.map((page) => (
              <PageCard
                key={page._id}
                page={page}
                isPressed={pressedId === page._id}
                onPress={() => handlePagePress(page)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InstagramPagesScreen;