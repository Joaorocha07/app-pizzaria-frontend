import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { notificationService } from '../../services/notificationService';
import { Notificacao } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Notificacoes'>;
};

export function NotificationsScreen({ navigation }: Props) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotificacoes(data.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleMarkRead(id: number) {
    try {
      await notificationService.markAsRead(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      );
    } catch (e: any) {
      console.error(e.message);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary font-bold text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-offwhite text-xl font-bold">Notificações</Text>
      </View>

      <FlatList
        data={notificacoes}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#8B1A1A" />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">🔔</Text>
            <Text className="text-offwhite text-base font-bold">Nenhuma notificação</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => !item.lida && handleMarkRead(item.id)}
            className={`rounded-2xl p-4 mb-3 ${item.lida ? 'bg-dark-card' : 'bg-dark-card border border-primary'}`}
            activeOpacity={item.lida ? 1 : 0.8}
          >
            <View className="flex-row items-start gap-3">
              {!item.lida && (
                <View className="w-2 h-2 rounded-full bg-primary mt-2" />
              )}
              <View className="flex-1">
                <Text className={`font-bold text-base ${item.lida ? 'text-gray-400' : 'text-offwhite'}`}>
                  {item.titulo}
                </Text>
                <Text className={`text-sm mt-1 ${item.lida ? 'text-gray-600' : 'text-gray-300'}`}>
                  {item.mensagem}
                </Text>
                <Text className="text-gray-500 text-xs mt-2">{formatDateTime(item.criadoEm)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
