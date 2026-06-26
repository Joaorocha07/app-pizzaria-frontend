import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/colors';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    fullScreen: {
      flex: 1,
      backgroundColor: c.bg,
    },
    message: {
      color: c.textSecondary,
      marginTop: 12,
      fontSize: 14,
      letterSpacing: 0.3,
    },
  });
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}
