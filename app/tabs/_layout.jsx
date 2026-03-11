// app/tabs/_layout.jsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutGrid,
  Users,
  FileText,
} from 'lucide-react-native';

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-white border-t border-slate-200"
      style={{
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingTop: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        // Skip rendering if href is null (hidden tabs) or if it's a group folder
        if (options.href === null || route.name === '(social)' || route.name === 'details') {
          return null;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Get icon based on route name
        const getIcon = () => {
          const iconColor = isFocused ? '#6e226e' : '#94A3B8';
          const iconSize = 24;
          const strokeWidth = 2;

          switch (route.name) {
            case 'manage':
              return <LayoutGrid size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            case 'team':
              return <Users size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            case 'roles':
              return <FileText size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            default:
              return <LayoutGrid size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center gap-1"
          >
            {getIcon()}
            <Text
  style={{ color: isFocused ? '#6e226e' : '#94A3B8' }} // ← changed
  className="text-[11px] font-medium"
>
  {label}
</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// Main Layout Component
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="manage"
        options={{
          title: 'manage',
          tabBarLabel: 'Manage',
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'team',
          tabBarLabel: 'Team',
        }}
      />
      <Tabs.Screen
        name="roles"
        options={{
          title: 'roles',
          tabBarLabel: 'Roles',
        }}
      />
      
      {/* Hidden folders */}
      <Tabs.Screen
        name="(social)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}