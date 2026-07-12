import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing } from '../../theme/theme';

interface SectionHeadingProps {
  title: string;
  /** Texto de ação à direita (ex.: "Ver tudo") — se ausente, o título centraliza entre filetes */
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Título de seção de cardápio antigo: CAIXA ALTA espaçada entre filetes.
 * Com actionLabel vira linha título+ação (filete só à esquerda do action).
 */
export function SectionHeading({ title, actionLabel, onAction, style }: SectionHeadingProps) {
  const { colors } = useTheme();

  if (actionLabel) {
    return (
      <View style={[s.rowBetween, style]}>
        <Text style={[s.label, { color: colors.text }]}>{title.toUpperCase()}</Text>
        <View style={[s.line, { backgroundColor: colors.border, marginHorizontal: 12 }]} />
        <TouchableOpacity onPress={onAction} activeOpacity={0.7} hitSlop={8}>
          <Text style={[s.action, { color: colors.primary }]}>{actionLabel.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.rowCenter, style]}>
      <View style={[s.line, { backgroundColor: colors.border }]} />
      <Text style={[s.label, { color: colors.text, marginHorizontal: 12 }]}>{title.toUpperCase()}</Text>
      <View style={[s.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const s = StyleSheet.create({
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    letterSpacing: letterSpacing.capsWide,
  },
  action: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    letterSpacing: letterSpacing.caps,
  },
});
