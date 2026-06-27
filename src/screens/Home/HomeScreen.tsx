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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { Produto, Categoria, Banner } from '../../types';
import { AppTabParamList } from '../../navigation/types';
import { formatCurrency } from '../../utils/helpers';

const { width: SW } = Dimensions.get('window');
const H_PAD = 20;
const BANNER_W = SW - H_PAD * 2;
const BANNER_H = 168;
const GRID_GAP = 12;
const CARD_W = (SW - H_PAD * 2 - GRID_GAP) / 2;

const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';
const CARD_BG = '#111111';

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
      style={[{ width: w as any, height: h, borderRadius: r, backgroundColor: '#1E1E1E', opacity: pulse }, style]}
    />
  );
}

function HomeSkeleton({ pt }: { pt: number }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={[ss.root, { backgroundColor: colors.bg }]} scrollEnabled={false} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={[ss.header, { paddingTop: pt }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Skel w={44} h={44} r={22} />
          <View style={{ gap: 6 }}>
            <Skel w={80} h={10} r={5} />
            <Skel w={130} h={14} r={7} />
          </View>
        </View>
        <Skel w={40} h={40} r={20} />
      </View>

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

      {/* grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: H_PAD }}>
        {[1, 2, 3, 4].map((i) => (
          <Skel key={i} w={CARD_W} h={230} r={20} />
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
        <LinearGradient colors={[PRIMARY, '#7B1A12']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={bs.placeholder}>
          <View style={bs.placeholderText}>
            <Text style={bs.placeholderEye}>Promoção do fim de semana</Text>
            <Text style={bs.placeholderTitle}>{'Pizzas\nEspeciais'}</Text>
            <Text style={bs.placeholderSub}>Até 30% de desconto</Text>
            <TouchableOpacity style={bs.placeholderBtn} activeOpacity={0.8}>
              <Text style={bs.placeholderBtnText}>Ver agora</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="pizza-outline" size={72} color="rgba(255,255,255,0.15)" style={bs.placeholderEmoji} />
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
          <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9} style={bs.item}>
            <Image source={{ uri: item.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(192,57,43,0.65)', 'rgba(0,0,0,0.55)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={bs.itemContent}>
              <Text style={bs.itemEye} numberOfLines={1}>{item.titulo}</Text>
              <TouchableOpacity style={bs.itemBtn} activeOpacity={0.85}>
                <Text style={bs.itemBtnText}>Ver agora</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {banners.length > 1 && (
        <View style={bs.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[bs.dot, i === active ? bs.dotActive : null]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const bs = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  item: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  itemContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  itemEye: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  itemBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  itemBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  /* placeholder */
  placeholder: {
    marginHorizontal: H_PAD,
    height: BANNER_H,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  placeholderText: { flex: 1 },
  placeholderEye: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  placeholderTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', lineHeight: 30, marginBottom: 8 },
  placeholderSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 14 },
  placeholderBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  placeholderBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  placeholderEmoji: { marginRight: -8 },
  /* dots */
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 22, backgroundColor: PRIMARY, borderRadius: 3 },
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
        <Text style={[cs.pillLabel, active ? cs.pillLabelActive : { color: colors.textSecondary }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cs = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
    gap: 6,
  },
  pillActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pillIcon: { fontSize: 15 },
  pillLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pillLabelActive: { color: '#FFFFFF' },
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
    Animated.spring(btnScale, { toValue: 0.85, useNativeDriver: true, speed: 60 }).start();
  }
  function btnOut() {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  }

  return (
    <Animated.View style={[ps.card, { width: CARD_W, opacity, transform: [{ translateY }], backgroundColor: colors.bgElevated }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={{ flex: 1 }}>
        {/* Image */}
        <View style={ps.imgWrap}>
          {produto.urlImagem && !imgErr ? (
            <Image
              source={{ uri: produto.urlImagem }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <View style={ps.imgFallback}>
              <Ionicons name="pizza-outline" size={38} color="rgba(255,255,255,0.18)" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={ps.imgGradient}
          />
          {!produto.disponivel && (
            <View style={ps.unavailBadge}>
              <Text style={ps.unavailText}>Indisponível</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={ps.info}>
          <Text style={[ps.name, { color: colors.text }]} numberOfLines={2}>{produto.nome}</Text>

          {/* Rating (decorative) */}
          <View style={ps.ratingRow}>
            <Ionicons name="star" size={11} color={ACCENT} />
            <Text style={ps.ratingText}>4.8</Text>
          </View>

          <View style={ps.footer}>
            <Text style={ps.price}>{formatCurrency(produto.preco)}</Text>
            {produto.disponivel && (
              <Pressable
                onPressIn={btnIn}
                onPressOut={btnOut}
                onPress={onPress}
                hitSlop={8}
              >
                <Animated.View style={[ps.addBtn, { transform: [{ scale: btnScale }] }]}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </Animated.View>
              </Pressable>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ps = StyleSheet.create({
  card: {
    height: 234,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  imgWrap: {
    height: 138,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  imgFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  imgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  unavailBadge: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700' },
  info: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  name: {
    color: '#F5F0E8',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  ratingText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '900',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 5,
  },
});

/* ─── SectionRow ─────────────────────────────────────────────── */
function SectionRow({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={ss.sectionRow}>
      <Text style={[ss.sectionTitle, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.75}>
        <Text style={ss.seeAll}>Ver tudo</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── HomeScreen ─────────────────────────────────────────────── */
export function HomeScreen({ navigation }: Props) {
  const { usuario } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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

  const { totalItens } = useCart();
  const pt = insets.top + 14;
  if (loading) return <HomeSkeleton pt={pt} />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const initial = usuario?.nome?.charAt(0).toUpperCase() ?? '?';

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
      {/* ── 1. Header ── */}
      <View style={[ss.header, { paddingTop: pt }]}>
        {/* Avatar + location */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Addresses')}
          style={ss.locationBlock}
          activeOpacity={0.8}
        >
          <View style={ss.avatar}>
            <Text style={ss.avatarInitial}>{initial}</Text>
          </View>
          <View>
            <Text style={[ss.locationLabel, { color: colors.textSecondary }]}>Localização</Text>
            <View style={ss.locationRow}>
              <Text style={[ss.locationCity, { color: colors.text }]} numberOfLines={1}>
                {usuario?.nome?.split(' ')[0] ?? 'Meu endereço'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#F5F0E8" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Cart + Bell */}
        <View style={ss.headerActions}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Cart')}
            style={ss.bellBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="bag-outline" size={22} color="#F5F0E8" />
            {totalItens > 0 && (
              <View style={ss.cartBadge}>
                <Text style={ss.cartBadgeText}>{totalItens > 9 ? '9+' : totalItens}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Notificacoes')}
            style={ss.bellBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications-outline" size={22} color="#F5F0E8" />
            <View style={ss.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Search ── */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('Cardapio')}
        activeOpacity={0.8}
        style={[ss.searchBar, { backgroundColor: colors.bgInput }]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Text style={[ss.searchPlaceholder, { color: colors.textMuted }]}>Buscar prato, restaurante...</Text>
        <View style={ss.filterBtn}>
          <Ionicons name="options-outline" size={17} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* ── 3. Ofertas Exclusivas ── */}
      <SectionRow
        title="Ofertas Exclusivas"
        onViewAll={() => (navigation as any).navigate('Cardapio')}
      />
      <OfertasBanner banners={banners} onPress={() => {}} />

      {/* ── 4. Explorar Categorias ── */}
      <SectionRow
        title="Explorar Categorias"
        onViewAll={() => (navigation as any).navigate('Cardapio')}
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

      {/* ── 5. Pratos Populares ── */}
      <SectionRow
        title="Pratos Populares"
        onViewAll={() => (navigation as any).navigate('Cardapio')}
      />

      {produtos.length === 0 ? (
        <View style={ss.empty}>
          <Ionicons name="restaurant-outline" size={52} color={colors.textMuted} />
          <Text style={[ss.emptyText, { color: colors.textMuted }]}>Nenhum produto encontrado</Text>
        </View>
      ) : (
        <View style={ss.grid}>
          {produtos.map((produto, i) => (
            <PopularCard
              key={produto.id}
              produto={produto}
              delay={Math.min(i, 5) * 55}
              onPress={() => (navigation as any).navigate('ProductDetails', { productId: produto.id })}
            />
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* ─── Shared styles ──────────────────────────────────────────── */
const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingBottom: 22,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  locationLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationCity: {
    color: '#F5F0E8',
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 160,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: BG,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: BG,
  },

  /* search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginBottom: 28,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: 'rgba(255,255,255,0.28)',
    fontSize: 14,
    fontWeight: '500',
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* section row */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#F5F0E8',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  seeAll: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },

  /* grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: H_PAD,
  },

  /* empty */
  empty: {
    alignItems: 'center',
    paddingVertical: 52,
    gap: 10,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
