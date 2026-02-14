import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Tap01Icon,
  Location01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { AttendanceRecord } from '@/types';

const weekHistory: AttendanceRecord[] = [
  { id: '1', date: '2024-02-25', clockIn: '08:55', clockOut: '17:30', duration: '8h 35m', status: 'present', shiftType: 'Regular Shift' },
  { id: '2', date: '2024-02-24', clockIn: undefined, clockOut: undefined, status: 'holiday', shiftType: 'Weekend' },
  { id: '3', date: '2024-02-23', clockIn: '09:15', clockOut: '18:00', duration: '8h 45m', status: 'late', shiftType: 'Regular Shift' },
  { id: '4', date: '2024-02-22', clockIn: '08:50', clockOut: '17:45', duration: '8h 55m', status: 'present', shiftType: 'Overtime' },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  present: { bg: '#D1FAE5', text: '#1E7F4E', label: 'On Time' },
  late: { bg: '#FEE2E2', text: '#B91C1C', label: 'Late In' },
  holiday: { bg: '#DBEAFE', text: '#005FCC', label: 'Holiday' },
  absent: { bg: '#FEE2E2', text: '#B91C1C', label: 'Absent' },
  leave: { bg: '#FEF3C7', text: '#B45309', label: 'On Leave' },
};

export default function AttendanceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Headquarters, Jakarta');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleClockAction = () => {
    setLoading(true);
    setTimeout(() => {
      if (!clockedIn) {
        setClockedIn(true);
        setClockInTime(
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        );
      } else {
        setClockedIn(false);
        setClockInTime(null);
      }
      setLoading(false);
    }, 1500);
  };

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      day: date.getDate().toString(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    };
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
            Attendance Clock
          </Text>
          <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
            Log your daily attendance
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Display */}
        <Card padding="lg" style={{ alignItems: 'center' }}>
          <Text
            style={{
              ...Typography.monoClock,
              color: colors.foreground,
            }}
          >
            {formatTime(currentTime)}
          </Text>
          <Text
            style={{
              ...Typography.body,
              color: colors.secondaryText,
              marginTop: 4,
            }}
          >
            {formatDateFull(currentTime)}
          </Text>
        </Card>

        {/* Clock In/Out Button */}
        <View style={{ alignItems: 'center', gap: Spacing.md }}>
          <TouchableOpacity
            onPress={handleClockAction}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: clockedIn ? '#B45309' : colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <HugeiconsIcon icon={Tap01Icon} size={28} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'NotoSans_700Bold',
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginTop: 4,
                  }}
                >
                  {clockedIn ? 'Clock Out' : 'Clock In'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
            Tap to {clockedIn ? 'end' : 'start'} shift
          </Text>
        </View>

        {/* Shift Info */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Card padding="md" style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...Typography.caption, color: colors.secondaryText }}>Start</Text>
            <Text style={{ ...Typography.mono, color: colors.foreground }}>09:00 AM</Text>
          </Card>
          <Card padding="md" style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...Typography.caption, color: colors.secondaryText }}>End</Text>
            <Text style={{ ...Typography.mono, color: colors.foreground }}>06:00 PM</Text>
          </Card>
        </View>

        {/* Location */}
        <Card padding="md">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <HugeiconsIcon icon={Location01Icon} size={18} color={colors.secondaryText} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.caption, color: colors.secondaryText }}>Location</Text>
              <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                {location}
              </Text>
            </View>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.success,
              }}
            />
          </View>
        </Card>

        {/* Today's Record */}
        {clockInTime && (
          <Card padding="lg">
            <Text
              style={{
                ...Typography.h3,
                color: colors.foreground,
                marginBottom: Spacing.sm,
              }}
            >
              Today&apos;s Record
            </Text>
            <View style={{ gap: Spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...Typography.body, color: colors.secondaryText }}>Clock In</Text>
                <Text style={{ ...Typography.mono, color: colors.foreground }}>{clockInTime}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...Typography.body, color: colors.secondaryText }}>Clock Out</Text>
                <Text style={{ ...Typography.mono, color: colors.tertiaryText }}>Pending</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...Typography.body, color: colors.secondaryText }}>Duration</Text>
                <Text style={{ ...Typography.mono, color: colors.tertiaryText }}>--</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Week History */}
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ ...Typography.h3, color: colors.foreground }}>
            This Week
          </Text>
          {weekHistory.map((record) => {
            const { day, dayName } = formatDay(record.date);
            const status = statusColors[record.status];
            return (
              <Card key={record.id} padding="md">
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: BorderRadius.md,
                      backgroundColor: colors.muted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'NotoSans_700Bold',
                        fontSize: 16,
                        color: colors.foreground,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                      {dayName}
                    </Text>
                    <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                      {record.shiftType}
                      {record.clockIn && ` \u00B7 ${record.clockIn} - ${record.clockOut}`}
                    </Text>
                  </View>
                  <Badge
                    label={status.label}
                    variant={
                      record.status === 'present'
                        ? 'success'
                        : record.status === 'late'
                        ? 'destructive'
                        : record.status === 'holiday'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  />
                </View>
              </Card>
            );
          })}
        </View>

        {/* Action Cards */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Request Leave"
              onPress={() => router.push('/leave-request')}
              variant="outline"
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Fix Attendance"
              onPress={() => {}}
              variant="outline"
              fullWidth
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
