import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orderService';
import { Pedido, HistoricoStatusPedido, StatusPedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'OrderTracking'>;
  route: RouteProp<AppStackParamList, 'OrderTracking'>;
};

const STEPS: StatusPedido[] = ['PENDENTE', 'PREPARANDO', 'ENTREGANDO', 'ENTREGUE'];

const STEP_LABELS: Record<StatusPedido, string> = {
  PENDENTE: 'Pedido recebido',
  PREPARANDO: 'Preparando',
  ENTREGANDO: 'Saiu para entrega',
  ENTREGUE: 'Entregue!',
  CANCELADO: 'Cancelado',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_ICONS: Record<StatusPedido, IoniconName> = {
  PENDENTE: 'receipt-outline',
  PREPARANDO: 'flame-outline',
  ENTREGANDO: 'bicycle-outline',
  ENTREGUE: 'checkmark-circle-outline',
  CANCELADO: 'close-circle-outline',
};

export function OrderTrackingScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<HistoricoStatusPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderHistory(orderId),
      ]);
      setPedido(p);
      setHistorico(h);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || !pedido) return <LoadingSpinner fullScreen message="Carregando pedido..." />;

  const isCanceled = pedido.status === 'CANCELADO';
  const currentStep = isCanceled ? -1 : STEPS.indexOf(pedido.status);

  return (
    <View className="flex-1 bg-dark">
      <Header
        title={`Pedido ${formatOrderId(pedido.id)}`}
        onBack={() => navigation.navigate('MainTabs', { screen: 'Pedidos' })}
        rightElement={<OrderStatusBadge status={pedido.status} />}
      />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#E63946" />
        }
      >
        {!isCanceled && (
          <View className="bg-dark-card rounded-2xl p-4 mb-4">
            <Text className="text-offwhite font-bold text-base mb-4">Acompanhamento</Text>
            {STEPS.map((step, index) => {
              const done = index <= currentStep;
              const active = index === currentStep;
              return (
                <View key={step} className="flex-row items-center mb-4">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    done ? 'bg-primary' : 'bg-dark-border'
                  }`}>
                    <Ionicons
                      name={STEP_ICONS[step]}
                      size={20}
                      color={done ? '#F5F0E8' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${done ? 'text-offwhite' : 'text-gray-500'}`}>
                      {STEP_LABELS[step]}
                    </Text>
                    {active && (
                      <Text className="text-primary text-xs font-semibold">Em andamento</Text>
                    )}
                  </View>
                  {done && <Ionicons name="checkmark-circle" size={20} color="#22C55E" />}
                </View>
              );
            })}
          </View>
        )}

        <View className="bg-dark-card rounded-2xl p-4 mb-4">
          <Text className="text-offwhite font-bold mb-3">Informações do pedido</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Pedido feito em</Text>
            <Text className="text-offwhite text-sm">{formatDateTime(pedido.criadoEm)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Pagamento</Text>
            <Text className="text-offwhite text-sm">{pedido.metodoPagamento}</Text>
          </View>
          <View className="h-px bg-dark-border my-2" />
          <View className="flex-row justify-between">
            <Text className="text-offwhite font-bold">Total</Text>
            <Text className="text-accent font-bold">{formatCurrency(pedido.total)}</Text>
          </View>
        </View>

        {historico.length > 0 && (
          <View className="bg-dark-card rounded-2xl p-4 mb-8">
            <Text className="text-offwhite font-bold mb-3">Histórico de status</Text>
            {historico.map((h) => (
              <View key={h.id} className="flex-row items-center mb-2">
                <Text className="text-gray-400 text-xs w-36">{formatDateTime(h.registradoEm)}</Text>
                <OrderStatusBadge status={h.status} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {pedido.status === 'ENTREGUE' && (
        <View className="px-4 pb-8 pt-4 bg-dark border-t border-dark-border">
          <Button
            title="Avaliar pedido"
            variant="outline"
            onPress={() => navigation.navigate('Review', { orderId: pedido.id })}
          />
        </View>
      )}
    </View>
  );
}
