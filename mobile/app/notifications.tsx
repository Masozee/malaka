import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { IconSvgElement } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  InformationCircleIcon,
  Calendar01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { notificationsApi } from '@/services/api';
import { useAppStore } from '@/stores/appStore';

const notificationTypeConfig: Record<string, { icon: IconSvgElement }> = {
  approval: { icon: CheckmarkCircle01Icon },
  alert: { icon: Alert01Icon },
  info: { icon: InformationCircleIcon },
  hr: { icon: Calendar01Icon },
  message: { icon: Mail01Icon },
};

interface NotificationGroup {
  section: string;
  items: any[];
}

function groupByDate(items: any[]): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  for (const item of items) {
    const date = new Date(item.created_at || item.timestamp || '');
    if (date >= today) groups['Today'].push(item);
    else if (date >= yesterday) groups['Yesterday'].push(item);
    else if (date >= weekAgo) groups['This Week'].push(item);
    else groups['Earlier'].push(item);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([section, items]) => ({ section, items }));
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchCounts = useAppStore((s) => s.fetchCounts);

  const unreadCount = notifications
    .flatMap((s) => s.items)
    .filter((n) => !n.read && !n.is_read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list({ limit: 50, include_read: true });
      const items = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(items) ? items : [];
      setNotifications(groupByDate(list));
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications().finally(() => setLoading(false));
  }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((section) => ({
          ...section,
          items: section.items.map((item) => ({ ...item, read: true, is_read: true })),
        }))
      );
      fetchCounts();
    } catch {
      // Ignore
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    await fetchCounts();
    setRefreshing(false);
  }, [loadNotifications, fetchCounts]);

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: Spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ ...Typography.h3, color: colors.foreground }}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ ...Typography.caption, color: colors.primary }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={{ padding: Spacing.xxxl, alignItems: 'center' }}>
              <Text style={{ ...Typography.body, color: colors.tertiaryText }}>
                No notifications yet
              </Text>
            </View>
          ) : (
            notifications.map((section) => (
              <View key={section.section}>
                {/* Section Header */}
                <View
                  style={{
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      ...Typography.overline,
                      color: colors.secondaryText,
                    }}
                  >
                    {section.section}
                  </Text>
                </View>

                {/* Notification Items */}
                {section.items.map((notification) => {
                  const isRead = notification.read || notification.is_read;
                  const type = notification.type || 'info';
                  const config = notificationTypeConfig[type] || notificationTypeConfig.info;
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      activeOpacity={0.7}
                      onPress={async () => {
                        if (!isRead) {
                          try {
                            await notificationsApi.markRead(notification.id);
                            setNotifications((prev) =>
                              prev.map((s) => ({
                                ...s,
                                items: s.items.map((item) =>
                                  item.id === notification.id
                                    ? { ...item, read: true, is_read: true }
                                    : item
                                ),
                              }))
                            );
                            fetchCounts();
                          } catch {}
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        paddingHorizontal: Spacing.lg,
                        paddingVertical: Spacing.md,
                        gap: Spacing.md,
                        backgroundColor: isRead ? 'transparent' : `${colors.primary}05`,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                      }}
                    >
                      {/* Icon */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: BorderRadius.md,
                          backgroundColor: colors.muted,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HugeiconsIcon icon={config.icon} size={20} color={colors.secondaryText} />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Text
                            style={{
                              ...Typography.bodyMedium,
                              color: colors.foreground,
                              flex: 1,
                              fontFamily: isRead
                                ? 'NotoSans_500Medium'
                                : 'NotoSans_700Bold',
                            }}
                            numberOfLines={1}
                          >
                            {notification.title}
                          </Text>
                          <Text
                            style={{
                              ...Typography.caption,
                              color: colors.tertiaryText,
                              fontSize: 11,
                              marginLeft: 8,
                            }}
                          >
                            {formatTimestamp(notification.created_at || notification.timestamp || '')}
                          </Text>
                        </View>
                        <Text
                          style={{
                            ...Typography.caption,
                            color: colors.secondaryText,
                            marginTop: 2,
                          }}
                          numberOfLines={2}
                        >
                          {notification.body || notification.message || ''}
                        </Text>
                      </View>

                      {/* Unread dot */}
                      {!isRead && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                            marginTop: 6,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
