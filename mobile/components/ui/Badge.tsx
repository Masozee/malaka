import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Typography } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', style, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    default: { bg: colors.muted, text: colors.foreground },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    destructive: { bg: colors.destructiveLight, text: colors.destructive },
    info: { bg: colors.infoLight, text: colors.info },
    outline: { bg: 'transparent', text: colors.secondaryText, border: colors.border },
  };

  const { bg, text, border } = variantStyles[variant];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: BorderRadius.full,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 2 : 4,
          alignSelf: 'flex-start',
          ...(border && { borderWidth: 1, borderColor: border }),
        },
        style,
      ]}
    >
      <Text
        style={{
          color: text,
          fontSize: size === 'sm' ? 10 : 12,
          fontFamily: 'NotoSans_500Medium',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface CountBadgeProps {
  count: number;
  style?: ViewStyle;
}

export function CountBadge({ count, style }: CountBadgeProps) {
  const { colors } = useTheme();
  if (count <= 0) return null;

  return (
    <View
      style={[
        {
          backgroundColor: colors.badge,
          borderRadius: BorderRadius.full,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colors.badgeText,
          fontSize: 10,
          fontFamily: 'NotoSans_700Bold',
        }}
      >
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}
