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
    <View className="flex-1 bg-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          {produto.urlImagem ? (
            <Image source={{ uri: produto.urlImagem }} className="w-full h-72" resizeMode="cover" />
          ) : (
            <View className="w-full h-72 bg-dark-border items-center justify-center">
              <Text className="text-8xl">🍕</Text>
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
            <Text className="text-offwhite text-2xl font-bold flex-1 mr-2">{produto.nome}</Text>
            <Text className="text-accent text-2xl font-bold">{formatCurrency(precoFinal)}</Text>
          </View>

          {produto.descricao && (
            <Text className="text-gray-400 text-sm leading-5 mb-4">{produto.descricao}</Text>
          )}

          {tamanhos.length > 0 && (
            <View className="mb-4">
              <Text className="text-offwhite font-bold text-base mb-2">Tamanho</Text>
              <View className="flex-row flex-wrap gap-2">
                {tamanhos.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTamanho(t)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedTamanho?.id === t.id
                        ? 'bg-primary border-primary'
                        : 'bg-dark-card border-dark-border'
                    }`}
                  >
                    <Text className={selectedTamanho?.id === t.id ? 'text-offwhite font-bold' : 'text-gray-400'}>
                      {t.nome}
                    </Text>
                    <Text className={`text-xs ${selectedTamanho?.id === t.id ? 'text-offwhite/70' : 'text-gray-500'}`}>
                      {formatCurrency(produto.preco * t.fatorPreco)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {bordas.length > 0 && (
            <View className="mb-4">
              <Text className="text-offwhite font-bold text-base mb-2">Borda recheada</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setSelectedBorda(undefined)}
                  className={`px-4 py-2 rounded-xl border ${
                    !selectedBorda ? 'bg-primary border-primary' : 'bg-dark-card border-dark-border'
                  }`}
                >
                  <Text className={!selectedBorda ? 'text-offwhite font-bold' : 'text-gray-400'}>
                    Sem borda
                  </Text>
                </TouchableOpacity>
                {bordas.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelectedBorda(b)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedBorda?.id === b.id
                        ? 'bg-primary border-primary'
                        : 'bg-dark-card border-dark-border'
                    }`}
                  >
                    <Text className={selectedBorda?.id === b.id ? 'text-offwhite font-bold' : 'text-gray-400'}>
                      {b.nome}
                    </Text>
                    <Text className={`text-xs ${selectedBorda?.id === b.id ? 'text-offwhite/70' : 'text-gray-500'}`}>
                      +{formatCurrency(b.preco)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-4 bg-dark-card rounded-xl p-4">
            <Text className="text-offwhite font-bold">Quantidade</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="w-9 h-9 bg-dark-border rounded-full items-center justify-center"
              >
                <Text className="text-offwhite text-lg font-bold">−</Text>
              </TouchableOpacity>
              <Text className="text-offwhite text-lg font-bold w-6 text-center">{quantidade}</Text>
              <TouchableOpacity
                onPress={() => setQuantidade((q) => q + 1)}
                className="w-9 h-9 bg-primary rounded-full items-center justify-center"
              >
                <Text className="text-offwhite text-lg font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-8 pt-4 bg-dark border-t border-dark-border">
        <Button
          title={`Adicionar ao carrinho — ${formatCurrency(totalItem)}`}
          onPress={handleAddToCart}
          size="lg"
        />
      </View>
    </View>
  );
}
