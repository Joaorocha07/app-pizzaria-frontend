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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Pedido, StatusPedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';

const GOLD = '#C9A227';
const BLACK_DEEP = '#000000';
const BLACK_CARD = '#0A0A0A';

const STATUS_FILTERS: {
  label: string;
  shortLabel: string;
  value: StatusPedido | null;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}[] = [
  { label: 'Todos', shortLabel: 'Todos', value: null, icon: 'apps-outline', color: GOLD },
  { label: 'Pendente', shortLabel: 'Novos', value: 'PENDENTE', icon: 'time-outline', color: '#F59E0B' },
  { label: 'Preparando', shortLabel: 'Cozinha', value: 'PREPARANDO', icon: 'flame-outline', color: '#E63946' },
  { label: 'Em entrega', shortLabel: 'Entrega', value: 'ENTREGANDO', icon: 'bicycle-outline', color: '#3B82F6' },
  { label: 'Entregue', shortLabel: 'Prontos', value: 'ENTREGUE', icon: 'checkmark-done-outline', color: '#2A9D8F' },
  { label: 'Cancelado', shortLabel: 'Cancel.', value: 'CANCELADO', icon: 'close-circle-outline', color: '#555555' },
];

const QUICK_STATS: {
  label: string;
  status: StatusPedido;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}[] = [
  { label: 'Pendentes', status: 'PENDENTE', icon: 'time-outline', color: '#F59E0B' },
  { label: 'Cozinha', status: 'PREPARANDO', icon: 'flame-outline', color: '#E63946' },
  { label: 'Entrega', status: 'ENTREGANDO', icon: 'bicycle-outline', color: '#3B82F6' },
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
            tintColor="#E63946"
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Summary Card */}
            <LinearGradient
              colors={['#1C1C1C', '#0D0D0D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={styles.summaryTop}>
                <View style={styles.summaryLeft}>
                  <View style={styles.eyebrowRow}>
                    <Ionicons name="restaurant-outline" size={11} color={GOLD} style={{ marginRight: 5 }} />
                    <Text style={styles.eyebrow}>RESUMO DE HOJE</Text>
                  </View>
                  <Text style={styles.summaryTitle}>
                    {activeOrders}{' '}
                    <Text style={styles.summaryTitleSuffix}>
                      {activeOrders === 1 ? 'pedido ativo' : 'pedidos ativos'}
                    </Text>
                  </Text>
                </View>
                <View style={styles.revenuePill}>
                  <Text style={styles.revenueLabel}>Vendas hoje</Text>
                  <Text style={styles.revenueValue}>{formatCurrency(todayRevenue)}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.quickStats}>
                {QUICK_STATS.map((stat) => (
                  <TouchableOpacity
                    key={stat.status}
                    onPress={() => setStatusFilter(stat.status)}
                    style={styles.quickStatChip}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.quickStatIcon, { backgroundColor: `${stat.color}20` }]}>
                      <Ionicons name={stat.icon} size={13} color={stat.color} />
                    </View>
                    <View>
                      <Text style={styles.quickStatCount}>{counts[stat.status] ?? 0}</Text>
                      <Text style={styles.quickStatLabel}>{stat.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>

            {/* Filter Chips */}
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
                    activeOpacity={0.78}
                  >
                    {selected ? (
                      <LinearGradient
                        colors={[`${filter.color}30`, `${filter.color}12`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.filterChip, styles.filterChipActive, { borderColor: filter.color }]}
                      >
                        <View style={[styles.filterIcon, { backgroundColor: filter.color }]}>
                          <Ionicons name={filter.icon} size={14} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.filterLabel, styles.filterLabelActive]}>
                          {filter.shortLabel}
                        </Text>
                        <View style={[styles.filterCountBadge, { backgroundColor: filter.color }]}>
                          <Text style={styles.filterCountBadgeText}>{count}</Text>
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.filterChip}>
                        <View style={[styles.filterIcon, { backgroundColor: `${filter.color}20` }]}>
                          <Ionicons name={filter.icon} size={14} color={filter.color} />
                        </View>
                        <Text style={styles.filterLabel}>{filter.shortLabel}</Text>
                        <Text style={styles.filterCount}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={40} color="#4A4A4A" />
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
          const statusColor = statusConfig?.color ?? GOLD;

          return (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item)}
              style={[
                styles.orderCard,
                temProximo && {
                  shadowColor: statusColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
              activeOpacity={temProximo ? 0.82 : 1}
            >
              {/* Colored left border accent */}
              <View style={[styles.cardLeftAccent, { backgroundColor: statusColor }]} />

              <View style={styles.cardInner}>
                <View style={styles.cardTopRow}>
                  <View style={styles.orderIdentity}>
                    <Text style={styles.orderId}>{formatOrderId(item.id)}</Text>
                    <View style={styles.orderTimeRow}>
                      <Ionicons name="time-outline" size={11} color="#555B66" style={{ marginRight: 3 }} />
                      <Text style={styles.orderTime}>{formatDateTime(item.criadoEm)}</Text>
                    </View>
                  </View>
                  <OrderStatusBadge status={item.status} />
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardBottomRow}>
                  <View style={styles.paymentBox}>
                    <View style={styles.paymentIconWrap}>
                      <Ionicons
                        name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'}
                        size={14}
                        color="#9CA3AF"
                      />
                    </View>
                    <Text style={styles.paymentText}>{item.metodoPagamento}</Text>
                  </View>

                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                  </View>
                </View>

                {temProximo ? (
                  <View style={styles.nextAction}>
                    <Text style={styles.nextActionText}>Toque para avançar o status</Text>
                    <View style={styles.nextActionArrow}>
                      <Ionicons name="chevron-forward" size={14} color={BLACK_DEEP} />
                    </View>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    headerAction: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgElevated, borderWidth: 1, borderColor: c.borderStrong },
    listContent: { paddingHorizontal: 16, paddingBottom: 28 },
    summaryCard: { marginTop: 14, marginBottom: 14, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#C9A22730' },
    summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    summaryLeft: { flex: 1 },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    eyebrow: { color: GOLD, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    summaryTitle: { color: c.text, fontSize: 26, fontWeight: '900' },
    summaryTitleSuffix: { color: c.textSecondary, fontSize: 15, fontWeight: '500' },
    revenuePill: { alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: c.bgCard, borderWidth: 1, borderColor: '#C9A22728', marginLeft: 12 },
    revenueLabel: { color: c.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    revenueValue: { color: GOLD, fontSize: 16, fontWeight: '900', marginTop: 2 },
    summaryDivider: { height: 1, backgroundColor: c.border, marginVertical: 14 },
    quickStats: { flexDirection: 'row', gap: 10 },
    quickStatChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.bgElevated, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: c.border },
    quickStatIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    quickStatCount: { color: c.text, fontSize: 16, fontWeight: '900', lineHeight: 18 },
    quickStatLabel: { color: c.textSecondary, fontSize: 10, fontWeight: '600', lineHeight: 13 },
    filters: { marginHorizontal: -16, marginBottom: 14 },
    filtersContent: { paddingHorizontal: 16, gap: 8 },
    filterChip: { height: 52, minWidth: 98, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 16, backgroundColor: c.bgElevated, borderWidth: 1, borderColor: c.border, gap: 7 },
    filterChipActive: { backgroundColor: 'transparent' },
    filterIcon: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    filterLabel: { color: c.textSecondary, fontSize: 12, fontWeight: '700', flex: 1 },
    filterLabelActive: { color: c.text },
    filterCount: { color: c.textMuted, fontSize: 12, fontWeight: '800' },
    filterCountBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
    filterCountBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    orderCard: { marginBottom: 10, borderRadius: 18, backgroundColor: c.bgElevated, borderWidth: 1, borderColor: c.border, overflow: 'hidden', flexDirection: 'row' },
    cardLeftAccent: { width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
    cardInner: { flex: 1, padding: 14 },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    orderIdentity: { flex: 1 },
    orderId: { color: c.text, fontSize: 17, fontWeight: '800', marginBottom: 3 },
    orderTimeRow: { flexDirection: 'row', alignItems: 'center' },
    orderTime: { color: c.textSecondary, fontSize: 12 },
    cardDivider: { height: 1, backgroundColor: c.border, marginVertical: 12 },
    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    paymentBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    paymentIconWrap: { width: 30, height: 30, borderRadius: 9, backgroundColor: c.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
    paymentText: { color: c.textSecondary, fontSize: 13, fontWeight: '700' },
    totalBox: { alignItems: 'flex-end' },
    totalLabel: { color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
    totalValue: { color: GOLD, fontSize: 18, fontWeight: '900', marginTop: 1 },
    nextAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 11, paddingHorizontal: 12, paddingBottom: 11, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgCard, borderRadius: 10, marginHorizontal: -2 },
    nextActionText: { color: GOLD, fontSize: 12, fontWeight: '700' },
    nextActionArrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
    emptyState: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 24 },
    emptyIcon: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgCard, borderWidth: 1, borderColor: '#C9A22728', marginBottom: 20 },
    emptyTitle: { color: c.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptyText: { color: c.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 22 },
  });
}
