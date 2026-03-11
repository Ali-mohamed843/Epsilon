import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Header from '@/components/Header';

const BRAND = '#6e226e';

const FacebookIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#1877F2">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

const InstagramIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#E4405F">
    <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </Svg>
);

const TikTokIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#000000">
    <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Svg>
);

const SnapchatIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FBBF24">
    <Path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.12-.065-.18 0-.242.195-.494.456-.524 3.236-.554 4.71-3.879 4.776-3.981.091-.339.12-.569.031-.719-.195-.434-1.107-.659-1.541-.779-.121-.029-.209-.045-.314-.075-.93-.299-1.305-.689-1.29-1.093 0-.269.166-.614.493-.793.146-.076.332-.091.538-.091.12 0 .314.015.465.105.42.15.689.255 1.02.27.255 0 .405-.044.479-.104-.016-.16-.016-.317-.031-.48l-.045-.149c-.104-1.619-.229-3.645.293-4.838 1.562-3.564 4.918-3.821 5.908-3.821z" />
  </Svg>
);

const ChevronIcon = ({ color = '#CBD5E1' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
    <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </Svg>
);

const PlatformCard = ({ platform, isPressed, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
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
    <View className="flex-row items-center flex-1">
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center mr-3.5 ${platform.iconBgColor}`}
        style={isPressed ? { backgroundColor: '#6e226e10' } : {}}
      >
        <platform.icon />
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] font-semibold mb-1"
          style={{ color: isPressed ? BRAND : '#1e293b' }}
        >
          {platform.name}
        </Text>
      </View>
    </View>
    <ChevronIcon color={isPressed ? BRAND : '#CBD5E1'} />
  </TouchableOpacity>
);


const PlatformSelectionScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const [pressedId, setPressedId] = useState(null);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook Pages',
      status: 'Connected',
      icon: FacebookIcon,
      iconBgColor: 'bg-blue-50',
      route: '/tabs/(social)/facebook',
    },
    {
      id: 'instagram',
      name: 'Instagram Pages',
      status: 'Connected',
      icon: InstagramIcon,
      iconBgColor: 'bg-pink-50',
      route: '/tabs/(social)/instagram',
    },
    {
      id: 'tiktok',
      name: 'TikTok Pages',
      status: 'Connected',
      icon: TikTokIcon,
      iconBgColor: 'bg-slate-100',
      route: '/tabs/(social)/tiktok',
    },
    {
      id: 'snapchat',
      name: 'Snapchat Pages',
      status: 'Connected',
      icon: SnapchatIcon,
      iconBgColor: 'bg-amber-50',
      route: '/tabs/(social)/snapchat',
    },
  ];

  const handlePlatformPress = (platform) => {
    setPressedId(platform.id);
    setTimeout(() => {
      router.push(platform.route);
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
                Social Platforms
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
            <Text className="text-lg font-semibold text-slate-800 mb-5">
              Social Platforms
            </Text>

            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                isPressed={pressedId === platform.id}
                onPress={() => handlePlatformPress(platform)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlatformSelectionScreen;