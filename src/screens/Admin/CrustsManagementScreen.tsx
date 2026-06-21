import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { marketingService } from '../../services/marketingService';
import { adminService } from '../../services/adminService';
import { Borda } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

export function AdminCrustsManagementScreen({ navigation }: Props) {
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await marketingService.getCrusts();
      setBordas(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(borda: Borda) {
    Alert.alert('Remover borda', `Deseja remover "${borda.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteCrust(borda.id);
            setBordas((prev) => prev.filter((b) => b.id !== borda.id));
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
        title="Bordas"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCrustForm', {})}
            className="p-2"
          >
            <Ionicons name="add-circle" size={28} color="#8B1A1A" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={bordas}
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
            <Ionicons name="pizza-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhuma borda</Text>
            <Text className="text-gray-400 text-center">Toque em "+" para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-dark-card rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-dark-border items-center justify-center mr-3">
              <Ionicons name="pizza-outline" size={20} color="#C8943C" />
            </View>
            <View className="flex-1">
              <Text className="text-offwhite font-bold">{item.nome}</Text>
              <Text className="text-accent text-sm font-semibold mt-0.5">
                {formatCurrency(item.preco)}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminCrustForm', { crustId: item.id })}
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
        )}
      />
    </View>
  );
}
