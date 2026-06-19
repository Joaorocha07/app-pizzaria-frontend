import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { BannerCarousel } from '../../components/specific/BannerCarousel';
import { ProductCard } from '../../components/specific/ProductCard';
import { CategoryChip } from '../../components/specific/CategoryChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { Produto, Categoria, Banner } from '../../types';
import { AppTabParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppTabParamList>;
};

export function HomeScreen({ navigation }: Props) {
  const { usuario } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [bannersData, categoriasData] = await Promise.all([
        marketingService.getBanners(),
        productService.getCategories(),
      ]);
      setBanners(bannersData);
      setCategorias(categoriasData);
      const produtosData = await productService.getProducts({ disponivel: true });
      setProdutos(produtosData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCategorySelect = useCallback(async (id: number) => {
    const newId = id === selectedCategory ? null : id;
    setSelectedCategory(newId);
    try {
      const data = await productService.getProducts({
        categoriaId: newId ?? undefined,
        disponivel: true,
      });
      setProdutos(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, [selectedCategory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedCategory(null);
    load();
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen message="Carregando cardápio..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const insets = useSafeAreaInsets();
  const primeiroNome = usuario?.nome.split(' ')[0] ?? 'Cliente';

  return (
    <ScrollView
      className="flex-1 bg-dark"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B1A1A" />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: insets.top + 16 }} className="px-4 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-400 text-sm">Olá, {primeiroNome}</Text>
          <Text className="text-offwhite text-xl font-bold mt-1">O que vai pedir hoje?</Text>
        </View>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Notificacoes')}
          className="bg-dark-card p-3 rounded-full"
        >
          <Ionicons name="notifications-outline" size={22} color="#F5F0E8" />
        </TouchableOpacity>
      </View>

      <BannerCarousel banners={banners} />

      <View className="px-4 mb-4">
        <Text className="text-offwhite font-bold text-lg mb-3">Categorias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categorias.map((cat) => (
            <CategoryChip
              key={cat.id}
              categoria={cat}
              selected={selectedCategory === cat.id}
              onPress={handleCategorySelect}
            />
          ))}
        </ScrollView>
      </View>

      <View className="px-4">
        <Text className="text-offwhite font-bold text-lg mb-3">
          {selectedCategory
            ? categorias.find((c) => c.id === selectedCategory)?.nome ?? 'Produtos'
            : 'Todos os produtos'}
        </Text>
        {produtos.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🍕</Text>
            <Text className="text-gray-400 text-base">Nenhum produto encontrado</Text>
          </View>
        ) : (
          produtos.map((produto) => (
            <ProductCard
              key={produto.id}
              produto={produto}
              onPress={(p) => (navigation as any).navigate('ProductDetails', { productId: p.id })}
            />
          ))
        )}
        <View className="h-8" />
      </View>
    </ScrollView>
  );
}
