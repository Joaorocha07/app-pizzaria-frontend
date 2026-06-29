import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminService } from '../../services/adminService';
import { marketingService } from '../../services/marketingService';
import { uploadService } from '../../services/uploadService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminBannerForm'>;
};

export function AdminBannerFormScreen({ navigation, route }: Props) {
  const { bannerId } = route.params ?? {};
  const isEditing = !!bannerId;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
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
          setImageUri(b.urlImagem);
          setUrlLink(b.urlLink ?? '');
          setAtivo(b.ativo);
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, bannerId]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 6],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 6],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleImageOptions() {
    Alert.alert('Imagem do banner', 'Como você quer adicionar a imagem?', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!titulo.trim()) return Alert.alert('Atenção', 'Título é obrigatório.');
    if (!imageUri) return Alert.alert('Atenção', 'Adicione uma imagem ao banner.');

    setSaving(true);
    try {
      let finalImageUrl: string;

      if (!imageUri.startsWith('http')) {
        finalImageUrl = await uploadService.uploadImage(imageUri, 'banners');
      } else {
        finalImageUrl = imageUri;
      }

      const payload = {
        titulo: titulo.trim(),
        urlImagem: finalImageUrl,
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={isEditing ? 'Editar banner' : 'Novo banner'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image picker */}
        <TouchableOpacity
          onPress={handleImageOptions}
          style={[s.imageArea, { backgroundColor: colors.bgInput, borderColor: colors.borderStrong }]}
          activeOpacity={0.85}
        >
          {imageUri ? (
            <View style={s.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
              <View style={s.imageOverlay}>
                <Ionicons name="camera" size={22} color="#FFFFFF" />
                <Text style={s.imageOverlayText}>Alterar</Text>
              </View>
              <TouchableOpacity
                style={s.imageRemoveBtn}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.imagePlaceholder}>
              <View style={[s.cameraIconWrapper, { backgroundColor: colors.bgElevated }]}>
                <Ionicons name="image-outline" size={36} color={colors.textMuted} />
              </View>
              <Text style={[s.imagePlaceholderText, { color: colors.textSecondary }]}>
                Toque para adicionar imagem
              </Text>
              <Text style={[s.imagePlaceholderSub, { color: colors.textMuted }]}>
                Proporção recomendada: 16:6 · JPG/PNG até 5 MB
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Título *" placeholder="Ex: Promoção de verão" value={titulo} onChangeText={setTitulo} />
        <Input
          label="URL do link (opcional)"
          placeholder="https://..."
          value={urlLink}
          onChangeText={setUrlLink}
          keyboardType="url"
          autoCapitalize="none"
        />

        <View style={[s.switchRow, { backgroundColor: colors.bgElevated }]}>
          <Text style={[s.switchLabel, { color: colors.text }]}>Banner ativo</Text>
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

const s = StyleSheet.create({
  imageArea: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagePlaceholderSub: {
    fontSize: 12,
  },
  imagePreviewWrapper: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  switchLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
});
