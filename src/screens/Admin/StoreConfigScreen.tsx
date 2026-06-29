import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { ConfiguracaoLoja } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

export function AdminStoreConfigScreen({ navigation }: Props) {
  const [configs, setConfigs] = useState<ConfiguracaoLoja[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminService.getConfig();
      setConfigs(data);
      const initial: Record<string, string> = {};
      data.forEach((c) => { initial[c.chave] = c.valor; });
      setEditedValues(initial);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(config: ConfiguracaoLoja) {
    const novoValor = editedValues[config.chave];
    if (novoValor === config.valor) return;

    setSavingKey(config.chave);
    try {
      const updated = await adminService.updateConfig({
        chave: config.chave,
        valor: novoValor,
        descricao: config.descricao ?? undefined,
      });
      setConfigs((prev) => prev.map((c) => (c.chave === config.chave ? updated : c)));
      Alert.alert('Salvo', `"${config.chave}" atualizado com sucesso.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header title="Configurações da Loja" onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#E63946"
          />
        }
      >
        {configs.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="settings-outline" size={64} color="#6B7280" />
            <Text className="text-offwhite text-lg font-bold mt-4 mb-1">
              Nenhuma configuração
            </Text>
            <Text className="text-gray-400 text-center">
              Adicione configurações via backend.
            </Text>
          </View>
        ) : (
          configs.map((config) => {
            const isDirty = editedValues[config.chave] !== config.valor;
            return (
              <View key={config.chave} className="bg-dark-card rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-accent font-bold text-sm">{config.chave}</Text>
                  {isDirty && (
                    <TouchableOpacity
                      onPress={() => handleSave(config)}
                      disabled={savingKey === config.chave}
                      className="flex-row items-center gap-1 bg-primary px-3 py-1 rounded-lg"
                    >
                      <Ionicons
                        name={savingKey === config.chave ? 'sync-outline' : 'checkmark-outline'}
                        size={14}
                        color="#F5F0E8"
                      />
                      <Text className="text-offwhite text-xs font-semibold">Salvar</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {config.descricao && (
                  <Text className="text-gray-400 text-xs mb-2">{config.descricao}</Text>
                )}
                <TextInput
                  value={editedValues[config.chave] ?? config.valor}
                  onChangeText={(t) =>
                    setEditedValues((prev) => ({ ...prev, [config.chave]: t }))
                  }
                  className="text-offwhite bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm"
                  style={{ color: '#F5F0E8' }}
                  placeholderTextColor="#6B7280"
                  multiline={config.valor.length > 60}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
