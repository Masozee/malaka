import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Notification01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  Clock01Icon,
  Search01Icon,
  ShoppingBag01Icon,
  Calendar01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { notificationsApi } from '@/services/api';
import type { PendingAction, ActivityItem } from '@/types';

const quickActions = [
  { id: '1', label: 'Clock In', route: '/attendance' },
  { id: '2', label: 'Check Stock', route: '/scan' },
  { id: '3', label: 'New Sales', route: '/sales' },
  { id: '4', label: 'Submit Leave', route: '/leave-request' },
];

const quickActionIcons: Record<string, any> = {
  'Clock In': Clock01Icon,
  'Check Stock': Search01Icon,
  'New Sales': ShoppingBag01Icon,
  'Submit Leave': Calendar01Icon,
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  const user = useAuthStore((s) => s.user);
  const { pendingApprovals, unreadMessages, unreadNotifications, fetchCounts } = useAppStore();

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const pendingActions: PendingAction[] = [
    { id: '1', label: 'Approvals Pending', count: pendingApprovals, color: '#00979D', route: '/approvals' },
    { id: '2', label: 'Unread Messages', count: unreadMessages, color: '#005FCC', route: '/messages' },
    { id: '3', label: 'Notifications', count: unreadNotifications, color: '#B45309', route: '/notifications' },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const loadData = useCallback(async () => {
    await fetchCounts();

    // Fetch recent notifications for activity feed
    try {
      const res = await notificationsApi.list({ limit: 5 });
      const items = res.data?.data ?? res.data ?? [];
      setRecentNotifications(Array.isArray(items) ? items : []);
    } catch {
      // Keep empty
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ ...Typography.h2, color: colors.foreground }}>
              {greeting}, {firstName}
            </Text>
            <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
              {formatDate()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={{ position: 'relative' }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <HugeiconsIcon icon={Notification01Icon} size={20} color={colors.foreground} />
            </View>
            {unreadNotifications > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#DC2626',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 10, color: '#FFF', fontFamily: 'NotoSans_700Bold' }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Pending Actions */}
        <View style={{ gap: Spacing.sm }}>
          <View>
            <Text style={{ ...Typography.h3, color: colors.foreground }}>
              Pending Actions
            </Text>
            <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
              Items that need your attention
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {pendingActions.map((action) => (
              <Card
                key={action.id}
                onPress={() => router.push(action.route as any)}
                padding="md"
                style={{ width: 180 }}
              >
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: 'JetBrainsMono_700Bold',
                      color: colors.foreground,
                    }}
                  >
                    {action.count}
                  </Text>
                  <Text
                    style={{
                      ...Typography.caption,
                      color: colors.secondaryText,
                    }}
                  >
                    {action.label}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* KPI Summary */}
        <View style={{ gap: Spacing.sm }}>
          <View>
            <Text style={{ ...Typography.h3, color: colors.foreground }}>
              Business Overview
            </Text>
            <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
              Key financial metrics at a glance
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Spacing.sm,
            }}
          >
            <View style={{ width: '48%' }}>
              <KPICard
                label="Cash Position"
                value="Rp 4.2B"
                change="+8.5%"
                changeType="positive"
                subtitle="vs last month"
              />
            </View>
            <View style={{ width: '48%' }}>
              <KPICard
                label="Accounts Payable"
                value="Rp 1.8B"
                change="23 overdue"
                changeType="negative"
              />
            </View>
            <View style={{ width: '48%' }}>
              <KPICard
                label="Accounts Receivable"
                value="Rp 2.1B"
                change="45 pending"
                changeType="neutral"
              />
            </View>
            <View style={{ width: '48%' }}>
              <KPICard
                label="Sales MTD"
                value="Rp 890M"
                change="+12%"
                changeType="positive"
                subtitle="vs target"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ gap: Spacing.sm }}>
          <View>
            <Text style={{ ...Typography.h3, color: colors.foreground }}>
              Quick Actions
            </Text>
            <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
              Frequently used shortcuts
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: colors.card,
                  borderRadius: BorderRadius.full,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <HugeiconsIcon
                  icon={quickActionIcons[action.label]}
                  size={16}
                  color={colors.secondaryText}
                />
                <Text
                  style={{
                    ...Typography.caption,
                    fontFamily: 'NotoSans_500Medium',
                    color: colors.foreground,
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={{ gap: Spacing.sm }}>
          <View>
            <Text style={{ ...Typography.h3, color: colors.foreground }}>
              Recent Activity
            </Text>
            <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
              Latest updates and actions
            </Text>
          </View>
          <Card padding="none">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((item: any, index: number) => (
                <View
                  key={item.id || index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.md,
                    padding: Spacing.lg,
                    ...(index < recentNotifications.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    }),
                  }}
                >
                  <HugeiconsIcon
                    icon={item.type === 'alert' ? Alert01Icon : CheckmarkCircle01Icon}
                    size={20}
                    color={colors.secondaryText}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...Typography.bodyMedium,
                        color: colors.foreground,
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        ...Typography.caption,
                        color: colors.secondaryText,
                      }}
                      numberOfLines={1}
                    >
                      {item.body || item.message || ''}
                    </Text>
                  </View>
                  <Text
                    style={{
                      ...Typography.caption,
                      color: colors.tertiaryText,
                    }}
                  >
                    {formatTimestamp(item.created_at || item.timestamp || '')}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                  No recent activity
                </Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
