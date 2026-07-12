import React, { useRef, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Categoria } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/theme';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

interface CategoryChipProps {
  categoria: Categoria;
  selected: boolean;
  onPress: (id: number) => void;
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.md,
      marginRight: 8,
      borderWidth: 1,
    },
    chipDefault: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    chipSelected: {
      backgroundColor: c.primary,
      borderColor: c.accent,
    },
    label: {
      fontFamily: fontFamily.bodySemiBold,
      fontSize: 11,
      letterSpacing: letterSpacing.caps,
    },
    labelDefault: {
      color: c.textSecondary,
    },
    labelSelected: {
      color: '#F4EDE1',
    },
  });
}

export function CategoryChip({ categoria, selected, onPress }: CategoryChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.91, useNativeDriver: true, speed: 60, bounciness: 4 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => onPress(categoria.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
        activeOpacity={1}
      >
        <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
          {categoria.nome.toUpperCase()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
