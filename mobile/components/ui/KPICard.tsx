import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from './Card';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

export function KPICard({
  label,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
}: KPICardProps) {
  const { colors } = useTheme();

  const changeColor = {
    positive: colors.success,
    negative: colors.destructive,
    neutral: colors.secondaryText,
  };

  return (
    <Card padding="md">
      <View style={{ gap: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          {icon && (
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
              {icon}
            </View>
          )}
          <Text
            style={{
              ...Typography.caption,
              color: colors.secondaryText,
              flex: 1,
            }}
          >
            {label}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'JetBrainsMono_700Bold',
            color: colors.foreground,
          }}
        >
          {value}
        </Text>
        {(change || subtitle) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {change && (
              <Text
                style={{
                  ...Typography.caption,
                  color: changeColor[changeType],
                  fontFamily: 'NotoSans_600SemiBold',
                }}
              >
                {change}
              </Text>
            )}
            {subtitle && (
              <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}
