import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderLeft?: string;
}

export function Card({
  children,
  onPress,
  style,
  padding = 'md',
  borderLeft,
}: CardProps) {
  const { colors } = useTheme();

  const paddingValues = {
    none: 0,
    sm: Spacing.sm,
    md: Spacing.lg,
    lg: Spacing.xl,
  };

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: paddingValues[padding],
    ...Shadows.card,
    ...(borderLeft && { borderLeftWidth: 3, borderLeftColor: borderLeft }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}
