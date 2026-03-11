import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [companyFocused, setCompanyFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Scroll to focused input on Android
  const handleInputFocus = (inputRef, setFocused) => {
    setFocused(true);
    
    // On Android, scroll to the input after a short delay
    if (Platform.OS === 'android') {
      setTimeout(() => {
        inputRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 100,
              animated: true,
            });
          },
          () => {}
        );
      }, 300);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: Platform.OS === 'android' && keyboardVisible ? 150 : 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable 
            className="flex-1" 
            onPress={dismissKeyboard}
          >
            <View className="flex-1 justify-center px-6 py-8">
              {/* Auth Card Container */}
              <View className="w-full max-w-sm self-center">
                {/* Logo Section */}
                <View className="items-center mb-8">
                  <Text className="text-3xl font-bold text-[#1E40AF] mb-2 tracking-tight">
                    EPSILON
                  </Text>
                  <Text className="text-gray-500 text-sm font-normal">
                    Create your account
                  </Text>
                </View>

                {/* Form Section */}
                <View>
                  {/* Full Name Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </Text>
                    <TextInput
                      ref={nameRef}
                      className={`w-full px-4 py-3 border rounded-lg text-sm text-black bg-white
                        ${nameFocused ? 'border-[#1E40AF]' : 'border-gray-200'}`}
                      placeholder="Your name"
                      placeholderTextColor="#94A3B8"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      blurOnSubmit={false}
                      onFocus={() => handleInputFocus(nameRef, setNameFocused)}
                      onBlur={() => setNameFocused(false)}
                    />
                  </View>

                  {/* Email Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </Text>
                    <TextInput
                      ref={emailRef}
                      className={`w-full px-4 py-3 border rounded-lg text-sm text-black bg-white
                        ${emailFocused ? 'border-[#1E40AF]' : 'border-gray-200'}`}
                      placeholder="your@email.com"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => companyRef.current?.focus()}
                      blurOnSubmit={false}
                      onFocus={() => handleInputFocus(emailRef, setEmailFocused)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>

                  {/* Company Name Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </Text>
                    <TextInput
                      ref={companyRef}
                      className={`w-full px-4 py-3 border rounded-lg text-sm text-black bg-white
                        ${companyFocused ? 'border-[#1E40AF]' : 'border-gray-200'}`}
                      placeholder="Your company"
                      placeholderTextColor="#94A3B8"
                      value={companyName}
                      onChangeText={setCompanyName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                      onFocus={() => handleInputFocus(companyRef, setCompanyFocused)}
                      onBlur={() => setCompanyFocused(false)}
                    />
                  </View>

                  {/* Password Input */}
                  <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Password
                    </Text>
                    <TextInput
                      ref={passwordRef}
                      className={`w-full px-4 py-3 border rounded-lg text-sm text-black bg-white
                        ${passwordFocused ? 'border-[#1E40AF]' : 'border-gray-200'}`}
                      placeholder="Create a password"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      returnKeyType="done"
                      onSubmitEditing={dismissKeyboard}
                      onFocus={() => handleInputFocus(passwordRef, setPasswordFocused)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    className="w-full py-3.5 bg-[#1E40AF] rounded-lg mb-3 active:bg-[#1E3A8A]"
                    activeOpacity={0.8}
                    onPress={() => {
                      dismissKeyboard();
                      router.push('/tabs/manage');
                    }}
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      Create Account
                    </Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="flex-row items-center my-5">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="px-3 text-gray-400 text-sm">or</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                  </View>

                  {/* Back to Login Button */}
                  <TouchableOpacity
                    className="w-full py-3.5 bg-white border border-gray-200 rounded-lg active:bg-gray-50"
                    activeOpacity={0.8}
                    onPress={() => {
                      dismissKeyboard();
                      router.back();
                    }}
                  >
                    <Text className="text-gray-600 text-center font-medium text-base">
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;