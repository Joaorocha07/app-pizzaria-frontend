import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, leftIcon, rightIcon, isPassword, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-offwhite text-sm mb-1 font-semibold">{label}</Text>}
      <View
        className={`flex-row items-center bg-dark-card border rounded-xl px-4 ${
          error ? 'border-danger' : 'border-dark-border'
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-offwhite py-3 text-base"
          placeholderTextColor="#6B7280"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="ml-2 p-1">
            <Text className="text-gray-400 text-xs">{showPassword ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2">{rightIcon}</View>
        )}
      </View>
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}
