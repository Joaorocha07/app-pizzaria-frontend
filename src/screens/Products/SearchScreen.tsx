import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { Produto } from '../../types';
import { ProductCard } from '../../components/specific/ProductCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
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
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-4 border-b border-dark-border">
        <Text className="text-offwhite text-2xl font-bold mb-3">Buscar</Text>
        <View className="bg-dark-card border border-dark-border rounded-xl flex-row items-center px-4">
          <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-offwhite py-3 text-base"
            placeholder="Buscar pizzas, bebidas..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#6B7280"
              onPress={() => setQuery('')}
            />
          )}
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
              <View className="items-center py-16">
                <Ionicons name="search-outline" size={64} color="#6B7280" />
                <Text className="text-offwhite text-base font-bold mt-4">Nenhum produto encontrado</Text>
                <Text className="text-gray-400 text-sm mt-1 text-center">Tente um termo diferente</Text>
              </View>
            ) : (
              <View className="items-center py-16">
                <Ionicons name="pizza-outline" size={64} color="#2A2A2A" />
                <Text className="text-gray-500 text-base mt-4">Digite para buscar</Text>
              </View>
            )
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
