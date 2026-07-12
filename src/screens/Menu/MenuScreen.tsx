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
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Ornament } from '../../components/common/Ornament';

const { width: SW } = Dimensions.get('window');
const H_PAD = 16;
const CARD_GAP = 12;
const FULL_W = SW - H_PAD * 2;
const HALF_W = (SW - H_PAD * 2 - CARD_GAP) / 2;
/* Tons fixos usados apenas sobre foto (iguais nos 2 temas) */
const PRIMARY = '#7E3B3B';
const ACCENT = '#B3924C';
const CREAM = '#F4EDE1';

type Props = { navigation: NativeStackNavigationProp<AppTabParamList> };

/* ─── Skeleton ──────────────────────────────────────── */
function Skel({ w, h, r = 10 }: { w: number; h: number; r?: number }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={{ width: w, height: h, borderRadius: r, backgroundColor: colors.bgInput, opacity: pulse }} />;
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
        {/* Background image or fallback */}
        {categoria.urlImagem ? (
          <Image source={{ uri: categoria.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, cs.fallbackGradient, { backgroundColor: '#3A2C20' }]}>
            <Ionicons name="restaurant-outline" size={Math.round(height * 0.3)} color="rgba(244,237,225,0.18)" />
          </View>
        )}

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(26,20,15,0.85)']}
          style={cs.overlay}
        />

        {/* Content */}
        <View style={cs.content}>
          <View style={cs.pill}>
            <Text style={cs.pillText}>VER SABORES</Text>
            <Ionicons name="chevron-forward" size={10} color={CREAM} />
          </View>
          <Text style={cs.name} numberOfLines={2}>{categoria.nome}</Text>
        </View>

        {/* Filete dourado inferior — assinatura de rótulo */}
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
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(179,146,76,0.35)',
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
    backgroundColor: 'rgba(26,20,15,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(244,237,225,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  pillText: {
    color: CREAM,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 9,
    letterSpacing: letterSpacing.caps,
  },
  name: {
    color: CREAM,
    fontFamily: fontFamily.headingBold,
    fontSize: 19,
    letterSpacing: 0.1,
    lineHeight: 23,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: ACCENT,
  },
});

/* ─── MenuScreen ──────────────────────────────────── */
export function MenuScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const cats = await productService.getCategories();
      setCategorias(cats.filter((c) => c.ativo));
    } catch (e: any) {
      setError(e.message ?? 'Não foi possível carregar o cardápio');
    } finally {
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

  if (!loading && error) {
    return (
      <View style={[ms.root, { backgroundColor: colors.bg, paddingTop: pt }]}>
        <ErrorMessage message={error} onRetry={load} />
      </View>
    );
  }

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
        {/* Header — capa de cardápio antigo */}
        <View style={[ms.header, { paddingTop: pt }]}>
          <Text style={[ms.title, { color: colors.text }]}>Cardápio</Text>
          <Text style={[ms.subtitle, { color: colors.textSecondary }]}>Escolha sua categoria</Text>
          <Ornament style={ms.headerOrnament} color={colors.accent} />
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
  root: { flex: 1 },
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 18,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 30,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fontFamily.headingItalic,
    fontSize: 14,
    marginTop: 2,
  },
  headerOrnament: {
    marginTop: 12,
    width: 170,
    alignSelf: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
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
    height: StyleSheet.hairlineWidth * 2,
  },
  dividerLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.capsWide,
  },
});
