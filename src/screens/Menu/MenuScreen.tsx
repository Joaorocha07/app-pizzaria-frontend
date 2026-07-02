import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { Categoria } from '../../types';
import { AppTabParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SW } = Dimensions.get('window');
const H_PAD = 16;
const CARD_GAP = 12;
const FULL_W = SW - H_PAD * 2;
const HALF_W = (SW - H_PAD * 2 - CARD_GAP) / 2;
const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';

type Props = { navigation: NativeStackNavigationProp<AppTabParamList> };

/* ─── Skeleton ──────────────────────────────────────── */
function Skel({ w, h, r = 14 }: { w: number; h: number; r?: number }) {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={{ width: w, height: h, borderRadius: r, backgroundColor: '#1C1C1C', opacity: pulse }} />;
}

/* ─── CategoryCard ──────────────────────────────────── */
interface CardProps {
  categoria: Categoria;
  width: number;
  height: number;
  delay: number;
  onPress: () => void;
}

function CategoryCard({ categoria, width, height, delay, onPress }: CardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();
  }, []);

  function pressIn() {
    Animated.spring(pressScale, { toValue: 0.95, useNativeDriver: true, speed: 60 }).start();
  }
  function pressOut() {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  return (
    <Animated.View style={{ width, height, opacity, transform: [{ scale: Animated.multiply(scale, pressScale) }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={[cs.card, { width, height }]}
      >
        {/* Background image or gradient fallback */}
        {categoria.urlImagem ? (
          <Image source={{ uri: categoria.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={['#2A1A1A', '#0D0D0D']}
            style={[StyleSheet.absoluteFill, cs.fallbackGradient]}
          >
            <Ionicons name="restaurant-outline" size={Math.round(height * 0.3)} color="rgba(192,57,43,0.22)" />
          </LinearGradient>
        )}

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          style={cs.overlay}
        />

        {/* Content */}
        <View style={cs.content}>
          <View style={cs.pill}>
            <Text style={cs.pillText}>Ver sabores</Text>
            <Ionicons name="chevron-forward" size={11} color={PRIMARY} />
          </View>
          <Text style={cs.name} numberOfLines={2}>{categoria.nome}</Text>
        </View>

        {/* Red accent line */}
        <View style={cs.accentLine} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const cs = StyleSheet.create({
  fallbackGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192,57,43,0.15)',
    borderWidth: 1,
    borderColor: `${PRIMARY}40`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  pillText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  name: {
    color: '#F5F0E8',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
});

/* ─── MenuScreen ──────────────────────────────────── */
export function MenuScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const cats = await productService.getCategories();
      setCategorias(cats.filter((c) => c.ativo));
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  function goToSize(cat: Categoria) {
    (navigation as any).navigate('PizzaSize', {
      categoryId: cat.id,
      categoryName: cat.nome,
      categoryIcon: cat.icone,
    });
  }

  const pt = insets.top + 16;

  /* Layout: first 2 categories = full-width (tall), rest = 2-column grid */
  const mainCats = categorias.slice(0, 2);
  const gridCats = categorias.slice(2);

  return (
    <View style={[ms.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={[ms.header, { paddingTop: pt }]}>
          <Text style={[ms.title, { color: colors.text }]}>Cardápio</Text>
          <Text style={[ms.subtitle, { color: colors.textSecondary }]}>Escolha sua categoria</Text>
        </View>

        {loading ? (
          <View style={{ paddingHorizontal: H_PAD, gap: CARD_GAP }}>
            <Skel w={FULL_W} h={200} />
            <Skel w={FULL_W} h={200} />
            <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
              <Skel w={HALF_W} h={150} />
              <Skel w={HALF_W} h={150} />
            </View>
            <View style={{ flexDirection: 'row', gap: CARD_GAP }}>
              <Skel w={HALF_W} h={150} />
              <Skel w={HALF_W} h={150} />
            </View>
          </View>
        ) : categorias.length === 0 ? (
          <View style={ms.empty}>
            <Ionicons name="restaurant-outline" size={52} color={colors.textMuted} />
            <Text style={[ms.emptyText, { color: colors.textMuted }]}>Nenhuma categoria disponível</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: H_PAD, gap: CARD_GAP }}>
            {/* Full-width main cards */}
            {mainCats.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                categoria={cat}
                width={FULL_W}
                height={180}
                delay={i * 70}
                onPress={() => goToSize(cat)}
              />
            ))}

            {/* Divider label */}
            {gridCats.length > 0 && (
              <View style={ms.dividerRow}>
                <View style={[ms.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[ms.dividerLabel, { color: colors.textMuted }]}>MAIS OPÇÕES</Text>
                <View style={[ms.dividerLine, { backgroundColor: colors.border }]} />
              </View>
            )}

            {/* 2-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP }}>
              {gridCats.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  categoria={cat}
                  width={HALF_W}
                  height={156}
                  delay={(mainCats.length + i) * 70}
                  onPress={() => goToSize(cat)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const ms = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
  },
  title: {
    color: '#F5F0E8',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
