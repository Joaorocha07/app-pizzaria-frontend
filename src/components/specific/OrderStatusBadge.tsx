import React from 'react';
import { View, Text } from 'react-native';
import { StatusPedido } from '../../types';

const STATUS_CONFIG: Record<StatusPedido, { label: string; className: string; textClass: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-yellow-900', textClass: 'text-warning' },
  PREPARANDO: { label: 'Preparando', className: 'bg-blue-900', textClass: 'text-blue-400' },
  ENTREGANDO: { label: 'Em entrega', className: 'bg-purple-900', textClass: 'text-purple-400' },
  ENTREGUE: { label: 'Entregue', className: 'bg-green-900', textClass: 'text-success' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-900', textClass: 'text-danger' },
};

export function OrderStatusBadge({ status }: { status: StatusPedido }) {
  const config = STATUS_CONFIG[status];
  return (
    <View className={`px-3 py-1 rounded-full ${config.className}`}>
      <Text className={`text-xs font-bold ${config.textClass}`}>{config.label}</Text>
    </View>
  );
}
