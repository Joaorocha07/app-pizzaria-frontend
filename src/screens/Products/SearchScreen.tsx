import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { productService } from '../../services/productService';
import { Produto } from '../../types';
import { ProductCard } from '../../components/specific/ProductCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setProdutos([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ busca: query, disponivel: true });
        setProdutos(data);
      } catch (e: any) {
        console.error(e.message);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-offwhite text-2xl font-bold mb-3">Buscar</Text>
        <View className="bg-dark-card border border-dark-border rounded-xl flex-row items-center px-4">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-offwhite py-3 text-base"
            placeholder="Buscar pizzas, bebidas..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            query.length >= 2 ? (
              <View className="items-center py-12">
                <Text className="text-4xl mb-3">😕</Text>
                <Text className="text-gray-400 text-base">Nenhum produto encontrado</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard
              produto={item}
              onPress={(p) => navigation.navigate('ProductDetails', { productId: p.id })}
            />
          )}
        />
      )}
    </View>
  );
}
