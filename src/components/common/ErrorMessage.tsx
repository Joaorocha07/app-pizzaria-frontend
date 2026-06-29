import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View className="items-center justify-center py-8 px-4">
      <Text className="text-danger text-base text-center mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-primary px-6 py-2 rounded-xl"
        >
          <Text className="text-offwhite font-bold">Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
