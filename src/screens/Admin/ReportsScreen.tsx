import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, RelatorioVendas, RelatorioProduto } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { formatCurrency } from '../../utils/helpers';

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendentes',
  PREPARANDO: 'Preparando',
  ENTREGANDO: 'Em entrega',
  ENTREGUE: 'Entregues',
  CANCELADO: 'Cancelados',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: '#F59E0B',
  PREPARANDO: '#F4A261',
  ENTREGANDO: '#3B82F6',
  ENTREGUE: '#2A9D8F',
  CANCELADO: '#E63946',
};

type Periodo = 'hoje' | 'semana' | 'mes';

interface MetricCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
  bg: string;
}

function MetricCard({ icon, label, value, color, bg }: MetricCardProps) {
  return (
    <View style={[ms.card, { flex: 1 }]}>
      <View style={[ms.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={ms.label}>{label}</Text>
      <Text style={ms.value}>{value}</Text>
    </View>
  );
}

const ms = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
});

export function AdminReportsScreen() {
  const [vendas, setVendas] = useState<RelatorioVendas | null>(null);
  const [produtos, setProdutos] = useState<RelatorioProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>('semana');

  const load = useCallback(async () => {
    try {
      const hoje = new Date();
      const ate = hoje.toISOString().split('T')[0];
      let de: string;

      if (periodo === 'hoje') {
        de = ate;
      } else if (periodo === 'semana') {
        const d = new Date(hoje);
        d.setDate(d.getDate() - 7);
        de = d.toISOString().split('T')[0];
      } else {
        const d = new Date(hoje);
        d.setDate(d.getDate() - 30);
        de = d.toISOString().split('T')[0];
      }

      const [vendasData, produtosData] = await Promise.all([
        adminService.getSalesReport({ de, ate }),
        adminService.getProductsReport(),
      ]);
      setVendas(vendasData);
      setProdutos(produtosData);
    } catch {
      // dados podem não estar disponíveis
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: '7 dias' },
    { key: 'mes', label: '30 dias' },
  ];

  const ticketMedio =
    vendas && vendas.totalPedidos > 0 ? vendas.receita / vendas.totalPedidos : 0;

  const cancelados =
    vendas?.porStatus.find((s) => s.status === 'CANCELADO')?.quantidade ?? 0;

  return (
    <View style={s.root}>
      <Header title="Relatórios" subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#E63946"
          />
        }
      >
        {/* Segment control */}
        <View style={s.segment}>
          {periodos.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriodo(p.key)}
              style={[s.segmentBtn, periodo === p.key && s.segmentBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[s.segmentText, periodo === p.key && s.segmentTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {vendas ? (
          <>
            {/* Metric grid 2x2 */}
            <View style={s.metricsRow}>
              <MetricCard
                icon="cart-outline"
                label="Total pedidos"
                value={String(vendas.totalPedidos)}
                color="#F4A261"
                bg="rgba(244,162,97,0.12)"
              />
              <MetricCard
                icon="cash-outline"
                label="Receita"
                value={formatCurrency(vendas.receita)}
                color="#2A9D8F"
                bg="rgba(42,157,143,0.12)"
              />
            </View>
            <View style={[s.metricsRow, { marginTop: 12 }]}>
              <MetricCard
                icon="trending-up-outline"
                label="Ticket médio"
                value={formatCurrency(ticketMedio)}
                color="#457B9D"
                bg="rgba(69,123,157,0.12)"
              />
              <MetricCard
                icon="close-circle-outline"
                label="Cancelamentos"
                value={String(cancelados)}
                color="#E63946"
                bg="rgba(230,57,70,0.12)"
              />
            </View>

            {/* Status breakdown */}
            {vendas.porStatus.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Pedidos por status</Text>
                {vendas.porStatus.map(({ status, quantidade }) => {
                  const pct = vendas.totalPedidos > 0 ? quantidade / vendas.totalPedidos : 0;
                  const color = STATUS_COLOR[status] ?? '#A0A0A0';
                  return (
                    <View key={status} style={s.statusRow}>
                      <View style={[s.statusDot, { backgroundColor: color }]} />
                      <Text style={s.statusLabel}>{STATUS_LABEL[status] ?? status}</Text>
                      <View style={s.statusBarWrap}>
                        <View style={[s.statusBar, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[s.statusQty, { color }]}>{quantidade}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={s.emptyCard}>
            <Ionicons name="bar-chart-outline" size={48} color="#2A2A2A" />
            <Text style={s.emptyTitle}>Sem dados no período</Text>
            <Text style={s.emptyText}>Dados de vendas não disponíveis para o período selecionado.</Text>
          </View>
        )}

        {/* Top products */}
        {produtos.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Produtos mais vendidos</Text>
            {produtos.slice(0, 10).map((p, index) => (
              <View key={p.produto.id} style={s.productRow}>
                <View style={[s.rankBadge, index < 3 && s.rankBadgeTop]}>
                  <Text style={[s.rankText, index < 3 && s.rankTextTop]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={s.productName} numberOfLines={1}>{p.produto.nome}</Text>
                <View style={s.qtyBadge}>
                  <Text style={s.qtyText}>{p.quantidade} un.</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#E63946',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentText: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    width: 90,
  },
  statusBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  statusQty: {
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: {
    backgroundColor: 'rgba(244,162,97,0.15)',
  },
  rankText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '800',
  },
  rankTextTop: {
    color: '#F4A261',
  },
  productName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
  },
  qtyBadge: {
    backgroundColor: '#242424',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qtyText: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#666666',
    fontSize: 13,
    textAlign: 'center',
  },
});
