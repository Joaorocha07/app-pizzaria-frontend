import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { useCart } from '../../contexts/CartContext';
import { Produto, TamanhoProduto, Borda } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

const { width: SW } = Dimensions.get('window');
const CIRCLE = SW * 0.46;
const H_CIRCLE = CIRCLE / 2;
const RING_PAD = 10;
const RING_SIZE = CIRCLE + RING_PAD * 2;
const RING_STROKE = 5;
/* Tons fixos usados apenas sobre foto/superfície primária (iguais nos 2 temas) */
const PRIMARY = '#7E3B3B';
const PRIMARY_DARK = '#5E2B2B';
const ACCENT = '#B3924C';
const CREAM = '#F4EDE1';
const SUCCESS = '#6E8B6A';
type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'PizzaExtras'>;
};


/* ─── CompletePizzaCircle ──────────────────────────── */
function CompletePizzaCircle({
  produto1,
  produto2,
  selectedBorda,
  onRemove,
}: {
  produto1: Produto | null;
  produto2: Produto | null;
  selectedBorda?: Borda | null;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const enterScale   = useRef(new Animated.Value(0.7)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enterScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 10 }),
      Animated.timing(enterOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ringOpacity, { toValue: selectedBorda ? 1 : 0, duration: 280, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: selectedBorda ? 1 : 0.9, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();
  }, [selectedBorda]);

  /* Melhoria 1: Half renders image filling the half precisely */
  function Half({ produto, side }: { produto: Produto | null; side: 'left' | 'right' }) {
    const gradColors: [string, string] = side === 'left'
      ? [PRIMARY, PRIMARY_DARK]
      : [ACCENT, '#7A5A1E'];
    const [imgLoaded, setImgLoaded] = React.useState(false);
    const shimmer = useRef(new Animated.Value(0.35)).current;
    useEffect(() => {
      if (!produto?.urlImagem || imgLoaded) return;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 0.65, duration: 700, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }, [produto?.urlImagem, imgLoaded]);

    return (
      <View style={[cp.half, side === 'left' ? cp.halfLeft : cp.halfRight]}>
        {produto?.urlImagem && !imgLoaded && (
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(107,81,56,0.35)', opacity: shimmer }]} />
        )}
        {produto?.urlImagem ? (
          <Image
            source={{ uri: produto.urlImagem }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        ) : (
          <LinearGradient colors={gradColors} style={StyleSheet.absoluteFill} />
        )}
      </View>
    );
  }

  return (
    <Animated.View style={[cp.wrap, { transform: [{ scale: enterScale }], opacity: enterOpacity }]}>
      <View style={cp.circleWrap}>
        {/* Anel de borda — aparece quando uma borda é selecionada */}
        <Animated.View
          pointerEvents="none"
          style={[cp.ringWrap, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
        >
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={(RING_SIZE - RING_STROKE) / 2}
              stroke={colors.accent}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray="7 6"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <View style={cp.circle}>
          <Half produto={produto1} side="left" />
          <View style={[cp.divider, { backgroundColor: colors.bg }]} />
          <Half produto={produto2} side="right" />
        </View>
        <View style={cp.badge}>
          <Ionicons name="checkmark" size={14} color={CREAM} />
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={[cp.removeBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]} activeOpacity={0.8}>
        <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
        <Text style={[cp.removeBtnText, { color: colors.textSecondary }]}>Alterar sabores</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cp = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  circleWrap: { width: CIRCLE, height: CIRCLE },
  ringWrap: {
    position: 'absolute',
    top: -RING_PAD,
    left: -RING_PAD,
    width: RING_SIZE,
    height: RING_SIZE,
  },

  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(184,134,46,0.18)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  half: {
    width: H_CIRCLE,
    height: CIRCLE,
    overflow: 'hidden',
    backgroundColor: '#3A2C20',
  },
  halfLeft: {},
  halfRight: {},
  divider: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  removeBtnText: { fontFamily: fontFamily.bodySemiBold, fontSize: 12 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CREAM,
    zIndex: 20,
  },
});

/* ─── ExtraCard (borda) ─────────────────────────────── */
function ExtraCard({
  borda,
  selected,
  onPress,
}: {
  borda: Borda;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[ec.card, { backgroundColor: colors.bgCard, borderColor: colors.border }, selected && ec.cardSelected]}>
      <View style={[ec.imgWrap, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        {borda.urlImagem ? (
          <Image source={{ uri: borda.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Ionicons name="ellipse-outline" size={20} color={colors.textMuted} />
        )}
      </View>
      <View style={ec.info}>
        <Text style={[ec.name, { color: colors.text }]}>{borda.nome}</Text>
        <Text style={[ec.price, { color: colors.accent }]}>+ {formatCurrency(borda.preco)}</Text>
      </View>
      <View style={[ec.check, { borderColor: colors.borderStrong }, selected && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
        {selected && <Ionicons name="checkmark" size={13} color={CREAM} />}
      </View>
    </TouchableOpacity>
  );
}

const ec = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  cardSelected: { borderColor: ACCENT },
  imgWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: { flex: 1 },
  name: { fontFamily: fontFamily.headingMedium, fontSize: 15, marginBottom: 2 },
  price: { fontFamily: fontFamily.headingBold, fontSize: 13 },
  check: {
    width: 24, height: 24, borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: ACCENT, borderColor: ACCENT },
});

/* ─── PizzaExtrasScreen ─────────────────────────────── */
export function PizzaExtrasScreen({ navigation, route }: Props) {
  const { product1Id, product2Id, sizeName, categoryName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();

  const [produto1, setProduto1] = useState<Produto | null>(null);
  const [produto2, setProduto2] = useState<Produto | null>(null);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [selectedBorda, setSelectedBorda] = useState<Borda | null>(null);
  const [selectedTamanho, setSelectedTamanho] = useState<TamanhoProduto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const barY = useRef(new Animated.Value(120)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;
  const snackY = useRef(new Animated.Value(60)).current;
  const snackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* Load products + sizes */
    Promise.all([
      productService.getProduct(product1Id),
      productService.getProduct(product2Id),
      productService.getProductSizes(product1Id),
    ])
      .then(([p1, p2, sizes]) => {
        setProduto1(p1);
        setProduto2(p2);
        const match = sizes.find((s) =>
          s.nome.toLowerCase().includes(sizeName.toLowerCase()),
        );
        setSelectedTamanho(match ?? sizes[0] ?? null);
      })
      .catch((e) => Alert.alert('Erro', e.message ?? 'Não foi possível carregar os produtos'))
      .finally(() => {
        setLoadingProducts(false);
        /* Slide bar up */
        Animated.parallel([
          Animated.spring(barY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 6 }),
          Animated.timing(barOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      });

    /* Load bordas via marketingService (uses axios with auth token) */
    marketingService.getCrusts()
      .then(setBordas)
      .catch(() => setBordas([]));
  }, [product1Id, product2Id, sizeName]);

  /* Price: for half-and-half, use the highest base price (not sum) */
  const basePreco = Math.max(produto1?.preco ?? 0, produto2?.preco ?? 0);
  const tamanhoFator = selectedTamanho?.fatorPreco ?? 1;
  const bordaPreco = selectedBorda?.preco ?? 0;
  const totalUnitario = basePreco * tamanhoFator + bordaPreco;
  const totalFinal = totalUnitario * quantidade;

  function handleAddToCart() {
    if (!produto1 || !produto2) {
      Alert.alert('Aguarde', 'Os produtos ainda estão sendo carregados.');
      return;
    }
    const [main, side] = produto1.preco >= produto2.preco
      ? [produto1, produto2]
      : [produto2, produto1];
    addItem(main, quantidade, selectedTamanho ?? undefined, selectedBorda ?? undefined);
    if (side.id !== main.id) {
      addItem(side, quantidade, selectedTamanho ?? undefined, undefined);
    }

    /* Show snackbar then return to menu */
    Animated.parallel([
      Animated.spring(snackY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }),
      Animated.timing(snackOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(snackOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          navigation.navigate('MainTabs', { screen: 'Cardapio' });
        });
      }, 1400);
    });
  }

  const canAdd = !loadingProducts && !!produto1 && !!produto2;

  return (
    <View style={[es.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[es.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[es.backBtn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[es.headerSub, { color: colors.textSecondary }]}>{categoryName} · {sizeName}</Text>
          <Text style={[es.headerTitle, { color: colors.text }]}>Confirmar pedido</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Complete pizza preview */}
        <View style={es.circleSection}>
          <CompletePizzaCircle
            produto1={produto1}
            produto2={produto2}
            selectedBorda={selectedBorda}
            onRemove={() => navigation.goBack()}
          />
          <Text style={[es.pizzaNames, { color: colors.text }]}>
            {produto1 ? produto1.nome.split(' ').slice(0, 2).join(' ') : '–'}{' '}
            +{' '}
            {produto2 ? produto2.nome.split(' ').slice(0, 2).join(' ') : '–'}
          </Text>
          <Text style={[es.pizzaSize, { color: colors.textMuted }]}>{sizeName}</Text>
        </View>

        {/* Bordas */}
        <View style={es.section}>
          <View style={es.sectionHeader}>
            <Ionicons name="arrow-down-circle-outline" size={16} color={ACCENT} />
            <Text style={es.sectionTitle}>Uma borda para a pizza toda</Text>
          </View>

          {/* No border option */}
          <TouchableOpacity
            onPress={() => setSelectedBorda(null)}
            activeOpacity={0.85}
            style={[ec.card, { borderColor: colors.border }, !selectedBorda && ec.cardSelected]}
          >
            <View style={[ec.imgWrap, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
              <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
            </View>
            <View style={ec.info}>
              <Text style={[ec.name, { color: colors.text }]}>Sem borda</Text>
              <Text style={[ec.price, { color: colors.textMuted }]}>Incluso</Text>
            </View>
            <View style={[ec.check, { borderColor: colors.borderStrong }, !selectedBorda && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              {!selectedBorda && <Ionicons name="checkmark" size={13} color={CREAM} />}
            </View>
          </TouchableOpacity>

          {bordas.map((b) => (
            <ExtraCard
              key={b.id}
              borda={b}
              selected={selectedBorda?.id === b.id}
              onPress={() => setSelectedBorda((prev) => (prev?.id === b.id ? null : b))}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <Animated.View
        style={[
          es.bar,
          { paddingBottom: insets.bottom + 12, transform: [{ translateY: barY }], opacity: barOpacity },
        ]}
      >
        <LinearGradient
          colors={['transparent', colors.bg]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />

        {/* Qty controls */}
        <View style={es.qtyRow}>
          <TouchableOpacity
            onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
            style={[es.qtyBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            activeOpacity={0.75}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[es.qtyNum, { color: colors.text }]}>{quantidade}</Text>
          <TouchableOpacity
            onPress={() => setQuantidade((q) => q + 1)}
            style={[es.qtyBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Price + CTA */}
        <View style={es.ctaRow}>
          <View>
            <Text style={[es.totalLabel, { color: colors.textMuted }]}>Total</Text>
            <Text style={es.totalPrice}>{formatCurrency(totalFinal)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!canAdd}
            activeOpacity={0.85}
            style={[es.ctaBtn, !canAdd && es.ctaBtnDisabled]}
          >
            <Text style={es.ctaBtnText}>Adicionar ao carrinho</Text>
            <Ionicons name="arrow-forward" size={18} color={CREAM} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Snackbar */}
      <Animated.View
        style={[es.snack, { backgroundColor: colors.bgElevated, borderColor: `${SUCCESS}4D`, bottom: insets.bottom + 100, opacity: snackOpacity, transform: [{ translateY: snackY }] }]}
        pointerEvents="none"
      >
        <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
        <Text style={[es.snackText, { color: colors.text }]}>Item adicionado! Finalize seu pedido no carrinho</Text>
      </Animated.View>
    </View>
  );
}

const es = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12, gap: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub: { fontFamily: fontFamily.bodySemiBold, fontSize: 11, marginBottom: 2 },
  headerTitle: { fontFamily: fontFamily.headingBold, fontSize: 20 },
  circleSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  pizzaNames: {
    fontFamily: fontFamily.bodyBold, fontSize: 14,
    marginTop: 8, textAlign: 'center', paddingHorizontal: 32,
  },
  pizzaSize: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { color: ACCENT, fontFamily: fontFamily.bodyBold, fontSize: 13 },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 24, gap: 12,
  },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 20, marginBottom: 4,
  },
  qtyBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: {
    fontFamily: fontFamily.headingBold, fontSize: 20,
    minWidth: 32, textAlign: 'center',
  },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: 11 },
  totalPrice: { color: ACCENT, fontFamily: fontFamily.headingBold, fontSize: 22 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.md,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaBtnText: { color: CREAM, fontFamily: fontFamily.bodyBold, fontSize: 14 },
  snack: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  snackText: {
    flex: 1,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
  },
});
