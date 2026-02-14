import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

export function FilterChip({ label, active, onPress, count }: FilterChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: active ? colors.primary : colors.card,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        marginRight: Spacing.sm,
      }}
    >
      <Text
        style={{
          ...Typography.caption,
          fontFamily: 'NotoSans_500Medium',
          color: active ? '#FFFFFF' : colors.secondaryText,
        }}
      >
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
}
