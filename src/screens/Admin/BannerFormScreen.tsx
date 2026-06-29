import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
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
  route: RouteProp<AppStackParamList, 'AdminBannerForm'>;
};

export function AdminBannerFormScreen({ navigation, route }: Props) {
  const { bannerId } = route.params ?? {};
  const isEditing = !!bannerId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!isEditing) return;
    marketingService
      .getBanners()
      .then((banners) => {
        const b = banners.find((x) => x.id === bannerId);
        if (b) {
          setTitulo(b.titulo);
          setUrlImagem(b.urlImagem);
          setUrlLink(b.urlLink ?? '');
          setAtivo(b.ativo);
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, bannerId]);

  async function handleSave() {
    if (!titulo.trim()) return Alert.alert('Atenção', 'Título é obrigatório.');
    if (!urlImagem.trim()) return Alert.alert('Atenção', 'URL da imagem é obrigatória.');

    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        urlImagem: urlImagem.trim(),
        urlLink: urlLink.trim() || undefined,
        ativo,
      };
      if (isEditing) {
        await adminService.updateBanner(bannerId!, payload);
      } else {
        await adminService.createBanner(payload);
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
        title={isEditing ? 'Editar banner' : 'Novo banner'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="Título *" placeholder="Ex: Promoção de verão" value={titulo} onChangeText={setTitulo} />
        <Input
          label="URL da imagem *"
          placeholder="https://..."
          value={urlImagem}
          onChangeText={setUrlImagem}
          keyboardType="url"
          autoCapitalize="none"
        />
        <Input
          label="URL do link (opcional)"
          placeholder="https://..."
          value={urlLink}
          onChangeText={setUrlLink}
          keyboardType="url"
          autoCapitalize="none"
        />
        <View className="flex-row items-center justify-between bg-dark-card rounded-xl p-4 mb-6">
          <Text className="text-offwhite font-semibold">Banner ativo</Text>
          <Switch
            value={ativo}
            onValueChange={setAtivo}
            trackColor={{ false: '#374151', true: '#7F1212' }}
            thumbColor={ativo ? '#E63946' : '#6B7280'}
          />
        </View>
        <Button
          title={isEditing ? 'Salvar alterações' : 'Criar banner'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
