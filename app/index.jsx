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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '@/Api/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          router.replace('/tabs/manage');
          return;
        }
      } catch {}
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const dismissKeyboard = () => Keyboard.dismiss();

  const handleInputFocus = (inputRef, setFocused) => {
    setFocused(true);
    if (Platform.OS === 'android') {
      setTimeout(() => {
        inputRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => scrollViewRef.current?.scrollTo({ y: y - 100, animated: true }),
          () => {}
        );
      }, 300);
    }
  };

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    let valid = true;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required.';
      valid = false;
    } else if (password.length < 3) {
      newErrors.password = 'Password is too short.';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    dismissKeyboard();
    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    const result = await loginUser({ email, password, remember: false, token: null });
    setLoading(false);

    if (result.success) {
      const token = result.data?.token || '';
      const userId = result.data?.user?._id || '';
      const userName = result.data?.user?.name || '';

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('user_name', userName);

      router.replace('/tabs/manage');
    } else {
      const msg = result.message?.toLowerCase() || '';
      if (msg.includes('email')) {
        setErrors((prev) => ({ ...prev, email: result.message }));
      } else if (msg.includes('password')) {
        setErrors((prev) => ({ ...prev, password: result.message }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: result.message || 'Invalid credentials. Please try again.',
        }));
      }
    }
  };

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6e226e" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
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
          <Pressable className="flex-1" onPress={dismissKeyboard}>
            <View className="flex-1 justify-center px-6 py-8">
              <View className="w-full max-w-sm self-center">

                <View className="items-center mb-10">
                  <Text style={{ color: '#6e226e' }} className="text-3xl font-bold mb-2 tracking-tight">
                    EPSILON
                  </Text>
                  <Text className="text-gray-500 text-sm font-normal">
                    Social Media Management
                  </Text>
                </View>

                {errors.general ? (
                  <View className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <Text className="text-red-600 text-sm text-center">{errors.general}</Text>
                  </View>
                ) : null}

                <View>
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                    <TextInput
                      ref={emailRef}
                      style={
                        errors.email
                          ? { borderColor: '#f87171' }
                          : emailFocused
                          ? { borderColor: '#6e226e' }
                          : { borderColor: '#e5e7eb' }
                      }
                      className="w-full px-4 py-3 border rounded-lg text-sm text-gray-800 bg-white"
                      placeholder="your@email.com"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                      onFocus={() => handleInputFocus(emailRef, setEmailFocused)}
                      onBlur={() => setEmailFocused(false)}
                    />
                    {errors.email ? (
                      <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>
                    ) : null}
                  </View>

                  <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                    <TextInput
                      ref={passwordRef}
                      style={
                        errors.password
                          ? { borderColor: '#f87171' }
                          : passwordFocused
                          ? { borderColor: '#6e226e' }
                          : { borderColor: '#e5e7eb' }
                      }
                      className="w-full px-4 py-3 border rounded-lg text-sm text-gray-800 bg-white"
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      secureTextEntry
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      onFocus={() => handleInputFocus(passwordRef, setPasswordFocused)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    {errors.password ? (
                      <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={{ backgroundColor: '#6e226e' }}
                    className="w-full py-3.5 rounded-lg mb-3"
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold text-base">
                        Sign In
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* <View className="flex-row items-center my-5">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="px-3 text-gray-400 text-sm">or</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                  </View>

                  <TouchableOpacity
                    className="w-full py-3.5 bg-white border border-gray-200 rounded-lg active:bg-gray-50"
                    activeOpacity={0.8}
                    onPress={() => {
                      dismissKeyboard();
                      router.push('/auth/Register');
                    }}
                  >
                    <Text className="text-gray-600 text-center font-medium text-base">
                      Create Account
                    </Text>
                  </TouchableOpacity>

                  <View className="mt-5 items-center">
                    <Text className="text-sm text-gray-500">
                      Forgot password?{' '}
                      <Text
                        style={{ color: '#6e226e' }}
                        className="font-medium"
                        onPress={() => {
                          dismissKeyboard();
                          console.log('Reset password');
                        }}
                      >
                        Reset here
                      </Text>
                    </Text>
                  </View> */}
                </View>
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;