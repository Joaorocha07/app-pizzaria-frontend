import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface OrnamentProps {
  /** 'single' = ─ ◆ ─   ·   'triple' = ─ ◆◆◆ ─ (diamante central maior) */
  variant?: 'single' | 'triple';
  /** Cor dos filetes/diamantes; padrão borderStrong */
  color?: string;
  /** Largura máxima do ornamento (padrão: estica no container) */
  width?: number;
  style?: ViewStyle;
}

function Diamond({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

/**
 * Divisor ornamental de impresso vintage: filete — diamante — filete.
 * Usar entre seções no lugar de linhas simples.
 */
export function Ornament({ variant = 'single', color, width, style }: OrnamentProps) {
  const { colors } = useTheme();
  const c = color ?? colors.borderStrong;

  return (
    <View style={[s.row, width ? { width, alignSelf: 'center' } : null, style]}>
      <View style={[s.line, { backgroundColor: c }]} />
      <View style={s.center}>
        {variant === 'triple' && <Diamond size={4} color={c} />}
        <Diamond size={variant === 'triple' ? 7 : 6} color={c} />
        {variant === 'triple' && <Diamond size={4} color={c} />}
      </View>
      <View style={[s.line, { backgroundColor: c }]} />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
