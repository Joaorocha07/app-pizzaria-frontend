import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminCategoryForm'>;
};

export function AdminCategoryFormScreen({ navigation, route }: Props) {
  const { categoryId } = route.params ?? {};
  const isEditing = !!categoryId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('');
  const [ordem, setOrdem] = useState('0');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!isEditing) return;
    productService
      .getCategories()
      .then((cats) => {
        const cat = cats.find((c) => c.id === categoryId);
        if (cat) {
          setNome(cat.nome);
          setIcone(cat.icone ?? '');
          setOrdem(String(cat.ordem));
          setAtivo(cat.ativo);
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, categoryId]);

  async function handleSave() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    const ordemNum = parseInt(ordem, 10);
    if (isNaN(ordemNum)) return Alert.alert('Atenção', 'Ordem deve ser um número.');

    setSaving(true);
    try {
      const payload = { nome: nome.trim(), icone: icone.trim() || undefined, ordem: ordemNum, ativo };
      if (isEditing) {
        await adminService.updateCategory(categoryId!, payload);
      } else {
        await adminService.createCategory(payload);
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
        title={isEditing ? 'Editar categoria' : 'Nova categoria'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="Nome *" placeholder="Ex: Pizzas" value={nome} onChangeText={setNome} />
        <Input
          label="Ícone (emoji)"
          placeholder="Ex: 🍕"
          value={icone}
          onChangeText={setIcone}
        />
        <Input
          label="Ordem de exibição"
          placeholder="0"
          value={ordem}
          onChangeText={setOrdem}
          keyboardType="number-pad"
        />
        <View className="flex-row items-center justify-between bg-dark-card rounded-xl p-4 mb-6">
          <Text className="text-offwhite font-semibold">Categoria ativa</Text>
          <Switch
            value={ativo}
            onValueChange={setAtivo}
            trackColor={{ false: '#374151', true: '#7F1212' }}
            thumbColor={ativo ? '#E63946' : '#6B7280'}
          />
        </View>
        <Button
          title={isEditing ? 'Salvar alterações' : 'Criar categoria'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
