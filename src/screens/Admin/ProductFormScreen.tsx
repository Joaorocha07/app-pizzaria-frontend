import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Categoria } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminProductForm'>;
};

export function AdminProductFormScreen({ navigation, route }: Props) {
  const { productId } = route.params ?? {};
  const isEditing = !!productId;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
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
        }
      } catch (e: any) {
        Alert.alert('Erro', e.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [isEditing, productId]);

  async function handleSave() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Nome é obrigatório.');
    if (!preco || isNaN(Number(preco.replace(',', '.')))) {
      return Alert.alert('Atenção', 'Informe um preço válido.');
    }
    if (!categoriaId) return Alert.alert('Atenção', 'Selecione uma categoria.');

    setSaving(true);
    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        urlImagem: urlImagem.trim() || undefined,
        preco: Number(preco.replace(',', '.')),
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
    <View className="flex-1 bg-dark">
      <Header title={isEditing ? 'Editar produto' : 'Novo produto'} onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Nome *"
          placeholder="Ex: Pizza Margherita"
          value={nome}
          onChangeText={setNome}
        />

        <Input
          label="Descrição"
          placeholder="Descreva o produto..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
          style={{ textAlignVertical: 'top', minHeight: 80 }}
        />

        <Input
          label="URL da imagem"
          placeholder="https://..."
          value={urlImagem}
          onChangeText={setUrlImagem}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Input
          label="Preço *"
          placeholder="0,00"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          leftIcon={<Text className="text-gray-400">R$</Text>}
        />

        <Text className="text-offwhite text-sm mb-2 font-semibold">Categoria *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoriaId(cat.id)}
              className={`px-4 py-2 rounded-full border ${
                categoriaId === cat.id
                  ? 'bg-primary border-primary'
                  : 'bg-dark-card border-dark-border'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  categoriaId === cat.id ? 'text-offwhite' : 'text-gray-400'
                }`}
              >
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center justify-between bg-dark-card rounded-xl p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle-outline" size={22} color="#C8943C" />
            <Text className="text-offwhite font-semibold">Disponível para venda</Text>
          </View>
          <Switch
            value={disponivel}
            onValueChange={setDisponivel}
            trackColor={{ false: '#374151', true: '#7F1212' }}
            thumbColor={disponivel ? '#8B1A1A' : '#6B7280'}
          />
        </View>

        <Button
          title={isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
