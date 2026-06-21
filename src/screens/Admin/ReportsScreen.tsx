import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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

function MetricCard({
  icon,
  label,
  value,
  color = '#C8943C',
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="bg-dark-card rounded-2xl p-4 flex-1">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}22` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className="text-offwhite text-lg font-bold">{value}</Text>
    </View>
  );
}

export function AdminReportsScreen() {
  const [vendas, setVendas] = useState<RelatorioVendas | null>(null);
  const [produtos, setProdutos] = useState<RelatorioProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('semana');

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
      // silencia — dados podem não estar disponíveis
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

  const periodos: { key: 'hoje' | 'semana' | 'mes'; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: '7 dias' },
    { key: 'mes', label: '30 dias' },
  ];

  return (
    <View className="flex-1 bg-dark">
      <Header title="Relatórios" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#8B1A1A"
          />
        }
      >
        <View className="flex-row gap-2 mb-6">
          {periodos.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriodo(p.key)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                periodo === p.key ? 'bg-primary border-primary' : 'bg-dark-card border-dark-border'
              }`}
            >
              <Text className={`text-sm font-bold ${periodo === p.key ? 'text-offwhite' : 'text-gray-400'}`}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {vendas ? (
          <>
            <View className="flex-row gap-3 mb-3">
              <MetricCard
                icon="cart-outline"
                label="Total de pedidos"
                value={String(vendas.totalPedidos)}
                color="#C8943C"
              />
              <MetricCard
                icon="cash-outline"
                label="Receita"
                value={formatCurrency(vendas.receita)}
                color="#22C55E"
              />
            </View>

            {vendas.porStatus.length > 0 && (
              <View className="bg-dark-card rounded-2xl p-4 mb-6">
                <Text className="text-offwhite font-bold mb-3">Pedidos por status</Text>
                {vendas.porStatus.map(({ status, quantidade }) => (
                  <View
                    key={status}
                    className="flex-row justify-between items-center py-2 border-b border-dark-border"
                  >
                    <Text className="text-gray-400 text-sm">{STATUS_LABEL[status] ?? status}</Text>
                    <Text className="text-offwhite font-semibold">{quantidade}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="bg-dark-card rounded-2xl p-6 items-center mb-6">
            <Ionicons name="bar-chart-outline" size={40} color="#6B7280" />
            <Text className="text-gray-400 text-sm mt-3 text-center">
              Dados de vendas não disponíveis para o período selecionado.
            </Text>
          </View>
        )}

        {produtos.length > 0 && (
          <View className="bg-dark-card rounded-2xl p-4">
            <Text className="text-offwhite font-bold mb-3">Produtos mais vendidos</Text>
            {produtos.slice(0, 10).map((p, index) => (
              <View
                key={p.produto.id}
                className="flex-row items-center py-2.5 border-b border-dark-border"
              >
                <View className="w-7 h-7 rounded-full bg-dark-border items-center justify-center mr-3">
                  <Text className="text-accent text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-offwhite flex-1 text-sm" numberOfLines={1}>
                  {p.produto.nome}
                </Text>
                <Text className="text-offwhite text-sm font-semibold">{p.quantidade} un.</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
