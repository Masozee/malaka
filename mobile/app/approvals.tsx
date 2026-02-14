import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FilterChip } from '@/components/ui/FilterChip';
import { Spacing, Typography } from '@/constants/theme';
import type { ApprovalItem } from '@/types';

const mockApprovals: ApprovalItem[] = [
  { id: '1', type: 'procurement', title: 'Office Supplies', referenceNumber: 'PR-2024-0089', requestor: 'Ahmad Rizky', department: 'Administration', amount: 45000000, submittedAt: '2024-02-25T10:30:00Z', status: 'pending' },
  { id: '2', type: 'finance', title: 'Travel Reimbursement', referenceNumber: 'EXP-2024-0156', requestor: 'Dewi Sartika', department: 'Sales', amount: 12500000, submittedAt: '2024-02-25T09:15:00Z', status: 'pending' },
  { id: '3', type: 'hr', title: 'Annual Leave Request', referenceNumber: 'LV-2024-0334', requestor: 'Budi Hartono', department: 'Production', submittedAt: '2024-02-24T16:00:00Z', status: 'pending' },
  { id: '4', type: 'inventory', title: 'Stock Transfer - Warehouse A to B', referenceNumber: 'TO-2024-0078', requestor: 'Siti Aminah', department: 'Warehouse', submittedAt: '2024-02-24T14:30:00Z', status: 'pending' },
  { id: '5', type: 'procurement', title: 'Raw Materials - Premium Leather', referenceNumber: 'PO-2024-0234', requestor: 'Rudi Setiawan', department: 'Procurement', amount: 180000000, submittedAt: '2024-02-24T11:00:00Z', status: 'pending' },
  { id: '6', type: 'production', title: 'Production Plan Q2 2024', referenceNumber: 'PP-2024-0012', requestor: 'Agus Wijaya', department: 'Production', submittedAt: '2024-02-23T09:00:00Z', status: 'pending' },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'finance', label: 'Finance' },
  { id: 'hr', label: 'HR' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'production', label: 'Production' },
];

export default function ApprovalListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredApprovals =
    activeFilter === 'all'
      ? mockApprovals
      : mockApprovals.filter((a) => a.type === activeFilter);

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}M`;
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
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
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={1.5} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ ...Typography.h3, color: colors.foreground }}>
            Approval Center
          </Text>
          <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
            {filteredApprovals.length} pending requests
          </Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            alignItems: 'center',
          }}
        >
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onPress={() => setActiveFilter(filter.id)}
              count={
                filter.id === 'all'
                  ? mockApprovals.length
                  : mockApprovals.filter((a) => a.type === filter.id).length
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Approval List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredApprovals.map((approval) => (
          <Card
            key={approval.id}
            onPress={() => router.push(`/approval/${approval.id}`)}
            padding="md"
          >
            <View style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge
                  label={approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                  variant="outline"
                  size="sm"
                />
                <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                  {formatDate(approval.submittedAt)}
                </Text>
              </View>
              <View>
                <Text style={{ ...Typography.bodyMedium, color: colors.foreground }} numberOfLines={1}>
                  {approval.referenceNumber} - {approval.title}
                </Text>
                <Text style={{ ...Typography.caption, color: colors.secondaryText, marginTop: 2 }}>
                  {approval.requestor} · {approval.department}
                </Text>
              </View>
              {approval.amount && (
                <Text style={{ fontSize: 16, fontFamily: 'JetBrainsMono_700Bold', color: colors.foreground }}>
                  {formatAmount(approval.amount)}
                </Text>
              )}
            </View>
          </Card>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
