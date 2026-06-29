import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { uploadService } from '../../services/uploadService';
import { Categoria } from '../../types';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminProductForm'>;
};

function FloatingInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  prefix,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
  prefix?: string;
  maxLength?: number;
}) {
  const { colors } = useTheme();
  const fi = React.useMemo(() => createFiStyles(colors), [colors]);
  return (
    <View style={fi.wrapper}>
      <Text style={fi.label}>{label}</Text>
      <View style={[fi.row, multiline && fi.multilineRow]}>
        {prefix ? <Text style={fi.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[fi.input, multiline && fi.multilineInput, value ? fi.inputFilled : {}]}
          placeholderTextColor={colors.textMuted}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {maxLength ? (
        <Text style={fi.counter}>{value.length}/{maxLength}</Text>
      ) : null}
    </View>
  );
}

function createFiStyles(c: AppColors) {
  return StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { color: c.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: 16, borderWidth: 1, borderColor: c.borderStrong, paddingHorizontal: 16 },
    multilineRow: { alignItems: 'flex-start', paddingTop: 12 },
    prefix: { color: '#2A9D8F', fontSize: 16, fontWeight: '700', marginRight: 6 },
    input: { flex: 1, color: c.text, fontSize: 15, paddingVertical: 16 },
    inputFilled: { color: c.text },
    multilineInput: { minHeight: 96, paddingVertical: 0 },
    counter: { color: c.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  });
}

export function AdminProductFormScreen({ navigation, route }: Props) {
  const { productId } = route.params ?? {};
  const isEditing = !!productId;
  const { isAdmin } = useAuth();
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [urlImagem, setUrlImagem] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [disponivel, setDisponivel] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const cats = await productService.getCategories();
        setCategorias(cats);

        if (isEditing) {
          const produto = await productService.getProduct(productId!);
          setNome(produto.nome);
          setDescricao(produto.descricao ?? '');
          setUrlImagem(produto.urlImagem ?? '');
          setPreco(String(produto.preco));
          setCategoriaId(produto.categoriaId);
          setDisponivel(produto.disponivel);
          if (produto.urlImagem) setImageUri(produto.urlImagem);
        }
      } catch (e: any) {
        Alert.alert('Erro', e.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [isEditing, productId]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setUrlImagem(result.assets[0].uri);
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
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setUrlImagem(result.assets[0].uri);
    }
  }

  function handleImageOptions() {
    Alert.alert('Imagem do produto', 'Como você quer adicionar a imagem?', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function formatPreco(text: string) {
    const nums = text.replace(/\D/g, '');
    if (!nums) return setPreco('');
    const value = (parseInt(nums, 10) / 100).toFixed(2);
    setPreco(value.replace('.', ','));
  }

  async function handleSave() {
    if (!isAdmin) {
      return Alert.alert('Sem permissão', 'Apenas administradores podem cadastrar ou editar produtos.');
    }
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    const precoNum = Number(preco.replace(',', '.'));
    if (!preco || isNaN(precoNum) || precoNum <= 0) {
      return Alert.alert('Atenção', 'Informe um preço válido.');
    }
    if (!categoriaId) return Alert.alert('Atenção', 'Selecione uma categoria.');

    setSaving(true);
    try {
      let finalImageUrl: string | undefined;

      if (imageUri && !imageUri.startsWith('http')) {
        finalImageUrl = await uploadService.uploadImage(imageUri, 'products');
        console.log('[Upload] URL retornada pelo backend:', finalImageUrl);
      } else if (imageUri?.startsWith('http')) {
        finalImageUrl = imageUri;
      }

      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        urlImagem: finalImageUrl,
        preco: precoNum,
        categoriaId,
        disponivel,
      };

      if (isEditing) {
        await adminService.updateProduct(productId!, payload);
      } else {
        await adminService.createProduct(payload);
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
    <View style={s.root}>
      <Header title={isEditing ? 'Editar produto' : 'Novo produto'} onBack={() => navigation.goBack()} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <TouchableOpacity
          onPress={handleImageOptions}
          style={s.imageArea}
          activeOpacity={0.85}
        >
          {imageUri ? (
            <View style={s.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={s.imagePreview} />
              <View style={s.imageOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
                <Text style={s.imageOverlayText}>Alterar</Text>
              </View>
              <TouchableOpacity
                style={s.imageRemoveBtn}
                onPress={() => { setImageUri(null); setUrlImagem(''); }}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.imagePlaceholder}>
              <View style={s.cameraIconWrapper}>
                <Ionicons name="camera-outline" size={36} color="#666666" />
              </View>
              <Text style={s.imagePlaceholderText}>Toque para adicionar imagem</Text>
              <Text style={s.imagePlaceholderSub}>JPG, PNG até 5MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nome */}
        <FloatingInput
          label="Nome *"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Pizza Margherita"
        />

        {/* Descrição */}
        <FloatingInput
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva os ingredientes, tamanhos e diferenciais..."
          multiline
          maxLength={500}
        />

        {/* Preço */}
        <FloatingInput
          label="Preço *"
          value={preco}
          onChangeText={formatPreco}
          placeholder="0,00"
          keyboardType="decimal-pad"
          prefix="R$"
        />

        {/* Categoria */}
        <Text style={s.sectionLabel}>Categoria *</Text>
        <View style={s.catGrid}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoriaId(cat.id)}
              style={[
                s.catChip,
                categoriaId === cat.id && s.catChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={[s.catChipText, categoriaId === cat.id && s.catChipTextActive]}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disponível toggle */}
        <TouchableOpacity
          onPress={() => setDisponivel((v) => !v)}
          style={[s.toggleRow, disponivel && s.toggleRowActive]}
          activeOpacity={0.8}
        >
          <View style={[s.toggleIconWrapper, { backgroundColor: disponivel ? 'rgba(42,157,143,0.15)' : 'rgba(102,102,102,0.15)' }]}>
            <Ionicons
              name={disponivel ? 'checkmark-circle' : 'pause-circle-outline'}
              size={22}
              color={disponivel ? '#2A9D8F' : '#666666'}
            />
          </View>
          <View style={s.toggleTextWrapper}>
            <Text style={[s.toggleLabel, disponivel && s.toggleLabelActive]}>
              {disponivel ? 'Disponível para venda' : 'Indisponível para venda'}
            </Text>
            <Text style={s.toggleSub}>
              {disponivel ? 'Produto visível no cardápio' : 'Produto oculto do cardápio'}
            </Text>
          </View>

          {/* Custom switch track */}
          <View style={[s.switchTrack, disponivel && s.switchTrackActive]}>
            <View style={[s.switchThumb, disponivel && s.switchThumbActive]} />
          </View>
        </TouchableOpacity>

        <Button
          title={isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          onPress={handleSave}
          loading={saving}
          size="lg"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 48 },
    imageArea: { marginBottom: 24, borderRadius: 20, overflow: 'hidden', height: 200 },
    imagePlaceholder: { height: 200, backgroundColor: c.bgInput, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center', gap: 8 },
    cameraIconWrapper: { width: 68, height: 68, borderRadius: 34, backgroundColor: c.bgElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    imagePlaceholderText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    imagePlaceholderSub: { color: c.textMuted, fontSize: 12 },
    imagePreviewWrapper: { height: 200, position: 'relative' },
    imagePreview: { width: '100%', height: 200, borderRadius: 20 },
    imageOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6 },
    imageOverlayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    imageRemoveBtn: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#E63946', alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { color: c.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    catChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: c.bgInput, borderWidth: 1, borderColor: c.borderStrong },
    catChipActive: { backgroundColor: 'rgba(230,57,70,0.15)', borderColor: '#E63946' },
    catChipText: { color: c.textSecondary, fontSize: 13, fontWeight: '600' },
    catChipTextActive: { color: '#E63946' },
    toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: c.borderStrong, gap: 12 },
    toggleRowActive: { borderColor: 'rgba(42,157,143,0.3)', backgroundColor: 'rgba(42,157,143,0.06)' },
    toggleIconWrapper: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    toggleTextWrapper: { flex: 1 },
    toggleLabel: { color: c.textSecondary, fontSize: 14, fontWeight: '700' },
    toggleLabelActive: { color: c.text },
    toggleSub: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: c.borderStrong, justifyContent: 'center', paddingHorizontal: 2 },
    switchTrackActive: { backgroundColor: '#2A9D8F' },
    switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: c.textMuted, alignSelf: 'flex-start' },
    switchThumbActive: { backgroundColor: '#FFFFFF', alignSelf: 'flex-end', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  });
}
