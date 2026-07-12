import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusPedido } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import type { AppColors } from '../../theme/theme';

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getStatusConfig(c: AppColors): Record<StatusPedido, { label: string; color: string }> {
  return {
    PENDENTE:   { label: 'Pendente',   color: c.warning },
    PREPARANDO: { label: 'Preparando', color: c.accent },
    ENTREGANDO: { label: 'Em entrega', color: c.info },
    ENTREGUE:   { label: 'Entregue',   color: c.success },
    CANCELADO:  { label: 'Cancelado',  color: c.danger },
  };
}

export function OrderStatusBadge({ status }: { status: StatusPedido }) {
  const { colors } = useTheme();
  const { label, color } = getStatusConfig(colors)[status];
  return (
    <View style={[s.badge, { backgroundColor: hexToRgba(color, 0.12), borderColor: hexToRgba(color, 0.45) }]}>
      <View style={[s.diamond, { backgroundColor: color }]} />
      <Text style={[s.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  diamond: {
    width: 5,
    height: 5,
    transform: [{ rotate: '45deg' }],
  },
  text: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.caps,
  },
});
