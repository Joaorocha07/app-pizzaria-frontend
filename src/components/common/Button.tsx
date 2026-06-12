import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-accent active:bg-yellow-700',
  outline: 'border border-primary bg-transparent',
  ghost: 'bg-transparent',
};

const textStyles = {
  primary: 'text-offwhite font-bold',
  secondary: 'text-dark font-bold',
  outline: 'text-primary font-bold',
  ghost: 'text-primary font-bold',
};

const sizeStyles = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-xl',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#F5F0E8' : '#8B1A1A'} />
      ) : (
        <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
