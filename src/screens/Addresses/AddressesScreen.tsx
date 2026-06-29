import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../services/userService';
import { Endereco } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Addresses'>;
};

export function AddressesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await userService.getAddresses();
      setEnderecos(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    Alert.alert('Remover', 'Deseja remover este endereço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.deleteAddress(id);
            load();
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title="Endereços"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddressForm', {})}
            style={{ width: 44, alignItems: 'flex-end' }}
          >
            <Ionicons name="add-circle-outline" size={26} color="#E63946" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={enderecos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#E63946" />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="location-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text className="text-base font-bold mb-1" style={{ color: colors.text }}>Nenhum endereço</Text>
            <Text className="text-center" style={{ color: colors.textSecondary }}>Adicione um endereço de entrega</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.bgElevated }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: colors.text }}>
                  {item.rua}, {item.numero}
                </Text>
                {item.complemento && (
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>{item.complemento}</Text>
                )}
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  {item.bairro} — {item.cidade}/{item.estado}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>CEP: {item.cep}</Text>
                {item.padrao && (
                  <Text className="text-xs font-semibold mt-1" style={{ color: colors.accent }}>Padrão</Text>
                )}
              </View>
              <View className="gap-2 ml-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddressForm', { address: item })}
                  className="rounded-lg px-3 py-1"
                  style={{ backgroundColor: colors.bgInput }}
                >
                  <Text className="text-xs" style={{ color: colors.text }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-red-900/30 rounded-lg px-3 py-1"
                >
                  <Text className="text-danger text-xs">Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <Button
            title="+ Novo endereço"
            variant="outline"
            onPress={() => navigation.navigate('AddressForm', {})}
          />
        }
      />
    </View>
  );
}
