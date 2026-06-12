import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${fullScreen ? 'flex-1 bg-dark' : 'py-8'}`}>
      <ActivityIndicator size="large" color="#8B1A1A" />
      {message && <Text className="text-gray-400 mt-3 text-sm">{message}</Text>}
    </View>
  );
}
