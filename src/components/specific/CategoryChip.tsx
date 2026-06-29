import React, { useRef, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Categoria } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/colors';

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
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 24,
      marginRight: 8,
      borderWidth: 1,
    },
    chipDefault: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    chipSelected: {
      backgroundColor: 'rgba(192,57,43,0.85)',
      borderColor: 'rgba(231,76,60,0.5)',
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    labelDefault: {
      color: c.textSecondary,
    },
    labelSelected: {
      color: '#FFFFFF',
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
          {categoria.nome}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
