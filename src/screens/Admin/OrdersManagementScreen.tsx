import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Pedido, StatusPedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';

const STATUS_FILTERS: { label: string; value: StatusPedido | null }[] = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Preparando', value: 'PREPARANDO' },
  { label: 'Em entrega', value: 'ENTREGANDO' },
  { label: 'Entregue', value: 'ENTREGUE' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

const NEXT_STATUS: Partial<Record<StatusPedido, StatusPedido[]>> = {
  PENDENTE: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['ENTREGANDO', 'CANCELADO'],
  ENTREGANDO: ['ENTREGUE'],
};

const STATUS_LABEL: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  PREPARANDO: 'Preparando',
  ENTREGANDO: 'Em entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const METODO_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  PIX: 'qr-code-outline',
  CARTAO: 'card-outline',
  DINHEIRO: 'cash-outline',
};

export function AdminOrdersManagementScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusPedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminService.getOrders();
      const sorted = data.sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
      );
      setPedidos(sorted);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setFilteredPedidos(
      statusFilter ? pedidos.filter((p) => p.status === statusFilter) : pedidos,
    );
  }, [pedidos, statusFilter]);

  function handleUpdateStatus(pedido: Pedido) {
    const proximos = NEXT_STATUS[pedido.status];
    if (!proximos || proximos.length === 0) return;

    Alert.alert(
      `Pedido ${formatOrderId(pedido.id)}`,
      'Atualizar status para:',
      [
        ...proximos.map((s) => ({
          text: STATUS_LABEL[s],
          onPress: () => confirmUpdateStatus(pedido.id, s),
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  }

  async function confirmUpdateStatus(id: number, status: StatusPedido) {
    try {
      await adminService.updateOrderStatus(id, status);
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header title="Gerenciar Pedidos" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.label}
            onPress={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-full border ${
              statusFilter === f.value
                ? 'bg-primary border-primary'
                : 'bg-dark-card border-dark-border'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                statusFilter === f.value ? 'text-offwhite' : 'text-gray-400'
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPedidos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#8B1A1A"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="receipt-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhum pedido</Text>
            <Text className="text-gray-400 text-center">
              {statusFilter ? 'Sem pedidos com este status.' : 'Nenhum pedido registrado ainda.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const temProximo = NEXT_STATUS[item.status] && NEXT_STATUS[item.status]!.length > 0;
          return (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item)}
              className="bg-dark-card rounded-2xl p-4 mb-3"
              activeOpacity={temProximo ? 0.8 : 1}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="receipt-outline" size={16} color="#C8943C" />
                  <Text className="text-offwhite font-bold">{formatOrderId(item.id)}</Text>
                </View>
                <OrderStatusBadge status={item.status} />
              </View>

              <View className="flex-row items-center gap-1 mb-2">
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text className="text-gray-400 text-xs">{formatDateTime(item.criadoEm)}</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'}
                    size={14}
                    color="#6B7280"
                  />
                  <Text className="text-gray-400 text-sm">{item.metodoPagamento}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-accent font-bold">{formatCurrency(item.total)}</Text>
                  {temProximo && (
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
