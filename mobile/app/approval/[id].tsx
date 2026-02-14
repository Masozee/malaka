import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

const mockApproval = {
  id: '1',
  type: 'procurement' as const,
  referenceNumber: 'PR-2024-0089',
  title: 'Office Supplies',
  status: 'pending' as const,
  requestor: 'Ahmad Rizky',
  department: 'Administration',
  submittedAt: '2024-02-25T10:30:00Z',
  items: [
    { id: '1', name: 'A4 Paper (80gsm)', quantity: 50, unitPrice: 52000, total: 2600000, unit: 'ream' },
    { id: '2', name: 'Ballpoint Pen Box', quantity: 20, unitPrice: 35000, total: 700000, unit: 'box' },
    { id: '3', name: 'Printer Ink Cartridge', quantity: 10, unitPrice: 285000, total: 2850000, unit: 'pcs' },
    { id: '4', name: 'Stapler Heavy Duty', quantity: 5, unitPrice: 125000, total: 625000, unit: 'pcs' },
  ],
  notes: 'Quarterly office supplies replenishment for Q1 2024. Priority items include printer ink due to high print volume.',
  history: [
    { action: 'Submitted', actor: 'Ahmad Rizky', timestamp: '2024-02-25T10:30:00Z' },
    { action: 'Forwarded to Director', actor: 'Finance Dept', timestamp: '2024-02-25T11:00:00Z' },
  ],
};

export default function ApprovalDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = mockApproval.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleApprove = () => {
    Alert.alert('Approve', 'Are you sure you want to approve this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            router.back();
          }, 1000);
        },
      },
    ]);
  };

  const handleReject = () => {
    if (showRejectForm && !rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    if (!showRejectForm) {
      setShowRejectForm(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
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
        <Text style={{ ...Typography.h3, color: colors.foreground, flex: 1 }}>
          Purchase Request Detail
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PR Header Info */}
        <Card padding="lg">
          <View style={{ gap: Spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...Typography.h2,
                  color: colors.foreground,
                }}
              >
                {mockApproval.referenceNumber}
              </Text>
              <Badge label="Pending Approval" variant="warning" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Avatar name={mockApproval.requestor} size={32} />
              <View>
                <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                  {mockApproval.requestor}
                </Text>
                <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                  {mockApproval.department}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Items List */}
        <Card padding="lg">
          <Text
            style={{
              ...Typography.h3,
              color: colors.foreground,
              marginBottom: Spacing.md,
            }}
          >
            Items
          </Text>
          {mockApproval.items.map((item, index) => (
            <View
              key={item.id}
              style={{
                paddingVertical: Spacing.sm,
                ...(index < mockApproval.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    ...Typography.bodyMedium,
                    color: colors.foreground,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'JetBrainsMono_500Medium',
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  {formatCurrency(item.total)}
                </Text>
              </View>
              <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                {item.quantity} {item.unit} x {formatCurrency(item.unitPrice)}
              </Text>
            </View>
          ))}

          {/* Summary */}
          <View
            style={{
              marginTop: Spacing.md,
              paddingTop: Spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: Spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>Subtotal</Text>
              <Text style={{ ...Typography.mono, color: colors.foreground }}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>Tax (11%)</Text>
              <Text style={{ ...Typography.mono, color: colors.foreground }}>
                {formatCurrency(tax)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: Spacing.xs,
                paddingTop: Spacing.xs,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ ...Typography.h3, color: colors.foreground }}>Total</Text>
              <Text
                style={{
                  ...Typography.monoLarge,
                  color: colors.primary,
                }}
              >
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {mockApproval.notes && (
          <Card padding="lg" style={{ backgroundColor: colors.surface }}>
            <Text
              style={{
                ...Typography.h3,
                color: colors.foreground,
                marginBottom: Spacing.sm,
              }}
            >
              Notes
            </Text>
            <Text style={{ ...Typography.body, color: colors.secondaryText }}>
              {mockApproval.notes}
            </Text>
          </Card>
        )}

        {/* Approval History */}
        <Card padding="lg">
          <Text
            style={{
              ...Typography.h3,
              color: colors.foreground,
              marginBottom: Spacing.md,
            }}
          >
            Approval History
          </Text>
          {mockApproval.history.map((entry, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                gap: Spacing.md,
                paddingBottom: index < mockApproval.history.length - 1 ? Spacing.md : 0,
              }}
            >
              {/* Timeline dot and line */}
              <View style={{ alignItems: 'center', width: 20 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                    marginTop: 4,
                  }}
                />
                {index < mockApproval.history.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: colors.border,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                  {entry.action}
                </Text>
                <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                  {entry.actor} &middot;{' '}
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Reject Reason */}
        {showRejectForm && (
          <Card padding="lg">
            <Text
              style={{
                ...Typography.h3,
                color: colors.foreground,
                marginBottom: Spacing.sm,
              }}
            >
              Rejection Reason
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Please provide a reason..."
              placeholderTextColor={colors.tertiaryText}
              multiline
              numberOfLines={3}
              style={{
                ...Typography.body,
                color: colors.foreground,
                backgroundColor: colors.surface,
                borderRadius: BorderRadius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: Spacing.md,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          gap: Spacing.sm,
          padding: Spacing.lg,
          paddingBottom: Spacing.xxxl,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            title={showRejectForm ? 'Confirm Reject' : 'Reject'}
            onPress={handleReject}
            variant="outline"
            fullWidth
            loading={loading && showRejectForm}
            textStyle={{ color: colors.destructive }}
            style={{ borderColor: colors.destructive }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Approve"
            onPress={handleApprove}
            variant="primary"
            fullWidth
            loading={loading && !showRejectForm}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
