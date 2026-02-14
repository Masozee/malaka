import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Download01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography } from '@/constants/theme';
import type { PayslipInfo } from '@/types';

const mockPayslip: PayslipInfo = {
  period: 'January 2026',
  earnings: [
    { label: 'Basic Salary', amount: 25000000 },
    { label: 'Overtime', amount: 3500000 },
    { label: 'Transport Allowance', amount: 1500000 },
    { label: 'Meal Allowance', amount: 1000000 },
    { label: 'Position Allowance', amount: 5000000 },
  ],
  deductions: [
    { label: 'PPh 21 (Tax)', amount: 2750000 },
    { label: 'BPJS Kesehatan', amount: 400000 },
    { label: 'BPJS Ketenagakerjaan', amount: 720000 },
    { label: 'Absence Deduction', amount: 0 },
  ],
  grossPay: 36000000,
  totalDeductions: 3870000,
  netPay: 32130000,
};

export default function PayslipScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = current
  const payslip = mockPayslip;

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const months = ['January 2026', 'December 2025', 'November 2025'];
  const displayMonth = months[currentMonth] || months[0];

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
          Payslip
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigator */}
        <Card padding="md">
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentMonth(Math.min(currentMonth + 1, months.length - 1))}
              disabled={currentMonth >= months.length - 1}
              style={{ padding: 8, opacity: currentMonth >= months.length - 1 ? 0.3 : 1 }}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ ...Typography.h3, color: colors.foreground }}>
              {displayMonth}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(Math.max(currentMonth - 1, 0))}
              disabled={currentMonth <= 0}
              style={{ padding: 8, opacity: currentMonth <= 0 ? 0.3 : 1 }}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Earnings */}
        <Card padding="lg">
          <Text
            style={{
              ...Typography.h3,
              color: colors.foreground,
              marginBottom: Spacing.md,
            }}
          >
            Earnings
          </Text>
          {payslip.earnings.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: Spacing.xs,
                ...(index < payslip.earnings.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }),
              }}
            >
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontFamily: 'JetBrainsMono_500Medium',
                  fontSize: 13,
                  color: colors.foreground,
                }}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: Spacing.sm,
              paddingTop: Spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
              Gross Pay
            </Text>
            <Text
              style={{
                ...Typography.mono,
                fontFamily: 'JetBrainsMono_700Bold',
                color: colors.foreground,
              }}
            >
              {formatCurrency(payslip.grossPay)}
            </Text>
          </View>
        </Card>

        {/* Deductions */}
        <Card padding="lg">
          <Text
            style={{
              ...Typography.h3,
              color: colors.foreground,
              marginBottom: Spacing.md,
            }}
          >
            Deductions
          </Text>
          {payslip.deductions.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: Spacing.xs,
                ...(index < payslip.deductions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }),
              }}
            >
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontFamily: 'JetBrainsMono_500Medium',
                  fontSize: 13,
                  color: item.amount > 0 ? colors.destructive : colors.tertiaryText,
                }}
              >
                {item.amount > 0 ? `-${formatCurrency(item.amount)}` : formatCurrency(0)}
              </Text>
            </View>
          ))}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: Spacing.sm,
              paddingTop: Spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
              Total Deductions
            </Text>
            <Text
              style={{
                ...Typography.mono,
                fontFamily: 'JetBrainsMono_700Bold',
                color: colors.destructive,
              }}
            >
              -{formatCurrency(payslip.totalDeductions)}
            </Text>
          </View>
        </Card>

        {/* Net Pay Summary */}
        <Card padding="lg">
          <View style={{ alignItems: 'center', gap: Spacing.sm }}>
            <Text style={{ ...Typography.overline, color: colors.secondaryText }}>
              NET PAY
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontFamily: 'JetBrainsMono_700Bold',
                color: colors.primary,
              }}
            >
              {formatCurrency(payslip.netPay)}
            </Text>
          </View>
        </Card>

        {/* Download Button */}
        <Button
          title="Download PDF"
          onPress={() => {}}
          variant="outline"
          fullWidth
          icon={<HugeiconsIcon icon={Download01Icon} size={16} color={colors.foreground} />}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
