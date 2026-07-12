import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily } from '../../theme/theme';
import { Button } from './Button';
import { Ornament } from './Ornament';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { colors } = useTheme();
  return (
    <View style={s.container}>
      <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
      <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text>
      <Ornament width={120} style={{ marginBottom: 16 }} />
      {onRetry && <Button title="Tentar novamente" variant="outline" size="sm" onPress={onRetry} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  message: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
