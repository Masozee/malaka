import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { IconSvgElement } from '@hugeicons/react-native';
import {
  CheckmarkSquare02Icon,
  ShoppingCart01Icon,
  Package01Icon,
  TruckDeliveryIcon,
  Invoice01Icon,
  Dollar01Icon,
  Wallet01Icon,
  BankIcon,
  UserGroupIcon,
  Calendar01Icon,
  Clock01Icon,
  Briefcase01Icon,
  Factory01Icon,
  Store01Icon,
  Analytics01Icon,
  BarChartIcon,
  Settings01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spacing, Typography } from '@/constants/theme';

interface AppMenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: IconSvgElement;
  route?: string;
  badge?: string;
}

interface AppCategory {
  title: string;
  description: string;
  items: AppMenuItem[];
}

const appCategories: AppCategory[] = [
  {
    title: 'Approvals & Tasks',
    description: 'Review and approve pending requests',
    items: [
      { id: 'approvals', label: 'Approval Center', subtitle: '5 pending requests', icon: CheckmarkSquare02Icon, route: '/approvals', badge: '5' },
    ],
  },
  {
    title: 'Procurement',
    description: 'Purchase requests, orders, and suppliers',
    items: [
      { id: 'purchase-request', label: 'Purchase Requests', subtitle: 'Create and track PR', icon: ShoppingCart01Icon },
      { id: 'purchase-order', label: 'Purchase Orders', subtitle: 'Manage PO lifecycle', icon: Invoice01Icon },
      { id: 'suppliers', label: 'Suppliers', subtitle: 'Supplier directory', icon: TruckDeliveryIcon },
    ],
  },
  {
    title: 'Inventory',
    description: 'Stock levels, transfers, and warehouse ops',
    items: [
      { id: 'stock', label: 'Stock Overview', subtitle: 'Current stock levels', icon: Package01Icon },
      { id: 'goods-receipt', label: 'Goods Receipt', subtitle: 'Receive incoming goods', icon: Store01Icon },
      { id: 'stock-transfer', label: 'Stock Transfer', subtitle: 'Between warehouses', icon: TruckDeliveryIcon },
    ],
  },
  {
    title: 'Finance',
    description: 'Payments, invoices, and cash management',
    items: [
      { id: 'invoices', label: 'Invoices', subtitle: 'AR & AP invoices', icon: Invoice01Icon },
      { id: 'payments', label: 'Payments', subtitle: 'Payment processing', icon: Dollar01Icon },
      { id: 'cash-bank', label: 'Cash & Bank', subtitle: 'Cash position overview', icon: Wallet01Icon },
      { id: 'budgeting', label: 'Budgeting', subtitle: 'Budget tracking', icon: BankIcon },
    ],
  },
  {
    title: 'Human Resources',
    description: 'Attendance, leave, and employee management',
    items: [
      { id: 'attendance', label: 'Attendance', subtitle: 'Clock in/out', icon: Clock01Icon, route: '/attendance' },
      { id: 'leave', label: 'Leave Requests', subtitle: 'Apply for leave', icon: Calendar01Icon, route: '/leave-request' },
      { id: 'payslip', label: 'Payslip', subtitle: 'View salary details', icon: Briefcase01Icon, route: '/payslip' },
      { id: 'directory', label: 'Employee Directory', subtitle: 'Find colleagues', icon: UserGroupIcon },
    ],
  },
  {
    title: 'Production',
    description: 'Manufacturing and production planning',
    items: [
      { id: 'production-plan', label: 'Production Plan', subtitle: 'Plan and schedule', icon: Factory01Icon },
      { id: 'work-orders', label: 'Work Orders', subtitle: 'Track production', icon: Settings01Icon },
    ],
  },
  {
    title: 'Reports & Analytics',
    description: 'Dashboards, reports, and insights',
    items: [
      { id: 'dashboard', label: 'Dashboard', subtitle: 'Business overview', icon: Analytics01Icon },
      { id: 'reports', label: 'Reports', subtitle: 'Generate reports', icon: BarChartIcon },
    ],
  },
];

export default function AppsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ ...Typography.h2, color: colors.foreground }}>
          Apps
        </Text>
        <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
          All modules and features
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {appCategories.map((category) => (
          <View key={category.title} style={{ gap: Spacing.sm }}>
            <View>
              <Text style={{ ...Typography.h3, color: colors.foreground }}>
                {category.title}
              </Text>
              <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
                {category.description}
              </Text>
            </View>
            <Card padding="none">
              {category.items.map((item, index) => (
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
                    ...(index < category.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    }),
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: colors.muted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} color={colors.secondaryText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                      {item.label}
                    </Text>
                    <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                      {item.subtitle}
                    </Text>
                  </View>
                  {item.badge && (
                    <Badge label={item.badge} variant="destructive" size="sm" />
                  )}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} color={colors.tertiaryText} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
