import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { Produto } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function AdminProductsManagementScreen({ navigation }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await productService.getProducts();
      setProdutos(data.sort((a, b) => a.nome.localeCompare(b.nome)));
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

  function handleDelete(produto: Produto) {
    Alert.alert(
      'Remover produto',
      `Deseja remover "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteProduct(produto.id);
              setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
            } catch (e: any) {
              Alert.alert('Erro', e.message);
            }
          },
        },
      ],
    );
  }

  async function handleToggleDisponivel(produto: Produto) {
    try {
      const updated = await adminService.updateProduct(produto.id, {
        disponivel: !produto.disponivel,
      });
      setProdutos((prev) => prev.map((p) => (p.id === produto.id ? { ...p, ...updated } : p)));
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header
        title="Produtos"
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminProductForm', {})}
            className="p-2"
          >
            <Ionicons name="add-circle" size={28} color="#E63946" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={produtos}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="cube-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">
              Nenhum produto cadastrado
            </Text>
            <Text className="text-gray-400 text-center">
              Toque em "+" para adicionar o primeiro produto.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-dark-card rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-1 mr-3">
                <Text className="text-offwhite font-bold text-base" numberOfLines={1}>
                  {item.nome}
                </Text>
                {item.categoria && (
                  <Text className="text-gray-400 text-xs mt-0.5">{item.categoria.nome}</Text>
                )}
              </View>
              <Text className="text-accent font-bold">{formatCurrency(item.preco)}</Text>
            </View>

            {item.descricao ? (
              <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
                {item.descricao}
              </Text>
            ) : null}

            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => handleToggleDisponivel(item)}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  item.disponivel ? 'bg-green-900' : 'bg-gray-800'
                }`}
              >
                <Ionicons
                  name={item.disponivel ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={item.disponivel ? '#22C55E' : '#6B7280'}
                />
                <Text
                  className={`text-xs font-semibold ${
                    item.disponivel ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {item.disponivel ? 'Disponível' : 'Indisponível'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminProductForm', { productId: item.id })}
                  className="w-9 h-9 bg-dark-border rounded-xl items-center justify-center"
                >
                  <Ionicons name="create-outline" size={18} color="#F4A261" />
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
