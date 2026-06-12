import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { orderService } from '../../services/orderService';
import { Pedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

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
      <View className="px-4 pt-14 pb-4">
        <Text className="text-offwhite text-2xl font-bold">Meus pedidos</Text>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#8B1A1A" />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">🍕</Text>
            <Text className="text-offwhite text-lg font-bold mb-1">Nenhum pedido ainda</Text>
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
              <Text className="text-offwhite font-bold">Pedido #{item.id}</Text>
              <OrderStatusBadge status={item.status} />
            </View>
            <Text className="text-gray-400 text-xs mb-2">{formatDateTime(item.criadoEm)}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-400 text-sm">{item.metodoPagamento}</Text>
              <Text className="text-accent font-bold">{formatCurrency(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
