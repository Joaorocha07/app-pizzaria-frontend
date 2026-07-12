import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { Produto } from '../../types';
import { ProductCard } from '../../components/specific/ProductCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, radius } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
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
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={s.title}>Buscar</Text>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={s.input}
            placeholder="Buscar pizzas, bebidas..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textMuted}
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
              <View style={s.empty}>
                <Ionicons name="search-outline" size={56} color={colors.textMuted} />
                <Text style={s.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={s.emptyHint}>Tente um termo diferente</Text>
              </View>
            ) : (
              <View style={s.empty}>
                <Ionicons name="pizza-outline" size={56} color={colors.textMuted} />
                <Text style={s.emptyHint}>Digite para buscar</Text>
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

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    title: {
      color: c.text,
      fontFamily: fontFamily.headingBold,
      fontSize: 24,
      marginBottom: 12,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      color: c.text,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 15,
      paddingVertical: 12,
    },
    empty: { alignItems: 'center', paddingVertical: 64, gap: 8 },
    emptyTitle: { color: c.text, fontFamily: fontFamily.headingMedium, fontSize: 16, marginTop: 8 },
    emptyHint: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 13 },
  });
}
