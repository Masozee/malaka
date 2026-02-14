import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius } from '@/constants/theme';

interface AvatarProps {
  name: string;
  image?: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}

export function Avatar({ name, image, size = 48, online, style }: AvatarProps) {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={{
            width: size,
            height: size,
            borderRadius: BorderRadius.full,
          }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: BorderRadius.full,
            backgroundColor: `${colors.primary}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: size * 0.35,
              fontFamily: 'NotoSans_600SemiBold',
              color: colors.primary,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: BorderRadius.full,
            backgroundColor: online ? colors.success : colors.tertiaryText,
            borderWidth: 2,
            borderColor: colors.card,
          }}
        />
      )}
    </View>
  );
}
