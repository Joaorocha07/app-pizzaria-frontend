import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
}

const SIZE: Record<string, { paddingVertical: number; paddingHorizontal: number; borderRadius: number; fontSize: number }> = {
  sm: { paddingVertical: 9,  paddingHorizontal: 16, borderRadius: 12, fontSize: 13 },
  md: { paddingVertical: 13, paddingHorizontal: 24, borderRadius: 14, fontSize: 15 },
  lg: { paddingVertical: 17, paddingHorizontal: 32, borderRadius: 16, fontSize: 17 },
};

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
    primary:   { gradient: ['#C0392B', '#922B21'] as [string, string], bg: '#C0392B', text: '#FFFFFF' },
    secondary: { gradient: ['#B8860B', '#9A7209'] as [string, string], bg: '#B8860B', text: '#0A0A0A' },
    outline:   { bg: colors.bgCard, text: colors.text, border: colors.borderStrong },
    ghost:     { bg: colors.bgCard, text: colors.primary },
  };

  const v = VARIANT[variant];

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 60, bounciness: 4 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  }

  const inner = loading ? (
    <ActivityIndicator color={v.text} size="small" />
  ) : (
    <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{title}</Text>
  );

  if ('gradient' in v && v.gradient && !isDisabled) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          disabled={isDisabled}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[
            styles.base,
            {
              borderRadius: s.borderRadius,
              shadowColor: '#C0392B',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 10,
            },
          ]}
          {...props}
        >
          <LinearGradient
            colors={v.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              {
                paddingVertical: s.paddingVertical,
                paddingHorizontal: s.paddingHorizontal,
                borderRadius: s.borderRadius,
              },
            ]}
          >
            {inner}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: isDisabled ? 0.5 : 1 }, style]}>
      <TouchableOpacity
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[
          styles.base,
          {
            backgroundColor: v.bg,
            paddingVertical: s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
            borderRadius: s.borderRadius,
            borderWidth: 'border' in v && v.border ? 1.5 : 0,
            borderColor: 'border' in v ? (v.border ?? 'transparent') : 'transparent',
          },
        ]}
        {...props}
      >
        {inner}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
