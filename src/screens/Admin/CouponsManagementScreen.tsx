import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { Cupom } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function AdminCouponsManagementScreen({ navigation }: Props) {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminService.getCoupons();
      setCupons(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(cupom: Cupom) {
    Alert.alert('Remover cupom', `Deseja remover o cupom "${cupom.codigo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteCoupon(cupom.id);
            setCupons((prev) => prev.filter((c) => c.id !== cupom.id));
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header
        title="Cupons"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCouponForm', {})}
            className="p-2"
          >
            <Ionicons name="add-circle" size={28} color="#8B1A1A" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={cupons}
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
            <Ionicons name="pricetag-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhum cupom</Text>
            <Text className="text-gray-400 text-center">Toque em "+" para criar um cupom.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-dark-card rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="pricetag-outline" size={16} color="#C8943C" />
                <Text className="text-offwhite font-bold text-base">{item.codigo}</Text>
              </View>
              <View className={`px-2 py-0.5 rounded-full ${item.ativo ? 'bg-green-900' : 'bg-gray-800'}`}>
                <Text className={`text-xs font-semibold ${item.ativo ? 'text-green-400' : 'text-gray-400'}`}>
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4 mb-2">
              <Text className="text-accent font-bold">
                {item.tipoDesconto === 'PERCENTUAL'
                  ? `${item.valorDesconto}% OFF`
                  : `${formatCurrency(item.valorDesconto)} OFF`}
              </Text>
              {item.limiteUso && (
                <Text className="text-gray-400 text-xs">Limite: {item.limiteUso} usos</Text>
              )}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-gray-400 text-xs">
                {formatDate(item.validoDe)} → {formatDate(item.validoAte)}
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminCouponForm', { couponId: item.id })}
                  className="w-9 h-9 bg-dark-border rounded-xl items-center justify-center"
                >
                  <Ionicons name="create-outline" size={18} color="#C8943C" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  className="w-9 h-9 bg-red-900/30 rounded-xl items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
