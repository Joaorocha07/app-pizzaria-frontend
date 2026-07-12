import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { Categoria } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

export function AdminCategoriesManagementScreen({ navigation }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await productService.getCategories();
      setCategorias(data.sort((a, b) => a.ordem - b.ordem));
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(cat: Categoria) {
    Alert.alert('Remover categoria', `Deseja remover "${cat.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteCategory(cat.id);
            setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
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
        title="Categorias"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCategoryForm', {})}
            className="p-2"
          >
            <Ionicons name="add-circle" size={28} color="#8B1A1A" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={categorias}
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
            <Ionicons name="grid-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhuma categoria</Text>
            <Text className="text-gray-400 text-center">Toque em "+" para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-dark-card rounded-2xl p-4 mb-3 flex-row items-center">
            {item.icone ? (
              <Text className="text-2xl mr-3">{item.icone}</Text>
            ) : (
              <View className="w-10 h-10 rounded-full bg-dark-border items-center justify-center mr-3">
                <Ionicons name="grid-outline" size={20} color="#6B7280" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-offwhite font-bold">{item.nome}</Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <Text className="text-gray-400 text-xs">Ordem: {item.ordem}</Text>
                <View className={`px-2 py-0.5 rounded-full ${item.ativo ? 'bg-green-900' : 'bg-gray-800'}`}>
                  <Text className={`text-xs font-semibold ${item.ativo ? 'text-green-400' : 'text-gray-400'}`}>
                    {item.ativo ? 'Ativa' : 'Inativa'}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminCategoryForm', { categoryId: item.id })}
                className="w-9 h-9 bg-dark-border rounded-xl items-center justify-center"
              >
                <Ionicons name="create-outline" size={18} color="#B8862E" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="w-9 h-9 bg-red-900/30 rounded-xl items-center justify-center"
              >
                <Ionicons name="trash-outline" size={18} color="#A23B3B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
