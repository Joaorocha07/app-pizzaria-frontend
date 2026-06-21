import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { marketingService } from '../../services/marketingService';
import { adminService } from '../../services/adminService';
import { Banner } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

export function AdminBannersManagementScreen({ navigation }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await marketingService.getBanners();
      setBanners(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(banner: Banner) {
    Alert.alert('Remover banner', `Deseja remover "${banner.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteBanner(banner.id);
            setBanners((prev) => prev.filter((b) => b.id !== banner.id));
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
        title="Banners"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminBannerForm', {})}
            className="p-2"
          >
            <Ionicons name="add-circle" size={28} color="#8B1A1A" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={banners}
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
            <Ionicons name="image-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">Nenhum banner</Text>
            <Text className="text-gray-400 text-center">Toque em "+" para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-dark-card rounded-2xl overflow-hidden mb-3">
            <Image
              source={{ uri: item.urlImagem }}
              style={{ width: '100%', height: 120 }}
              resizeMode="cover"
            />
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-offwhite font-bold" numberOfLines={1}>{item.titulo}</Text>
                {item.urlLink && (
                  <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{item.urlLink}</Text>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <View className={`px-2 py-0.5 rounded-full ${item.ativo ? 'bg-green-900' : 'bg-gray-800'}`}>
                  <Text className={`text-xs font-semibold ${item.ativo ? 'text-green-400' : 'text-gray-400'}`}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminBannerForm', { bannerId: item.id })}
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
