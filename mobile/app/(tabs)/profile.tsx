import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { IconSvgElement } from '@hugeicons/react-native';
import {
  Clock01Icon,
  Calendar01Icon,
  Chart02Icon,
  PlusSignIcon,
  FileAttachmentIcon,
  Folder01Icon,
  UserGroupIcon,
  BookOpen01Icon,
  StarIcon,
  Notification01Icon,
  Moon01Icon,
  GlobeIcon,
  InformationCircleIcon,
  ArrowRight01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

interface MenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: IconSvgElement;
  route?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

const attendanceMenu: MenuItem[] = [
  {
    id: 'clock',
    label: 'Clock In/Out',
    subtitle: 'Not clocked in today',
    icon: Clock01Icon,
    route: '/attendance',
    badge: 'Active',
    badgeVariant: 'success',
  },
  {
    id: 'history',
    label: 'Attendance History',
    icon: Calendar01Icon,
    route: '/attendance',
  },
];

const leaveMenu: MenuItem[] = [
  {
    id: 'balance',
    label: 'Leave Balance',
    subtitle: '12 days remaining',
    icon: Chart02Icon,
    route: '/leave-request',
  },
  {
    id: 'request',
    label: 'Submit Leave Request',
    icon: PlusSignIcon,
    route: '/leave-request',
  },
  {
    id: 'my-leaves',
    label: 'My Leave Requests',
    icon: FileAttachmentIcon,
    route: '/leave-request',
  },
];

const payrollMenu: MenuItem[] = [
  {
    id: 'current',
    label: 'Current Payslip',
    subtitle: 'January 2026',
    icon: FileAttachmentIcon,
    route: '/payslip',
  },
  {
    id: 'payroll-history',
    label: 'Payslip History',
    icon: Folder01Icon,
    route: '/payslip',
  },
];

const othersMenu: MenuItem[] = [
  { id: 'directory', label: 'Employee Directory', icon: UserGroupIcon },
  { id: 'training', label: 'Training Schedule', icon: BookOpen01Icon },
  { id: 'performance', label: 'Performance Review', icon: StarIcon },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayRole = user?.role || 'Employee';
  const displayEmail = user?.email || '';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <View style={{ gap: Spacing.sm }}>
      <Text
        style={{
          ...Typography.overline,
          color: colors.secondaryText,
          paddingHorizontal: Spacing.xs,
        }}
      >
        {title}
      </Text>
      <Card padding="none">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => item.route && router.push(item.route as any)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md,
              gap: Spacing.md,
              ...(index < items.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }),
            }}
          >
            <HugeiconsIcon icon={item.icon} size={20} color={colors.secondaryText} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...Typography.bodyMedium,
                  color: colors.foreground,
                }}
              >
                {item.label}
              </Text>
              {item.subtitle && (
                <Text
                  style={{
                    ...Typography.caption,
                    color: colors.secondaryText,
                  }}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>
            {item.badge && (
              <Badge label={item.badge} variant={item.badgeVariant} size="sm" />
            )}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.tertiaryText} />
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card padding="lg">
          <View
            style={{
              alignItems: 'center',
              gap: Spacing.md,
            }}
          >
            <Avatar name={displayName} size={72} />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={{ ...Typography.h2, color: colors.foreground }}>
                {displayName}
              </Text>
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>
                {displayRole}
              </Text>
              {displayEmail ? (
                <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                  {displayEmail}
                </Text>
              ) : null}
            </View>
            <Badge label="Active" variant="success" />
          </View>
        </Card>

        {/* Attendance */}
        {renderMenuSection('ATTENDANCE', attendanceMenu)}

        {/* Leave */}
        {renderMenuSection('LEAVE', leaveMenu)}

        {/* Payroll */}
        {renderMenuSection('PAYROLL', payrollMenu)}

        {/* Others */}
        {renderMenuSection('OTHERS', othersMenu)}

        {/* Settings */}
        <View style={{ gap: Spacing.sm }}>
          <Text
            style={{
              ...Typography.overline,
              color: colors.secondaryText,
              paddingHorizontal: Spacing.xs,
            }}
          >
            SETTINGS
          </Text>
          <Card padding="none">
            {/* Notifications */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                gap: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <HugeiconsIcon icon={Notification01Icon} size={20} color={colors.secondaryText} />
              <Text style={{ flex: 1, ...Typography.bodyMedium, color: colors.foreground }}>
                Notifications
              </Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: `${colors.primary}60` }}
                thumbColor={notifications ? colors.primary : colors.tertiaryText}
              />
            </View>

            {/* Dark Mode */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                gap: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <HugeiconsIcon icon={Moon01Icon} size={20} color={colors.secondaryText} />
              <Text style={{ flex: 1, ...Typography.bodyMedium, color: colors.foreground }}>
                Dark Mode
              </Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.border, true: `${colors.primary}60` }}
                thumbColor={darkMode ? colors.primary : colors.tertiaryText}
              />
            </View>

            {/* Language */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                gap: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <HugeiconsIcon icon={GlobeIcon} size={20} color={colors.secondaryText} />
              <Text style={{ flex: 1, ...Typography.bodyMedium, color: colors.foreground }}>
                Language
              </Text>
              <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                English
              </Text>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.tertiaryText} />
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                gap: Spacing.md,
              }}
            >
              <HugeiconsIcon icon={InformationCircleIcon} size={20} color={colors.secondaryText} />
              <Text style={{ flex: 1, ...Typography.bodyMedium, color: colors.foreground }}>
                About App
              </Text>
              <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                v2.4.0
              </Text>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.tertiaryText} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.md,
          }}
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} color={colors.destructive} />
          <Text
            style={{
              ...Typography.bodyMedium,
              color: colors.destructive,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
