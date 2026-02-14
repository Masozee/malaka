import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google sign-in is not yet available.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: Spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: Spacing.xxxl }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: BorderRadius.lg,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.lg,
              }}
            >
              <Text style={{ fontSize: 32, color: '#FFFFFF', fontFamily: 'NotoSans_700Bold' }}>
                K
              </Text>
            </View>
            <Text style={{ ...Typography.h1, color: colors.foreground }}>
              Karajo
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: colors.secondaryText,
                marginTop: 4,
              }}
            >
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <Card padding="lg" style={{ gap: Spacing.lg }}>
            {errors.general && (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: BorderRadius.sm,
                  padding: Spacing.md,
                }}
              >
                <Text style={{ ...Typography.caption, color: '#DC2626' }}>
                  {errors.general}
                </Text>
              </View>
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : ViewIcon}
                  size={18}
                  strokeWidth={1.5}
                  color={colors.tertiaryText}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
              size="lg"
            />

            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Text style={{ ...Typography.body, color: colors.primary }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Divider */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: Spacing.xl,
              gap: Spacing.md,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.md,
              backgroundColor: colors.card,
              borderRadius: BorderRadius.sm,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: Spacing.md,
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 48 48">
              <Path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
              <Path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
              <Path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
              <Path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
            </Svg>
            <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: Spacing.xxxl }}>
            <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
              Powered by Karajo ERP
            </Text>
            <Text style={{ ...Typography.caption, color: colors.tertiaryText }}>
              v2.4.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
