import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT: Record<string, { bg: string; text: string; border?: string; shadow?: string }> = {
  primary:   { bg: '#8B1A1A', text: '#F5F0E8', shadow: '#8B1A1A' },
  secondary: { bg: '#C8943C', text: '#0D0D0D', shadow: '#C8943C' },
  outline:   { bg: 'transparent', text: '#8B1A1A', border: '#8B1A1A' },
  ghost:     { bg: 'transparent', text: '#8B1A1A' },
};

const SIZE: Record<string, { paddingVertical: number; paddingHorizontal: number; borderRadius: number; fontSize: number }> = {
  sm: { paddingVertical: 8,  paddingHorizontal: 16, borderRadius: 10, fontSize: 13 },
  md: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, fontSize: 15 },
  lg: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, fontSize: 17 },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v = VARIANT[variant];
  const s = SIZE[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border ?? 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        },
        v.shadow && !isDisabled ? {
          shadowColor: v.shadow,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 6,
        } : {},
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
