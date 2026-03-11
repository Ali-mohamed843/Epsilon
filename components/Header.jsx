import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Switch,
  Pressable,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  Menu,
  X,
  User,
  Lock,
  Bell,
  DollarSign,
  HelpCircle,
  Info,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

const FacebookSvgIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

const InstagramSvgIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#E4405F">
    <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </Svg>
);

const TikTokSvgIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
    <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Svg>
);

const SnapchatSvgIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FBBF24">
    <Path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.12-.065-.18 0-.242.195-.494.456-.524 3.236-.554 4.71-3.879 4.776-3.981.091-.339.12-.569.031-.719-.195-.434-1.107-.659-1.541-.779-.121-.029-.209-.045-.314-.075-.93-.299-1.305-.689-1.29-1.093 0-.269.166-.614.493-.793.146-.076.332-.091.538-.091.12 0 .314.015.465.105.42.15.689.255 1.02.27.255 0 .405-.044.479-.104-.016-.16-.016-.317-.031-.48l-.045-.149c-.104-1.619-.229-3.645.293-4.838 1.562-3.564 4.918-3.821 5.908-3.821z" />
  </Svg>
);


const SidebarMenuItem = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  description,
  onPress,
  rightComponent,
  showArrow = true,
  customIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-3 px-3 border-b border-slate-50"
    >
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${iconBgColor}`}
      >
        {customIcon ? customIcon : <Icon size={18} color={iconColor} strokeWidth={2} />}
      </View>

      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-slate-800">
          {title}
        </Text>
        {description && (
          <Text className="text-[11px] text-slate-500 mt-0.5" numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {rightComponent
        ? rightComponent
        : showArrow && <ChevronRight size={18} color="#CBD5E1" />}
    </TouchableOpacity>
  );
};

const SidebarMenuSection = ({ title, children }) => {
  return (
    <View className="mb-4">
      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
        {title}
      </Text>
      <View className="bg-white rounded-xl mx-3 overflow-hidden border border-slate-100 shadow-sm">
        {children}
      </View>
    </View>
  );
};

const Sidebar = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isVisible) {
      const loadUserName = async () => {
        try {
          const storedName = await AsyncStorage.getItem('user_name');
          setUserName(storedName || 'User');
        } catch {
          setUserName('User');
        }
      };
      loadUserName();
    }
  }, [isVisible]);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return 'U';
    return words
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleNavigation = (route) => {
    onClose();
    setTimeout(() => {
      router.push(route);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_id', 'user_name']);
    } catch {}
    onClose();
    router.replace('/');
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 flex-row">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: fadeAnim,
          }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={{
            width: SIDEBAR_WIDTH,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className="bg-slate-50 shadow-2xl"
        >
          <View className="bg-white border-b border-slate-100 px-4 py-4 mt-8">
            <View className="flex-row items-center justify-end mb-4">
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center border-2 border-purple-100"
                style={{ backgroundColor: '#6e226e' }}
              >
                <Text className="text-white font-bold text-base">
                  {getInitials(userName)}
                </Text>
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-slate-800">
                  {userName || 'User'}
                </Text>
                <Text className="text-xs text-slate-500">View Profile</Text>
              </View>

              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            <SidebarMenuSection title="Account">
              <SidebarMenuItem
                icon={User}
                iconBgColor="bg-blue-100"
                iconColor="#1E40AF"
                title="Profile Settings"
                description="Edit your information"
              />
              <SidebarMenuItem
                icon={Lock}
                iconBgColor="bg-purple-100"
                iconColor="#7C3AED"
                title="Privacy & Security"
                description="Manage security"
              />
            </SidebarMenuSection>

            <SidebarMenuSection title="Social Platforms">
              <SidebarMenuItem
                icon={null}
                iconBgColor="bg-blue-50"
                iconColor={null}
                customIcon={<FacebookSvgIcon size={18} />}
                title="Facebook Pages"
                description="Manage Facebook"
                onPress={() => handleNavigation('/tabs/(social)/facebook')}
              />
              <SidebarMenuItem
                icon={null}
                iconBgColor="bg-pink-50"
                iconColor={null}
                customIcon={<InstagramSvgIcon size={18} />}
                title="Instagram Pages"
                description="Manage Instagram"
                onPress={() => handleNavigation('/tabs/(social)/instagram')}
              />
              <SidebarMenuItem
                icon={null}
                iconBgColor="bg-slate-100"
                iconColor={null}
                customIcon={<TikTokSvgIcon size={18} />}
                title="TikTok Pages"
                description="Manage TikTok"
                onPress={() => handleNavigation('/tabs/(social)/tiktok')}
              />
              <SidebarMenuItem
                icon={null}
                iconBgColor="bg-amber-50"
                iconColor={null}
                customIcon={<SnapchatSvgIcon size={18} />}
                title="Snapchat Pages"
                description="Manage Snapchat"
                onPress={() => handleNavigation('/tabs/(social)/snapchat')}
              />
            </SidebarMenuSection>

            <SidebarMenuSection title="Support">
              <SidebarMenuItem
                icon={HelpCircle}
                iconBgColor="bg-slate-100"
                iconColor="#64748B"
                title="Customer Support"
                onPress={() => handleNavigation('/pages/help')}
              />
              <SidebarMenuItem
                icon={Info}
                iconBgColor="bg-slate-100"
                iconColor="#64748B"
                title="About Epsilon"
              />
              <SidebarMenuItem
                icon={FileText}
                iconBgColor="bg-slate-100"
                iconColor="#64748B"
                title="Terms & Privacy"
              />
            </SidebarMenuSection>

            <View className="px-3 mt-2">
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.7}
                className="w-full py-3.5 bg-red-50 border border-red-100 rounded-xl flex-row items-center justify-center"
              >
                <LogOut size={18} color="#DC2626" strokeWidth={2} />
                <Text className="ml-2 text-[14px] font-semibold text-red-600">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const Header = ({ title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <View className="bg-white px-5 py-4 mt-3 flex-row justify-between items-center border-b border-slate-200">
        <Text
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#6e226e' }}
        >
          {title || 'EPSILON'}
        </Text>
        <TouchableOpacity
          onPress={openSidebar}
          className="w-10 h-10 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Menu size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <Sidebar isVisible={isSidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Header;