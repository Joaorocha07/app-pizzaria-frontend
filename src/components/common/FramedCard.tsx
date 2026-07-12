import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radius } from '../../theme/theme';

interface FramedCardProps {
  children: React.ReactNode;
  /** Padding interno do conteúdo (padrão 14) */
  padding?: number;
  /** Cor de fundo do papel; padrão bgCard */
  background?: string;
  /** Cor dos filetes; padrão border (externo) e a mesma com o gap fazendo o duplo */
  borderColor?: string;
  /** Sem padding interno e conteúdo colado na moldura interna (para imagens) */
  flush?: boolean;
  style?: ViewStyle;
}

/**
 * Card com moldura de linha dupla — a "unidade de papel" do design Nobile,
 * no lugar do card genérico de sombra. Filete externo + filete interno com respiro.
 */
export function FramedCard({ children, padding = 14, background, borderColor, flush, style }: FramedCardProps) {
  const { colors } = useTheme();
  const line = borderColor ?? colors.border;
  const bg = background ?? colors.bgCard;

  return (
    <View style={[s.outer, { borderColor: line, backgroundColor: bg }, style]}>
      <View
        style={[
          s.inner,
          { borderColor: line },
          flush ? s.flush : { padding },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 3,
  },
  inner: {
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  flush: {
    overflow: 'hidden',
  },
});
