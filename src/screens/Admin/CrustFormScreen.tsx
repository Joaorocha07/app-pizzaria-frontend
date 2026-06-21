import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { adminService } from '../../services/adminService';
import { marketingService } from '../../services/marketingService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminCrustForm'>;
};

export function AdminCrustFormScreen({ navigation, route }: Props) {
  const { crustId } = route.params ?? {};
  const isEditing = !!crustId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    marketingService
      .getCrusts()
      .then((bordas) => {
        const borda = bordas.find((b) => b.id === crustId);
        if (borda) {
          setNome(borda.nome);
          setPreco(String(borda.preco));
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, crustId]);

  async function handleSave() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum < 0) return Alert.alert('Atenção', 'Informe um preço válido.');

    setSaving(true);
    try {
      const payload = { nome: nome.trim(), preco: precoNum };
      if (isEditing) {
        await adminService.updateCrust(crustId!, payload);
      } else {
        await adminService.createCrust(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header
        title={isEditing ? 'Editar borda' : 'Nova borda'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="Nome *" placeholder="Ex: Catupiry" value={nome} onChangeText={setNome} />
        <Input
          label="Preço *"
          placeholder="0,00"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          leftIcon={<Text className="text-gray-400">R$</Text>}
        />
        <Button
          title={isEditing ? 'Salvar alterações' : 'Criar borda'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
