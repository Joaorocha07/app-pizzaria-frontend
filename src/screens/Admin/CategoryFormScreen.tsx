import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminService } from '../../services/adminService';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors } = useTheme();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('');
  const [ordem, setOrdem] = useState('0');
  const [ativo, setAtivo] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [urlImagem, setUrlImagem] = useState('');

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
          if (cat.urlImagem) { setUrlImagem(cat.urlImagem); setImageUri(cat.urlImagem); }
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, categoryId]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Permita o acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) { setImageUri(result.assets[0].uri); setUrlImagem(result.assets[0].uri); }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Permita o acesso à câmera.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) { setImageUri(result.assets[0].uri); setUrlImagem(result.assets[0].uri); }
  }

  function handleImageOptions() {
    Alert.alert('Imagem da categoria', 'Como você quer adicionar a imagem?', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    const ordemNum = parseInt(ordem, 10);
    if (isNaN(ordemNum)) return Alert.alert('Atenção', 'Ordem deve ser um número.');
    const remoteImageUrl = urlImagem.trim().startsWith('http') ? urlImagem.trim() : undefined;

    setSaving(true);
    try {
      const payload = { nome: nome.trim(), icone: icone.trim() || undefined, urlImagem: remoteImageUrl, ordem: ordemNum, ativo };
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
          label="Ícone (opcional)"
          placeholder="Ex: 🍕 ou deixe vazio"
          value={icone}
          onChangeText={setIcone}
        />

        {/* Image picker */}
        <TouchableOpacity onPress={handleImageOptions} style={[cf.imgPicker, { backgroundColor: colors.bgInput, borderColor: colors.borderStrong }]} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={cf.imgPreview} resizeMode="cover" />
          ) : (
            <View style={cf.imgPlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={[cf.imgPlaceholderText, { color: colors.textMuted }]}>Adicionar imagem</Text>
            </View>
          )}
          <View style={cf.imgOverlay}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Input
          label="Ordem de exibição"
          placeholder="0"
          value={ordem}
          onChangeText={setOrdem}
          keyboardType="number-pad"
        />
        <View className="flex-row items-center justify-between rounded-xl p-4 mb-6" style={{ backgroundColor: colors.bgElevated }}>
          <Text className="font-semibold" style={{ color: colors.text }}>Categoria ativa</Text>
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

const cf = StyleSheet.create({
  imgPicker: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  imgPreview: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imgPlaceholderText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '600' },
  imgOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: '#C0392B', borderRadius: 12,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
});
