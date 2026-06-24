import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusPedido } from '../../types';

const STATUS_CONFIG: Record<StatusPedido, { label: string; color: string; bg: string }> = {
  PENDENTE:   { label: 'Pendente',    color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  PREPARANDO: { label: 'Preparando',  color: '#F4A261', bg: 'rgba(244,162,97,0.14)' },
  ENTREGANDO: { label: 'Em entrega',  color: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
  ENTREGUE:   { label: 'Entregue',    color: '#2A9D8F', bg: 'rgba(42,157,143,0.14)' },
  CANCELADO:  { label: 'Cancelado',   color: '#E63946', bg: 'rgba(230,57,70,0.14)'  },
};

export function OrderStatusBadge({ status }: { status: StatusPedido }) {
  const { label, color, bg } = STATUS_CONFIG[status];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.text, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
