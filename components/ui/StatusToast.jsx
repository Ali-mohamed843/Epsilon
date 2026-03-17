import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';

const StatusToast = ({ visible, type = 'success', message = '', duration = 2500, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 9999,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        className="flex-row items-center px-4 py-3 rounded-xl"
        style={{
          backgroundColor: isSuccess ? '#F0FDF4' : '#FEF2F2',
          borderWidth: 1,
          borderColor: isSuccess ? '#BBF7D0' : '#FECACA',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        {isSuccess ? (
          <CheckCircle size={20} color="#22C55E" />
        ) : (
          <XCircle size={20} color="#EF4444" />
        )}
        <Text
          className="text-sm font-medium ml-3 flex-1"
          style={{ color: isSuccess ? '#166534' : '#991B1B' }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default StatusToast;