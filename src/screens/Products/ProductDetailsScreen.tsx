import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { Produto, TamanhoProduto, Borda } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ProductDetails'>;
  route: RouteProp<AppStackParamList, 'ProductDetails'>;
};

export function ProductDetailsScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { addItem } = useCart();
  const { colors } = useTheme();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [tamanhos, setTamanhos] = useState<TamanhoProduto[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [selectedTamanho, setSelectedTamanho] = useState<TamanhoProduto | undefined>();
  const [selectedBorda, setSelectedBorda] = useState<Borda | undefined>();
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProduct(productId),
      productService.getProductSizes(productId),
      marketingService.getCrusts(),
    ])
      .then(([p, t, b]) => {
        setProduto(p);
        setTamanhos(t);
        setBordas(b);
        if (t.length > 0) setSelectedTamanho(t[0]);
      })
      .catch((e) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || !produto) return <LoadingSpinner fullScreen />;

  const precoBase = selectedTamanho
    ? produto.preco * selectedTamanho.fatorPreco
    : produto.preco;
  const precoFinal = precoBase + (selectedBorda?.preco ?? 0);
  const totalItem = precoFinal * quantidade;

  function handleAddToCart() {
    addItem(produto!, quantidade, selectedTamanho, selectedBorda);
    Alert.alert('Adicionado!', `${produto!.nome} adicionado ao carrinho.`, [
      { text: 'Ver carrinho', onPress: () => navigation.navigate('Cart') },
      { text: 'Continuar', style: 'cancel' },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          {produto.urlImagem ? (
            <Image source={{ uri: produto.urlImagem }} className="w-full h-72" resizeMode="cover" />
          ) : (
            <View className="w-full h-72 items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
              <Ionicons name="pizza-outline" size={80} color={colors.textMuted} />
            </View>
          )}
          <Header
            title=""
            variant="transparent"
            onBack={() => navigation.goBack()}
          />
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-2xl font-bold flex-1 mr-2" style={{ color: colors.text }}>{produto.nome}</Text>
            <Text className="text-accent text-2xl font-bold">{formatCurrency(precoFinal)}</Text>
          </View>

          {produto.descricao && (
            <Text className="text-sm leading-5 mb-4" style={{ color: colors.textSecondary }}>{produto.descricao}</Text>
          )}

          {tamanhos.length > 0 && (
            <View className="mb-4">
              <Text className="font-bold text-base mb-2" style={{ color: colors.text }}>Tamanho</Text>
              <View className="flex-row flex-wrap gap-2">
                {tamanhos.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTamanho(t)}
                    className={`px-4 py-2 rounded-md border ${
                      selectedTamanho?.id === t.id
                        ? 'bg-primary border-primary'
                        : ''
                    }`}
                    style={selectedTamanho?.id === t.id ? undefined : { backgroundColor: colors.bgCard, borderColor: colors.border }}
                  >
                    <Text className={selectedTamanho?.id === t.id ? 'text-offwhite font-bold' : ''} style={selectedTamanho?.id === t.id ? undefined : { color: colors.textSecondary }}>
                      {t.nome}
                    </Text>
                    <Text className="text-xs" style={{ color: selectedTamanho?.id === t.id ? 'rgba(244,237,225,0.75)' : colors.textMuted }}>
                      {formatCurrency(produto.preco * t.fatorPreco)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {bordas.length > 0 && (
            <View className="mb-4">
              <Text className="font-bold text-base mb-2" style={{ color: colors.text }}>Borda recheada</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setSelectedBorda(undefined)}
                  className={`px-4 py-2 rounded-md border ${
                    !selectedBorda ? 'bg-primary border-primary' : ''
                  }`}
                  style={!selectedBorda ? undefined : { backgroundColor: colors.bgCard, borderColor: colors.border }}
                >
                  <Text className={!selectedBorda ? 'text-offwhite font-bold' : ''} style={!selectedBorda ? undefined : { color: colors.textSecondary }}>
                    Sem borda
                  </Text>
                </TouchableOpacity>
                {bordas.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelectedBorda(b)}
                    className={`px-4 py-2 rounded-md border ${
                      selectedBorda?.id === b.id
                        ? 'bg-primary border-primary'
                        : ''
                    }`}
                    style={selectedBorda?.id === b.id ? undefined : { backgroundColor: colors.bgCard, borderColor: colors.border }}
                  >
                    <Text className={selectedBorda?.id === b.id ? 'text-offwhite font-bold' : ''} style={selectedBorda?.id === b.id ? undefined : { color: colors.textSecondary }}>
                      {b.nome}
                    </Text>
                    <Text className="text-xs" style={{ color: selectedBorda?.id === b.id ? 'rgba(244,237,225,0.75)' : colors.textMuted }}>
                      +{formatCurrency(b.preco)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-4 rounded-md p-4" style={{ backgroundColor: colors.bgElevated }}>
            <Text className="font-bold" style={{ color: colors.text }}>Quantidade</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded items-center justify-center" style={{ backgroundColor: colors.bgInput }}
              >
                <Text className="text-lg font-bold" style={{ color: colors.text }}>−</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold w-6 text-center" style={{ color: colors.text }}>{quantidade}</Text>
              <TouchableOpacity
                onPress={() => setQuantidade((q) => q + 1)}
                className="w-9 h-9 bg-primary rounded items-center justify-center"
              >
                <Text className="text-offwhite text-lg font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-8 pt-4 border-t" style={{ backgroundColor: colors.bg, borderTopColor: colors.border }}>
        <Button
          title={`Adicionar ao carrinho — ${formatCurrency(totalItem)}`}
          onPress={handleAddToCart}
          size="lg"
        />
      </View>
    </View>
  );
}
