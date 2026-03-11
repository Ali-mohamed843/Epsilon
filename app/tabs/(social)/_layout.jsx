// app/(social)/_layout.jsx
import { Stack } from 'expo-router';

export default function SocialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="facebook" />
      <Stack.Screen name="instagram" />
      <Stack.Screen name="tiktok" />
      <Stack.Screen name="snapchat" />
    </Stack>
  );
}