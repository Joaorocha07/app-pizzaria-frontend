import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { Produto, Categoria, Banner } from '../../types';
import { AppTabParamList } from '../../navigation/types';
import { formatCurrency } from '../../utils/helpers';

const { width: SW } = Dimensions.get('window');
const H_PAD = 20;
const BANNER_W = SW - H_PAD * 2;
const BANNER_H = 168;

/* Tons fixos usados apenas sobre foto/superfície primária (iguais nos 2 temas) */
const PRIMARY = '#7E3B3B';
const PRIMARY_DARK = '#5E2B2B';
const ACCENT = '#B3924C';
const CREAM = '#F4EDE1';

type Props = { navigation: NativeStackNavigationProp<AppTabParamList> };

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skel({
  w,
  h,
  r = 10,
  style,
}: {
  w: number | string;
  h: number;
  r?: number;
  style?: object;
}) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.75, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ width: w as any, height: h, borderRadius: r, backgroundColor: colors.bgInput, opacity: pulse }, style]}
    />
  );
}

function HomeSkeleton() {
  const { colors } = useTheme();
  return (
    <ScrollView style={[ss.root, { backgroundColor: colors.bg }]} scrollEnabled={false} showsVerticalScrollIndicator={false}>
      {/* search */}
      <View style={{ paddingHorizontal: H_PAD, marginBottom: 28 }}>
        <Skel w="100%" h={50} r={16} />
      </View>

      {/* section title */}
      <View style={ss.sectionRow}>
        <Skel w={150} h={16} r={8} />
        <Skel w={55} h={12} r={6} />
      </View>

      {/* banner */}
      <View style={{ paddingHorizontal: H_PAD, marginBottom: 24 }}>
        <Skel w={BANNER_W} h={BANNER_H} r={22} />
      </View>

      {/* section title */}
      <View style={ss.sectionRow}>
        <Skel w={160} h={16} r={8} />
        <Skel w={55} h={12} r={6} />
      </View>

      {/* chips */}
      <View style={{ flexDirection: 'row', paddingHorizontal: H_PAD, gap: 10, marginBottom: 28 }}>
        {[80, 90, 70, 95].map((w, i) => (
          <Skel key={i} w={w} h={38} r={20} />
        ))}
      </View>

      {/* section title */}
      <View style={ss.sectionRow}>
        <Skel w={140} h={16} r={8} />
        <Skel w={55} h={12} r={6} />
      </View>

      {/* carrossel de círculos */}
      <View style={{ flexDirection: 'row', gap: 18, paddingHorizontal: H_PAD, overflow: 'hidden' }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ width: 145, alignItems: 'center', gap: 10 }}>
            <Skel w={130} h={130} r={65} />
            <Skel w={90} h={12} r={6} />
            <Skel w={56} h={10} r={5} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ─── OfertasBanner (carousel inline) ───────────────────────── */
function OfertasBanner({
  banners,
  onPress,
}: {
  banners: Banner[];
  onPress: (b: Banner) => void;
}) {
  const { colors } = useTheme();
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      const next = (active + 1) % banners.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActive(next);
    }, 4000);
    return () => clearInterval(id);
  }, [active, banners.length]);

  /* placeholder card when API returns no banners */
  if (!banners.length) {
    return (
      <Animated.View style={[bs.wrapper, { opacity: fade }]}>
        <LinearGradient colors={[PRIMARY, PRIMARY_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={bs.placeholder}>
          <View style={bs.placeholderText}>
            <Text style={bs.placeholderEye}>Promoção do fim de semana</Text>
            <Text style={bs.placeholderTitle}>{'Pizzas\nEspeciais'}</Text>
            <Text style={bs.placeholderSub}>Até 30% de desconto</Text>
            <TouchableOpacity style={bs.placeholderBtn} activeOpacity={0.8}>
              <Text style={bs.placeholderBtnText}>VER AGORA</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="pizza-outline" size={72} color="rgba(245,237,224,0.15)" style={bs.placeholderEmoji} />
        </LinearGradient>
        <View style={bs.dots}>
          <View style={[bs.dot, bs.dotActive]} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[bs.wrapper, { opacity: fade }]}>
      <FlatList
        ref={listRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        snapToInterval={BANNER_W + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: H_PAD }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 16));
          setActive(Math.max(0, Math.min(idx, banners.length - 1)));
        }}
        renderItem={({ item }) => (
          <BannerItem item={item} onPress={onPress} borderColor={colors.border} />
        )}
      />

      {banners.length > 1 && (
        <View style={bs.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[bs.dot, { backgroundColor: i === active ? PRIMARY : colors.textMuted }]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function BannerItem({ item, onPress, borderColor }: { item: Banner; onPress: (b: Banner) => void; borderColor: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.92}
        style={[bs.item, { borderColor }]}
      >
        <Image source={{ uri: item.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(107,30,35,0.65)', 'rgba(0,0,0,0.55)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={bs.itemContent}>
          <Text style={bs.itemEye} numberOfLines={1}>{item.titulo}</Text>
          <TouchableOpacity style={bs.itemBtn} activeOpacity={0.85}>
            <Text style={bs.itemBtnText}>VER AGORA</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const bs = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  item: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
  },
  itemContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  itemEye: {
    color: 'rgba(244,237,225,0.9)',
    fontFamily: fontFamily.headingMedium,
    fontSize: 15,
    marginBottom: 10,
  },
  itemBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26,20,15,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(244,237,225,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  itemBtnText: {
    color: CREAM,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.caps,
  },
  /* placeholder */
  placeholder: {
    marginHorizontal: H_PAD,
    height: BANNER_H,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  placeholderText: { flex: 1 },
  placeholderEye: { color: 'rgba(244,237,225,0.75)', fontFamily: fontFamily.bodySemiBold, fontSize: 9, letterSpacing: letterSpacing.caps, marginBottom: 6 },
  placeholderTitle: { color: CREAM, fontFamily: fontFamily.headingBold, fontSize: 26, lineHeight: 30, marginBottom: 8 },
  placeholderSub: { color: 'rgba(244,237,225,0.85)', fontFamily: fontFamily.headingItalic, fontSize: 14, marginBottom: 14 },
  placeholderBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26,20,15,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(244,237,225,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  placeholderBtnText: { color: CREAM, fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.caps },
  placeholderEmoji: { marginRight: -8 },
  /* dots — diamantes de impresso */
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 16 },
  dot: { width: 5, height: 5, transform: [{ rotate: '45deg' }], backgroundColor: 'rgba(165,148,126,0.4)' },
  dotActive: { backgroundColor: PRIMARY },
});

/* ─── CategoryPill ───────────────────────────────────────────── */
function CategoryPill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[cs.pill, active ? cs.pillActive : { backgroundColor: colors.bgElevated, borderColor: colors.border }]}
      >
        {icon ? <Text style={cs.pillIcon}>{icon}</Text> : null}
        <Text style={[cs.pillLabel, active ? cs.pillLabelActive : { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cs = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: 10,
    gap: 6,
  },
  pillActive: {
    backgroundColor: PRIMARY,
    borderColor: ACCENT,
  },
  pillIcon: { fontSize: 14 },
  pillLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.caps,
  },
  pillLabelActive: { color: CREAM },
});

/* ─── PopularCard ─────────────────────────────────────────────── */
function PopularCard({
  produto,
  onPress,
  delay,
}: {
  produto: Produto;
  onPress: () => void;
  delay: number;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();
  }, []);

  function btnIn() {
    Animated.spring(btnScale, { toValue: 0.9, useNativeDriver: true, speed: 60 }).start();
  }
  function btnOut() {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  return (
    <Animated.View style={[ps.card, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={ps.cardTouch}>
        {/* Círculo com sombra profunda — sombra no wrapper (overflow:hidden cortaria) */}
        <View style={ps.circleShadow}>
          <View style={[ps.circle, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
            {produto.urlImagem && !imgErr ? (
              <Image
                source={{ uri: produto.urlImagem }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                onError={() => setImgErr(true)}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, ps.imgFallback]}>
                <Ionicons name="pizza-outline" size={44} color={colors.textMuted} />
              </View>
            )}
            {!produto.disponivel && (
              <View style={ps.unavailBadge}>
                <Text style={ps.unavailText}>INDISPONÍVEL</Text>
              </View>
            )}
          </View>

          {/* Botão + sobreposto ao círculo */}
          {produto.disponivel && (
            <Pressable
              onPressIn={btnIn}
              onPressOut={btnOut}
              onPress={onPress}
              hitSlop={8}
              style={ps.addBtnWrap}
            >
              <Animated.View
                style={[
                  ps.addBtn,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.bg,
                    shadowColor: colors.primary,
                    transform: [{ scale: btnScale }],
                  },
                ]}
              >
                <Ionicons name="add" size={22} color={CREAM} />
              </Animated.View>
            </Pressable>
          )}
        </View>

        {/* Info centralizada abaixo do círculo */}
        <Text style={[ps.name, { color: colors.text }]} numberOfLines={1}>{produto.nome}</Text>
        <View style={[ps.nameDivider, { backgroundColor: colors.accent }]} />
        <Text style={[ps.price, { color: colors.accent }]}>{formatCurrency(produto.preco)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ps = StyleSheet.create({
  card: {
    width: 145,
    flexShrink: 0,
  },
  cardTouch: {
    alignItems: 'center',
  },
  circleShadow: {
    width: 130,
    height: 130,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imgFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailBadge: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(44,33,24,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailText: { color: CREAM, fontFamily: fontFamily.bodySemiBold, fontSize: 9, letterSpacing: letterSpacing.caps },
  addBtnWrap: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  name: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 140,
  },
  nameDivider: {
    width: 24,
    height: 1,
    opacity: 0.5,
    marginVertical: 4,
    alignSelf: 'center',
  },
  price: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    textAlign: 'center',
  },
});

/* ─── HomeScreen ─────────────────────────────────────────────── */
export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
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

  const handleCategorySelect = useCallback(
    async (id: number) => {
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
    },
    [selectedCategory],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedCategory(null);
    load();
  }, [load]);

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <ScrollView
      style={[ss.root, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={PRIMARY}
          colors={[PRIMARY]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. Search ── */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('Cardapio')}
        activeOpacity={0.8}
        style={[ss.searchBar, { backgroundColor: colors.bgInput }]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Text style={[ss.searchPlaceholder, { color: colors.textMuted }]}>Buscar prato, restaurante...</Text>
        <View style={ss.filterBtn}>
          <Ionicons name="options-outline" size={16} color={CREAM} />
        </View>
      </TouchableOpacity>

      {/* ── 2. Ofertas Exclusivas ── */}
      <SectionHeading
        title="Ofertas da Casa"
        actionLabel="Ver tudo"
        onAction={() => (navigation as any).navigate('Cardapio')}
        style={ss.sectionHeading}
      />
      <OfertasBanner banners={banners} onPress={() => {}} />

      {/* ── 3. Explorar Categorias ── */}
      <SectionHeading
        title="Categorias"
        actionLabel="Ver tudo"
        onAction={() => (navigation as any).navigate('Cardapio')}
        style={ss.sectionHeading}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 4 }}
        style={{ marginBottom: 28 }}
      >
        <CategoryPill
          label="Todos"
          icon="🍽️"
          active={selectedCategory === null}
          onPress={() => {
            if (selectedCategory !== null) {
              setSelectedCategory(null);
              productService.getProducts({ disponivel: true }).then(setProdutos).catch(() => {});
            }
          }}
        />
        {categorias.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.nome}
            icon={cat.icone ?? undefined}
            active={selectedCategory === cat.id}
            onPress={() => handleCategorySelect(cat.id)}
          />
        ))}
      </ScrollView>

      {/* ── 4. Pratos Populares ── */}
      <SectionHeading
        title="Pratos Populares"
        actionLabel="Ver tudo"
        onAction={() => (navigation as any).navigate('Cardapio')}
        style={ss.sectionHeading}
      />

      {produtos.length === 0 ? (
        <View style={ss.empty}>
          <Ionicons name="restaurant-outline" size={52} color={colors.textMuted} />
          <Text style={[ss.emptyText, { color: colors.textMuted }]}>Nenhum produto encontrado</Text>
          <Button
            title={selectedCategory ? 'Ver todas as categorias' : 'Ver cardápio completo'}
            variant="outline"
            size="sm"
            onPress={() => {
              if (selectedCategory) {
                setSelectedCategory(null);
                productService.getProducts({ disponivel: true }).then(setProdutos).catch(() => {});
              } else {
                (navigation as any).navigate('Cardapio');
              }
            }}
            style={{ marginTop: 4 }}
          />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ss.carousel}
        >
          {produtos.map((produto, i) => {
            const cat = categorias.find((c) => c.id === produto.categoriaId);
            return (
              <PopularCard
                key={produto.id}
                produto={produto}
                delay={Math.min(i, 5) * 55}
                onPress={() => {
                  if (cat) {
                    (navigation as any).navigate('PizzaSize', {
                      categoryId: cat.id,
                      categoryName: cat.nome,
                      categoryIcon: cat.icone ?? undefined,
                    });
                  } else {
                    (navigation as any).navigate('ProductDetails', { productId: produto.id });
                  }
                }}
              />
            );
          })}
        </ScrollView>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* ─── Shared styles ──────────────────────────────────────────── */
const ss = StyleSheet.create({
  root: { flex: 1 },

  /* search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginBottom: 28,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: radius.md,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* section heading */
  sectionHeading: {
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },

  /* section row (usado apenas pelo skeleton) */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },

  /* carrossel de pratos populares */
  carousel: {
    paddingHorizontal: H_PAD,
    gap: 18,
    paddingBottom: 16,
  },

  /* empty */
  empty: {
    alignItems: 'center',
    paddingVertical: 52,
    gap: 10,
  },
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
