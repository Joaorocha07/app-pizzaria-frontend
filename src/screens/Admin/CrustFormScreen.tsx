import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminService } from '../../services/adminService';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors } = useTheme();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [urlImagem, setUrlImagem] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    marketingService
      .getCrusts()
      .then((bordas) => {
        const borda = bordas.find((b) => b.id === crustId);
        if (borda) {
          setNome(borda.nome);
          setPreco(String(borda.preco));
          if (borda.urlImagem) { setUrlImagem(borda.urlImagem); setImageUri(borda.urlImagem); }
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, crustId]);

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
    Alert.alert('Imagem da borda', 'Como você quer adicionar a imagem?', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum < 0) return Alert.alert('Atenção', 'Informe um preço válido.');
    const remoteImageUrl = urlImagem.trim().startsWith('http') ? urlImagem.trim() : undefined;

    setSaving(true);
    try {
      const payload = { nome: nome.trim(), preco: precoNum, urlImagem: remoteImageUrl };
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
