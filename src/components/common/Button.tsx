import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
}

const SIZE: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: 11 },
  md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 12 },
  lg: { paddingVertical: 15, paddingHorizontal: 32, fontSize: 13 },
};

/**
 * Botão "letterpress" Nobile: retângulo de canto reto, label em CAPS espaçada;
 * primary = borgonha com filete dourado interno. Sem glow, sem gradiente.
 */
export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const s = SIZE[size];
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const VARIANT = {
    primary:   { bg: colors.primary, text: '#F4EDE1', border: colors.primary, inner: colors.accent },
    secondary: { bg: colors.bgCard, text: colors.primary, border: colors.primary, inner: null },
    outline:   { bg: 'transparent', text: colors.text, border: colors.borderStrong, inner: null },
    ghost:     { bg: 'transparent', text: colors.primary, border: 'transparent', inner: null },
  };

  const v = VARIANT[variant];

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 4 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  const inner = loading ? (
    <ActivityIndicator color={v.text} size="small" />
  ) : (
    <Text
      style={[
        styles.text,
        { color: v.text, fontSize: s.fontSize },
      ]}
      numberOfLines={1}
    >
      {title.toUpperCase()}
    </Text>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: isDisabled ? 0.45 : 1 }, style]}>
      <TouchableOpacity
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.88}
        style={[
          styles.base,
          {
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: variant === 'ghost' ? 0 : 1,
          },
        ]}
        {...props}
      >
        {/* Filete interno dourado — assinatura do primary */}
        {v.inner ? (
          <View
            pointerEvents="none"
            style={[styles.innerLine, { borderColor: v.inner }]}
          />
        ) : null}
        <View style={{ paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal }}>
          {inner}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  innerLine: {
    position: 'absolute',
    top: 2.5,
    left: 2.5,
    right: 2.5,
    bottom: 2.5,
    borderWidth: 1,
    borderRadius: radius.sm,
    opacity: 0.85,
  },
  text: {
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: letterSpacing.caps,
  },
});
