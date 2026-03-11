import { Stack } from "expo-router";
import "../global.css";
import { SocketProvider } from '@/contexts/SocketContext';

export default function RootLayout() {
  return <SocketProvider>
    <Stack>
    <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        /> 
        <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />    
        <Stack.Screen
          name="tabs"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tabs/(social)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tabs/details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="pages"
          options={{ headerShown: false }}
        />
  </Stack>
  </SocketProvider>;
}
