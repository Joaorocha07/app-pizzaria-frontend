import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Pedido, StatusPedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';

const STATUS_FILTERS: {
  label: string;
  shortLabel: string;
  value: StatusPedido | null;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}[] = [
  { label: 'Todos', shortLabel: 'Todos', value: null, icon: 'apps-outline', color: '#C8943C' },
  { label: 'Pendente', shortLabel: 'Novos', value: 'PENDENTE', icon: 'time-outline', color: '#F59E0B' },
  { label: 'Preparando', shortLabel: 'Cozinha', value: 'PREPARANDO', icon: 'flame-outline', color: '#EF4444' },
  { label: 'Em entrega', shortLabel: 'Entrega', value: 'ENTREGANDO', icon: 'bicycle-outline', color: '#3B82F6' },
  { label: 'Entregue', shortLabel: 'Prontos', value: 'ENTREGUE', icon: 'checkmark-done-outline', color: '#22C55E' },
  { label: 'Cancelado', shortLabel: 'Cancel.', value: 'CANCELADO', icon: 'close-circle-outline', color: '#6B7280' },
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

const ACTIVE_STATUSES: StatusPedido[] = ['PENDENTE', 'PREPARANDO', 'ENTREGANDO'];

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

  const counts = useMemo(() => {
    return pedidos.reduce<Record<string, number>>(
      (acc, pedido) => {
        acc.total += 1;
        acc[pedido.status] = (acc[pedido.status] ?? 0) + 1;
        return acc;
      },
      { total: 0 },
    );
  }, [pedidos]);

  const activeOrders = useMemo(
    () => pedidos.filter((pedido) => ACTIVE_STATUSES.includes(pedido.status)).length,
    [pedidos],
  );

  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return pedidos
      .filter((pedido) => pedido.status !== 'CANCELADO')
      .filter((pedido) => new Date(pedido.criadoEm).toDateString() === today)
      .reduce((sum, pedido) => sum + pedido.total, 0);
  }, [pedidos]);

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
    <View style={styles.root}>
      <Header
        title="Pedidos"
        subtitle="Painel do restaurante"
        rightElement={
          <TouchableOpacity
            onPress={() => {
              setRefreshing(true);
              load();
            }}
            style={styles.headerAction}
            activeOpacity={0.75}
          >
            <Ionicons name="refresh" size={18} color="#F5F0E8" />
          </TouchableOpacity>
        }
      />

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
            tintColor="#E32626"
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.eyebrow}>Resumo de hoje</Text>
                <Text style={styles.summaryTitle}>
                  {activeOrders} {activeOrders === 1 ? 'pedido ativo' : 'pedidos ativos'}
                </Text>
              </View>
              <View style={styles.revenuePill}>
                <Text style={styles.revenueLabel}>Vendas</Text>
                <Text style={styles.revenueValue}>{formatCurrency(todayRevenue)}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
              style={styles.filters}
            >
              {STATUS_FILTERS.map((filter) => {
                const selected = statusFilter === filter.value;
                const count = filter.value ? counts[filter.value] ?? 0 : counts.total;

                return (
                  <TouchableOpacity
                    key={filter.label}
                    onPress={() => setStatusFilter(filter.value)}
                    style={[
                      styles.filterChip,
                      selected ? styles.filterChipActive : null,
                      selected ? { borderColor: filter.color } : null,
                    ]}
                    activeOpacity={0.78}
                  >
                    <View
                      style={[
                        styles.filterIcon,
                        { backgroundColor: `${filter.color}1F` },
                        selected && { backgroundColor: filter.color },
                      ]}
                    >
                      <Ionicons
                        name={filter.icon}
                        size={15}
                        color={selected ? '#FFFFFF' : filter.color}
                      />
                    </View>
                    <Text style={[styles.filterLabel, selected && styles.filterLabelActive]}>
                      {filter.shortLabel}
                    </Text>
                    <Text style={[styles.filterCount, selected && styles.filterCountActive]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={34} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum pedido por aqui</Text>
            <Text style={styles.emptyText}>
              {statusFilter
                ? 'Quando chegar um pedido neste status, ele aparece aqui.'
                : 'Os novos pedidos do restaurante aparecem nesta fila.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const temProximo = Boolean(NEXT_STATUS[item.status]?.length);
          const statusConfig = STATUS_FILTERS.find((filter) => filter.value === item.status);

          return (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item)}
              style={[styles.orderCard, temProximo && styles.orderCardActionable]}
              activeOpacity={temProximo ? 0.82 : 1}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.orderIdentity}>
                  <View
                    style={[
                      styles.orderMarker,
                      { backgroundColor: statusConfig?.color ?? '#C8943C' },
                    ]}
                  />
                  <View>
                    <Text style={styles.orderId}>{formatOrderId(item.id)}</Text>
                    <Text style={styles.orderTime}>{formatDateTime(item.criadoEm)}</Text>
                  </View>
                </View>
                <OrderStatusBadge status={item.status} />
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottomRow}>
                <View style={styles.paymentBox}>
                  <Ionicons
                    name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'}
                    size={17}
                    color="#9CA3AF"
                  />
                  <Text style={styles.paymentText}>{item.metodoPagamento}</Text>
                </View>

                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                </View>
              </View>

              {temProximo ? (
                <View style={styles.nextAction}>
                  <Text style={styles.nextActionText}>Toque para avançar o status</Text>
                  <Ionicons name="chevron-forward" size={16} color="#C8943C" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#242424',
  },
  eyebrow: {
    color: '#C8943C',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  summaryTitle: {
    color: '#F5F0E8',
    fontSize: 20,
    fontWeight: '800',
  },
  revenuePill: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#201414',
  },
  revenueLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  revenueValue: {
    color: '#F5F0E8',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  filters: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    minWidth: 94,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#242424',
  },
  filterChipActive: {
    backgroundColor: '#201414',
  },
  filterIcon: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  filterLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  filterLabelActive: {
    color: '#F5F0E8',
  },
  filterCount: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
  },
  filterCountActive: {
    color: '#F5F0E8',
  },
  orderCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#242424',
  },
  orderCardActionable: {
    borderColor: '#332525',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderMarker: {
    width: 4,
    height: 38,
    borderRadius: 4,
    marginRight: 12,
  },
  orderId: {
    color: '#F5F0E8',
    fontSize: 16,
    fontWeight: '800',
  },
  orderTime: {
    color: '#7B8190',
    fontSize: 12,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#242424',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  paymentText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '700',
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: '#7B8190',
    fontSize: 11,
    fontWeight: '600',
  },
  totalValue: {
    color: '#C8943C',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 1,
  },
  nextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  nextActionText: {
    color: '#C8943C',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 68,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F5F0E8',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
