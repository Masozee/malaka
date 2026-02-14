import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: Spacing.xs }}>
      {label && (
        <Text
          style={{
            ...Typography.bodyMedium,
            color: colors.secondaryText,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: focused ? colors.background : colors.surface,
          borderRadius: BorderRadius.md,
          borderWidth: focused ? 2 : 1,
          borderColor: error
            ? colors.destructive
            : focused
            ? colors.primary
            : colors.border,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
        }}
      >
        {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
        <TextInput
          style={[
            {
              flex: 1,
              ...Typography.body,
              color: colors.foreground,
              padding: 0,
            },
            style,
          ]}
          placeholderTextColor={colors.tertiaryText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: Spacing.sm }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            ...Typography.caption,
            color: colors.destructive,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
