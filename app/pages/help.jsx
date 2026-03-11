// app/help.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Send, 
  Search, 
  MessageCircle, 
  HelpCircle,
  User,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';

const HelpPage = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Welcome to our site, if you need help simply reply to this message, we are online and ready to help.',
      timestamp: 'now',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: message,
        timestamp: 'now',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: messages.length + 2,
          sender: 'support',
          text: 'Thank you for your message. Our team will get back to you shortly.',
          timestamp: 'now',
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 1000);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Chat Screen
  if (showChat) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
          <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>
            {isTablet && (
              <View className="items-center py-4 bg-slate-50">
                <Text className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Customer Support Chat
                </Text>
              </View>
            )}

            {/* Header */}
            <View className="bg-white mt-6 px-5 py-4 flex-row items-center border-b border-slate-200">
              <TouchableOpacity
                onPress={() => setShowChat(false)}
                className="mr-4"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              <Text className="text-xl font-semibold text-slate-800 flex-1">
                Customer Support
              </Text>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              <ScrollView className="flex-1 bg-slate-50 px-5 py-6">
                <Text className="text-center text-xs text-slate-400 mb-6">
                  Customer Support
                </Text>

                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    className={`mb-4 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <View className="flex-row items-start max-w-[80%]">
                      {msg.sender === 'support' && (
                        <View className="w-8 h-8 bg-blue-100 rounded-full mr-2 items-center justify-center">
                          <User size={16} color="#1E40AF" />
                        </View>
                      )}
                      <View
                        className={`px-4 py-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-blue-600'
                            : 'bg-white border border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-[15px] leading-5 ${
                            msg.sender === 'user' ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Input Area */}
              <View 
                className="bg-white border-t border-slate-200 px-5 py-4"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
              >
                <View className="flex-row items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message..."
                    placeholderTextColor="#94A3B8"
                    className="flex-1 text-[15px] text-slate-800 py-2"
                    multiline
                    maxHeight={100}
                  />
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    className={`ml-2 w-9 h-9 rounded-lg items-center justify-center ${
                      message.trim() ? 'bg-blue-600' : 'bg-blue-300'
                    }`}
                    disabled={!message.trim()}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main Help Screen
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className={`flex-1 ${isLargeScreen ? 'items-center' : ''}`}>
        <View className={`flex-1 bg-white ${isLargeScreen ? 'max-w-lg w-full shadow-xl' : 'w-full'}`}>
          {isTablet && (
            <View className="items-center py-4 bg-slate-50">
              <Text className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Help & Support
              </Text>
            </View>
          )}

          {/* Header */}
          <Header title="EPSILON" />

          {/* Content */}
          <ScrollView
            className="flex-1 bg-slate-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 24 : 20,
              paddingTop: 24,
              paddingBottom: 40,
            }}
          >
            {/* Welcome Section with Back Arrow */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                {/* Back Arrow */}
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.7}
                  className="mr-3 -ml-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>
                
                {/* Title */}
                <Text className="text-2xl font-bold text-slate-800">
                  Hi there 👋
                </Text>
              </View>
              
              <Text className="text-[15px] text-slate-600 leading-6 ml-8">
                Need help? Search our help center for answers or start a conversation with our support team.
              </Text>
            </View>

            {/* Help Center Card */}
            <View className="bg-white rounded-xl p-5 mb-4 border border-slate-200 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                  <HelpCircle size={20} color="#1E40AF" strokeWidth={2} />
                </View>
                <Text className="text-lg font-semibold text-slate-800">
                  Help Center
                </Text>
              </View>
              
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-slate-50 rounded-lg px-4 py-3.5 flex-row items-center border border-slate-200"
              >
                <Search size={18} color="#64748B" strokeWidth={2} />
                <Text className="ml-3 text-slate-500 text-[15px]">
                  Search for answers
                </Text>
              </TouchableOpacity>
            </View>

            {/* Start Conversation Card */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowChat(true)}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm active:border-blue-600"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                  <MessageCircle size={20} color="#059669" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-800 mb-0.5">
                    New Conversation
                  </Text>
                  <Text className="text-sm text-slate-500">
                    We typically reply in a few minutes
                  </Text>
                </View>
                <Send size={20} color="#1E40AF" strokeWidth={2} />
              </View>
            </TouchableOpacity>

            {/* Recent Conversations */}
            <View className="mt-8">
              <Text className="text-lg font-semibold text-slate-800 mb-4">
                Recent Conversations
              </Text>
              
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowChat(true)}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-medium text-slate-500">
                    Customer Support
                  </Text>
                  <Text className="text-xs text-slate-400">now</Text>
                </View>
                <Text className="text-[15px] text-slate-700" numberOfLines={2}>
                  Welcome to our site, if you need help simply reply to this message...
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HelpPage;