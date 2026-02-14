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
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Attachment01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { LeaveBalance } from '@/types';

const leaveBalances: LeaveBalance[] = [
  { type: 'Annual Leave', total: 12, used: 3, remaining: 9 },
  { type: 'Sick Leave', total: 6, used: 1, remaining: 5 },
  { type: 'Personal Leave', total: 3, used: 0, remaining: 3 },
];

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Other'];

export default function LeaveRequestScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = () => {
    if (!selectedType || !startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Leave request submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1500);
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
          Submit Leave Request
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Leave Balances */}
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ ...Typography.h3, color: colors.foreground }}>
            Leave Balance
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm }}
          >
            {leaveBalances.map((balance) => (
              <Card key={balance.type} padding="md" style={{ width: 150 }}>
                <Text
                  style={{
                    ...Typography.caption,
                    color: colors.secondaryText,
                    marginBottom: 4,
                  }}
                >
                  {balance.type}
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: 'JetBrainsMono_700Bold',
                    color: colors.success,
                  }}
                >
                  {balance.remaining}
                </Text>
                <Text
                  style={{
                    ...Typography.caption,
                    color: colors.tertiaryText,
                  }}
                >
                  of {balance.total} days remaining
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Leave Type Selector */}
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ ...Typography.bodyMedium, color: colors.secondaryText }}>
            Leave Type *
          </Text>
          <TouchableOpacity
            onPress={() => setShowTypeSelector(!showTypeSelector)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...Typography.body,
                color: selectedType ? colors.foreground : colors.tertiaryText,
              }}
            >
              {selectedType || 'Select leave type'}
            </Text>
            <HugeiconsIcon
              icon={showTypeSelector ? ArrowUp01Icon : ArrowDown01Icon}
              size={16}
              color={colors.tertiaryText}
            />
          </TouchableOpacity>
          {showTypeSelector && (
            <Card padding="none">
              {leaveTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeSelector(false);
                  }}
                  style={{
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                    backgroundColor:
                      selectedType === type ? `${colors.primary}10` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      ...Typography.body,
                      color:
                        selectedType === type ? colors.primary : colors.foreground,
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {/* Date Range */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Start Date *"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: Spacing.md,
            }}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.tertiaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="End Date *"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* Duration */}
        {startDate && endDate && (
          <Card padding="md">
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...Typography.body, color: colors.secondaryText }}>
                Duration
              </Text>
              <Text
                style={{
                  ...Typography.mono,
                  color: colors.primary,
                  fontFamily: 'JetBrainsMono_700Bold',
                }}
              >
                {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}
              </Text>
            </View>
          </Card>
        )}

        {/* Reason */}
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ ...Typography.bodyMedium, color: colors.secondaryText }}>
            Reason *
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Please provide a reason for your leave request..."
            placeholderTextColor={colors.tertiaryText}
            multiline
            numberOfLines={4}
            style={{
              ...Typography.body,
              color: colors.foreground,
              backgroundColor: colors.surface,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: Spacing.md,
              textAlignVertical: 'top',
              minHeight: 100,
            }}
          />
        </View>

        {/* Attachment */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.sm,
          }}
        >
          <HugeiconsIcon icon={Attachment01Icon} size={18} color={colors.primary} />
          <Text style={{ ...Typography.body, color: colors.primary }}>
            Attach supporting document
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          title="Submit Leave Request"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
