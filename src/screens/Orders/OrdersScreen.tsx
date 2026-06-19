import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orderService';
import { Pedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

const METODO_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  PIX: 'qr-code-outline',
  CARTAO: 'card-outline',
  DINHEIRO: 'cash-outline',
};

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function OrdersScreen({ navigation }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderService.getMyOrders();
      setPedidos(data.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header title="Meus pedidos" />

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#8B1A1A"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="receipt-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhum pedido ainda</Text>
            <Text className="text-gray-400 text-center">Faça seu primeiro pedido!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
            className="bg-dark-card rounded-2xl p-4 mb-3"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="receipt-outline" size={16} color="#C8943C" />
                <Text className="text-offwhite font-bold">Pedido {formatOrderId(item.id)}</Text>
              </View>
              <OrderStatusBadge status={item.status} />
            </View>
            <View className="flex-row items-center gap-1 mb-2">
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text className="text-gray-400 text-xs">{formatDateTime(item.criadoEm)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'} size={14} color="#6B7280" />
                <Text className="text-gray-400 text-sm">{item.metodoPagamento}</Text>
              </View>
              <Text className="text-accent font-bold">{formatCurrency(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
