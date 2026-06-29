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

const { width: SW } = Dimensions.get('window');
const CIRCLE = SW * 0.52;
const H_CIRCLE = CIRCLE / 2;
const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';
const CARD_BG = '#111111';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'PizzaFlavor'>;
};

/* ─── Skeleton shimmer ─────────────────────────────── */
function SkeletonShimmer({ style }: { style?: object }) {
  const shimmer = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#1C1C1C', opacity: shimmer }, style]} />;
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

  const scaleX = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const opacity = fillAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 1] });

  return (
    <View style={[hf.half, isLeft ? hf.halfLeft : hf.halfRight, { overflow: 'hidden' }]}>
      {/* Empty state — user hasn't selected yet */}
      {!produto && (
        <View style={hf.empty}>
          <Ionicons name="add-circle-outline" size={24} color="rgba(255,255,255,0.12)" />
        </View>
      )}

      {/* Filled state */}
      {produto && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity,
              transform: [{ scaleX }],
              transformOrigin: isLeft ? 'left' : 'right',
            },
          ]}
        >
          {/* Skeleton while image loads */}
          {produto.urlImagem && !imgLoaded && <SkeletonShimmer />}

          {produto.urlImagem ? (
            <Image
              source={{ uri: produto.urlImagem }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          ) : (
            <LinearGradient
              colors={isLeft ? [PRIMARY, '#7B1A12'] : [ACCENT, '#5C4400']}
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>
      )}

      {/* Dark overlay + name label */}
      {produto && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
        >
          <Text style={hf.label} numberOfLines={2}>{produto.nome}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const hf = StyleSheet.create({
  half: {
    width: H_CIRCLE,
    height: CIRCLE,
    backgroundColor: '#1A1A1A',
  },
  halfLeft: { borderTopLeftRadius: H_CIRCLE, borderBottomLeftRadius: H_CIRCLE },
  halfRight: { borderTopRightRadius: H_CIRCLE, borderBottomRightRadius: H_CIRCLE },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
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
        <View style={fr.thumb}>
          {produto.urlImagem ? (
            <Image source={{ uri: produto.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#2A2A2A', '#1A1A1A']} style={StyleSheet.absoluteFill} />
          )}
          {!produto.urlImagem && <Ionicons name="pizza-outline" size={22} color="rgba(255,255,255,0.25)" />}
        </View>

        {/* Info */}
        <View style={fr.info}>
          <Text style={[fr.name, { color: colors.text }]} numberOfLines={1}>{produto.nome}</Text>
          {produto.descricao ? (
            <Text style={fr.desc} numberOfLines={1}>{produto.descricao}</Text>
          ) : null}
          <Text style={fr.price}>{formatCurrency(produto.preco)}</Text>
        </View>

        {/* Selected indicator */}
        <View style={[fr.check, selected && fr.checkActive]}>
          {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  rowSelected: {
    borderColor: PRIMARY,
    backgroundColor: `${PRIMARY}12`,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { color: '#F5F0E8', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  desc: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 },
  price: { color: ACCENT, fontSize: 13, fontWeight: '800' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
});

/* ─── PizzaFlavorScreen ────────────────────────────── */
export function PizzaFlavorScreen({ navigation, route }: Props) {
  const { categoryId, categoryName, sizeName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();

    productService.getProducts({ categoriaId: categoryId, disponivel: true })
      .then((data) => setProdutos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={ps.backBtn} activeOpacity={0.75}>
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
        <View style={ps.circleOuter}>
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
            <Text style={[ps.hintText, activeTab === 0 && ps.hintTextActive]}>
              {sabor1 ? sabor1.nome.split(' ')[0] : '1º Sabor'}
            </Text>
          </View>
          <View style={[ps.hint, activeTab === 1 && ps.hintActive]}>
            <Ionicons name="arrow-up" size={12} color={activeTab === 1 ? ACCENT : 'transparent'} />
            <Text style={[ps.hintText, activeTab === 1 && { color: ACCENT }]}>
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
              <Text style={[ps.tabLabel, activeTab === idx && ps.tabLabelActive]}>{label}</Text>
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
          <Text style={ps.loadingText}>Carregando sabores...</Text>
        </View>
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
              <Text style={ps.emptyText}>Nenhum sabor disponível</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const ps = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

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
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMid: { flex: 1 },
  headerCat: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  headerTitle: { color: '#F5F0E8', fontSize: 18, fontWeight: '900' },

  /* Circle */
  circleWrap: { alignItems: 'center', paddingBottom: 8 },
  circleOuter: {
    width: CIRCLE + 8,
    height: CIRCLE + 8,
    borderRadius: (CIRCLE + 8) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  dividerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: BG,
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
  hintText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '700' },
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
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: { color: '#F5F0E8' },
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

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.25)', fontSize: 13 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14 },
});
