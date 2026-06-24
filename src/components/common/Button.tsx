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

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT: Record<string, { gradient?: [string, string]; bg: string; text: string; border?: string }> = {
  primary:   { gradient: ['#E63946', '#D62839'], bg: '#E63946', text: '#FFFFFF' },
  secondary: { gradient: ['#F4A261', '#E8884A'], bg: '#F4A261', text: '#0D0D0D' },
  outline:   { bg: 'transparent', text: '#E63946', border: '#E63946' },
  ghost:     { bg: 'transparent', text: '#E63946' },
};

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
  const v = VARIANT[variant];
  const s = SIZE[size];
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }

  const inner = loading ? (
    <ActivityIndicator color={v.text} size="small" />
  ) : (
    <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{title}</Text>
  );

  if (v.gradient && !isDisabled) {
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
              shadowColor: '#E63946',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 8,
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
            borderWidth: v.border ? 1.5 : 0,
            borderColor: v.border ?? 'transparent',
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
    letterSpacing: 0.3,
  },
});
