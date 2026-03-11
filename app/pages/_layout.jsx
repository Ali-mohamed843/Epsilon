import { Stack } from 'expo-router';
import React from 'react';

export default function tabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="message" />
    </Stack>
  );
}