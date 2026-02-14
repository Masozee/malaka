import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home08Icon,
  DashboardSquare01Icon,
  QrCodeIcon,
  Message01Icon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/theme';
import { CountBadge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/appStore';

export default function TabLayout() {
  const { colors } = useTheme();
  const unreadMessages = useAppStore((s) => s.unreadMessages);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 130 : 82,
          paddingBottom: Platform.OS === 'ios' ? 56 : 18,
          paddingTop: 8,
          ...Shadows.bottomNav,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'NotoSans_500Medium',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Home08Icon} size={22} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Apps',
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={DashboardSquare01Icon} size={22} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -18,
                ...Shadows.button,
              }}
            >
              <HugeiconsIcon icon={QrCodeIcon} size={24} strokeWidth={1.5} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <View>
              <HugeiconsIcon icon={Message01Icon} size={22} strokeWidth={1.5} color={color} />
              {unreadMessages > 0 && (
                <CountBadge
                  count={unreadMessages}
                  style={{ position: 'absolute', top: -4, right: -10 }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={UserCircleIcon} size={22} strokeWidth={1.5} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
