import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { Produto } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import { ErrorMessage } from '../../components/common/ErrorMessage';

const { width: SW } = Dimensions.get('window');
const CIRCLE = SW * 0.52;
const H_CIRCLE = CIRCLE / 2;
/* Tons fixos usados apenas sobre foto/prato (iguais nos 2 temas) */
const PRIMARY = '#7E3B3B';
const PRIMARY_DARK = '#5E2B2B';
const ACCENT = '#B3924C';
const CREAM = '#F4EDE1';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'PizzaFlavor'>;
};

/* ─── Skeleton shimmer ─────────────────────────────── */
function SkeletonShimmer({ style }: { style?: object }) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgInput, opacity: shimmer }, style]} />;
}

/* ─── Plate illustration (no SVG) ─────────────────── */
function PlateFill({ isLeft }: { isLeft: boolean }) {
  const rimR      = CIRCLE / 2;
  const surfaceD  = CIRCLE * 0.86;
  const surfaceR  = surfaceD / 2;
  const surfOff   = (CIRCLE - surfaceD) / 2;

  return (
    <View
      style={{
        position: 'absolute',
        width: CIRCLE,
        height: CIRCLE,
        top: 0,
        ...(isLeft ? { left: 0 } : { right: 0 }),
      }}
    >
      {/* Rim — diagonal gradient simulates plate depth */}
      <LinearGradient
        colors={['#D2D2D2', '#C0C0C0', '#A4A4A4']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.22, y: 0.08 }}
        end={{ x: 0.78, y: 0.92 }}
        style={{
          position: 'absolute',
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: rimR,
        }}
      />

      {/* Plate surface — off-center highlight simulates spherical curvature */}
      <View
        style={{
          position: 'absolute',
          left: surfOff,
          top: surfOff,
          width: surfaceD,
          height: surfaceD,
          borderRadius: surfaceR,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F9F9F9', '#E8E8E8']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.22, y: 0.12 }}
          end={{ x: 0.88, y: 0.92 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Inner shadow ring at plate edge */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: surfaceR,
            borderWidth: Math.round(surfaceR * 0.075),
            borderColor: 'rgba(0,0,0,0.09)',
          }}
        />
      </View>
    </View>
  );
}

/* ─── Half-circle fill component ──────────────────── */
function HalfFill({
  side,
  produto,
  fillAnim,
}: {
  side: 'left' | 'right';
  produto: Produto | null;
  fillAnim: Animated.Value;
}) {
  const isLeft = side === 'left';
  const [imgLoaded, setImgLoaded] = React.useState(false);

  // Plate fades out as flavor is chosen; image fades in — no scaleX distortion
  const plateOpacity = fillAnim.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 0.12, 0] });
  const imgOpacity   = fillAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.75, 1] });

  return (
    <View style={[hf.half, isLeft ? hf.halfLeft : hf.halfRight, { overflow: 'hidden' }]}>

      {/* White plate — fades out when flavor selected */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: plateOpacity }]}>
        <PlateFill isLeft={isLeft} />
      </Animated.View>

      {/* ── Melhoria 3: Pizza photo — CIRCLE-sized, anchored to seam, cover fills half ── */}
      <Animated.View
        style={{
          position: 'absolute',
          width: CIRCLE,
          height: CIRCLE,
          top: 0,
          ...(isLeft ? { left: 0 } : { right: 0 }),
          opacity: imgOpacity,
        }}
      >
        {produto?.urlImagem && !imgLoaded && <SkeletonShimmer />}
        {produto?.urlImagem ? (
          <Image
            source={{ uri: produto.urlImagem }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        ) : produto ? (
          <LinearGradient
            colors={isLeft ? [PRIMARY, PRIMARY_DARK] : [ACCENT, '#7A5A1E']}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </Animated.View>

    </View>
  );
}

const hf = StyleSheet.create({
  half: {
    width: H_CIRCLE,
    height: CIRCLE,
    // Match plate rim color — prevents dark flash before PlateFill renders
    backgroundColor: '#C2C2C2',
  },
  halfLeft:  { borderTopLeftRadius:  H_CIRCLE, borderBottomLeftRadius:  H_CIRCLE },
  halfRight: { borderTopRightRadius: H_CIRCLE, borderBottomRightRadius: H_CIRCLE },
});

/* ─── FlavorRow ────────────────────────────────────── */
function FlavorRow({
  produto,
  selected,
  onPress,
  delay,
}: {
  produto: Produto;
  selected: boolean;
  onPress: () => void;
  delay: number;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, delay, useNativeDriver: true, speed: 14, bounciness: 4 }),
    ]).start();
  }, []);

  function press() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }, { scale }] }}>
      <TouchableOpacity
        onPress={press}
        activeOpacity={0.85}
        style={[fr.row, { backgroundColor: colors.bgElevated, borderColor: colors.border }, selected && fr.rowSelected]}
      >
        {/* Thumbnail */}
        <View style={[fr.thumb, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          {produto.urlImagem ? (
            <Image source={{ uri: produto.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Ionicons name="pizza-outline" size={24} color={colors.textMuted} />
          )}
        </View>

        {/* Info */}
        <View style={fr.info}>
          <Text style={[fr.name, { color: colors.text }]} numberOfLines={1}>{produto.nome}</Text>
          {produto.descricao ? (
            <Text style={[fr.desc, { color: colors.textMuted }]} numberOfLines={1}>{produto.descricao}</Text>
          ) : null}
          <Text style={[fr.price, { color: colors.accent }]}>{formatCurrency(produto.preco)}</Text>
        </View>

        {/* Selected indicator */}
        <View style={[fr.check, { borderColor: colors.borderStrong }, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          {selected && <Ionicons name="checkmark" size={14} color={CREAM} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  rowSelected: {
    borderColor: PRIMARY,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontFamily: fontFamily.headingMedium, fontSize: 15, marginBottom: 2 },
  desc: { fontFamily: fontFamily.bodyRegular, fontSize: 11, marginBottom: 4 },
  price: { fontFamily: fontFamily.headingBold, fontSize: 14 },
  check: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* ─── PizzaFlavorScreen ────────────────────────────── */
export function PizzaFlavorScreen({ navigation, route }: Props) {
  const { categoryId, categoryName, sizeName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0 = Sabor 1, 1 = Sabor 2
  const [sabor1, setSabor1] = useState<Produto | null>(null);
  const [sabor2, setSabor2] = useState<Produto | null>(null);

  /* Fill animations for each half */
  const fill1 = useRef(new Animated.Value(0)).current;
  const fill2 = useRef(new Animated.Value(0)).current;

  /* Tab underline position */
  const tabUnderline = useRef(new Animated.Value(0)).current;

  /* Header entrance */
  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const loadProdutos = useCallback(() => {
    setLoading(true);
    setError(null);
    productService.getProducts({ categoriaId: categoryId, disponivel: true })
      .then((data) => setProdutos(data))
      .catch((e: any) => setError(e.message ?? 'Não foi possível carregar os sabores'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();

    loadProdutos();
  }, [categoryId]);

  function switchTab(idx: 0 | 1) {
    setActiveTab(idx);
    Animated.spring(tabUnderline, {
      toValue: idx,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }

  const selectFlavor = useCallback(
    (produto: Produto) => {
      if (activeTab === 0) {
        setSabor1(produto);
        Animated.timing(fill1, { toValue: 1, duration: 420, useNativeDriver: true }).start();
        /* Auto-advance to Sabor 2 */
        setTimeout(() => switchTab(1), 350);
      } else {
        setSabor2(produto);
        Animated.timing(fill2, { toValue: 1, duration: 420, useNativeDriver: true }).start();
        /* Navigate to Extras after both selected */
        setTimeout(() => {
          navigation.navigate('PizzaExtras', {
            product1Id: sabor1!.id,
            product2Id: produto.id,
            sizeName,
            categoryName,
          });
        }, 480);
      }
    },
    [activeTab, sabor1, sizeName, categoryName, navigation],
  );

  const TAB_W = (SW - 40) / 2;
  const underlineX = tabUnderline.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_W],
  });

  return (
    <View style={[ps.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Animated.View
        style={[ps.header, { paddingTop: insets.top + 12, opacity: headerOpacity, transform: [{ translateY: headerY }] }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={[ps.backBtn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={ps.headerMid}>
          <Text style={[ps.headerCat, { color: colors.textSecondary }]}>{categoryName} · {sizeName}</Text>
          <Text style={[ps.headerTitle, { color: colors.text }]}>
            {activeTab === 0 ? 'Escolha o 1º sabor' : 'Escolha o 2º sabor'}
          </Text>
        </View>
      </Animated.View>

      {/* Pizza circle */}
      <View style={ps.circleWrap}>
        {/* Outer ring */}
        <View style={[ps.circleOuter, { borderColor: colors.border }]}>
          {/* Divider line */}
          <View style={[ps.dividerLine, { backgroundColor: colors.bg }]} />

          {/* Left half */}
          <HalfFill side="left" produto={sabor1} fillAnim={fill1} />

          {/* Right half */}
          <HalfFill side="right" produto={sabor2} fillAnim={fill2} />
        </View>

        {/* Arrow hints */}
        <View style={ps.hintRow}>
          <View style={[ps.hint, activeTab === 0 && ps.hintActive]}>
            <Ionicons name="arrow-up" size={12} color={activeTab === 0 ? PRIMARY : 'transparent'} />
            <Text style={[ps.hintText, { color: colors.textMuted }, activeTab === 0 && ps.hintTextActive]}>
              {sabor1 ? sabor1.nome.split(' ')[0] : '1º Sabor'}
            </Text>
          </View>
          <View style={[ps.hint, activeTab === 1 && ps.hintActive]}>
            <Ionicons name="arrow-up" size={12} color={activeTab === 1 ? ACCENT : 'transparent'} />
            <Text style={[ps.hintText, { color: colors.textMuted }, activeTab === 1 && { color: ACCENT }]}>
              {sabor2 ? sabor2.nome.split(' ')[0] : '2º Sabor'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={ps.tabsWrap}>
        <View style={ps.tabs}>
          {['1º Sabor', '2º Sabor'].map((label, idx) => (
            <TouchableOpacity
              key={label}
              onPress={() => {
                if (idx === 1 && !sabor1) return; // can't skip Sabor 1
                switchTab(idx as 0 | 1);
              }}
              style={ps.tab}
              activeOpacity={0.75}
            >
              <Text style={[ps.tabLabel, { color: colors.textSecondary }, activeTab === idx && { color: colors.text }]}>{label}</Text>
              {idx === 0 && sabor1 && (
                <View style={ps.tabDot} />
              )}
              {idx === 1 && sabor2 && (
                <View style={[ps.tabDot, { backgroundColor: ACCENT }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/* Animated underline */}
        <Animated.View
          style={[ps.underline, { width: TAB_W, transform: [{ translateX: underlineX }] }]}
        />
      </View>

      {/* Flavor list */}
      {loading ? (
        <View style={ps.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[ps.loadingText, { color: colors.textMuted }]}>Carregando sabores...</Text>
        </View>
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadProdutos} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isSelected =
              (activeTab === 0 && sabor1?.id === item.id) ||
              (activeTab === 1 && sabor2?.id === item.id);
            return (
              <FlavorRow
                produto={item}
                selected={isSelected}
                onPress={() => selectFlavor(item)}
                delay={index * 45}
              />
            );
          }}
          ListEmptyComponent={
            <View style={ps.emptyWrap}>
              <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} />
              <Text style={[ps.emptyText, { color: colors.textMuted }]}>Nenhum sabor disponível</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const ps = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMid: { flex: 1 },
  headerCat: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.caps, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontFamily: fontFamily.headingBold, fontSize: 18 },

  /* Circle */
  circleWrap: { alignItems: 'center', paddingBottom: 8 },
  circleOuter: {
    width: CIRCLE + 8,
    height: CIRCLE + 8,
    borderRadius: (CIRCLE + 8) / 2,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dividerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },

  /* Arrow hints */
  hintRow: {
    flexDirection: 'row',
    gap: (CIRCLE + 8),
    marginTop: 8,
  },
  hint: { alignItems: 'center', gap: 2 },
  hintActive: {},
  hintText: { fontFamily: fontFamily.bodyBold, fontSize: 10 },
  hintTextActive: { color: PRIMARY },

  /* Tabs */
  tabsWrap: { marginHorizontal: 20, marginTop: 6, marginBottom: 2 },
  tabs: { flexDirection: 'row' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  underline: {
    height: 2.5,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontFamily: fontFamily.bodyRegular, fontSize: 13 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontFamily: fontFamily.bodyRegular, fontSize: 14 },
});
