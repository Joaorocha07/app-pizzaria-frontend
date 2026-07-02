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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productService } from '../../services/productService';
import { marketingService } from '../../services/marketingService';
import { useCart } from '../../contexts/CartContext';
import { Produto, TamanhoProduto, Borda } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SW } = Dimensions.get('window');
const CIRCLE = SW * 0.46;
const H_CIRCLE = CIRCLE / 2;
const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';
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

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enterScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 10 }),
      Animated.timing(enterOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  /* Melhoria 1: Half renders image filling the half precisely */
  function Half({ produto, side }: { produto: Produto | null; side: 'left' | 'right' }) {
    const gradColors: [string, string] = side === 'left'
      ? [PRIMARY, '#7B1A12']
      : [ACCENT, '#5C4400'];
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
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#1C1C1C', opacity: shimmer }]} />
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
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
        <Text style={cp.halfLabel} numberOfLines={2}>{produto?.nome ?? '–'}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[cp.wrap, { transform: [{ scale: enterScale }], opacity: enterOpacity }]}>
      <View style={cp.circleWrap}>
        <View style={cp.circle}>
          <Half produto={produto1} side="left" />
          <View style={[cp.divider, { backgroundColor: colors.bg }]} />
          <Half produto={produto2} side="right" />
        </View>
        <View style={cp.badge}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={cp.removeBtn} activeOpacity={0.8}>
        <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
        <Text style={cp.removeBtnText}>Alterar sabores</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cp = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  circleWrap: { width: CIRCLE, height: CIRCLE },

  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: '#1A1A1A',
  },
  halfLeft: {},
  halfRight: {},
  divider: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: BG,
    zIndex: 10,
  },
  halfLabel: {
    position: 'absolute',
    bottom: 8,
    left: 4,
    right: 4,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    zIndex: 15,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  removeBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BG,
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[ec.card, { backgroundColor: colors.bgElevated, borderColor: colors.border }, selected && ec.cardSelected]}>
      <View style={ec.imgWrap}>
        {borda.urlImagem ? (
          <Image source={{ uri: borda.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={['#2A2A2A', '#111111']}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <View style={ec.info}>
        <Text style={[ec.name, { color: colors.text }]}>{borda.nome}</Text>
        <Text style={ec.price}>+ {formatCurrency(borda.preco)}</Text>
      </View>
      <View style={[ec.check, selected && ec.checkActive]}>
        {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const ec = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  cardSelected: { borderColor: ACCENT, backgroundColor: `${ACCENT}10` },
  imgWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: { flex: 1 },
  name: { color: '#F5F0E8', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  price: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={es.backBtn} activeOpacity={0.75}>
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
          <Text style={es.pizzaNames}>
            {produto1 ? produto1.nome.split(' ').slice(0, 2).join(' ') : '–'}{' '}
            +{' '}
            {produto2 ? produto2.nome.split(' ').slice(0, 2).join(' ') : '–'}
          </Text>
          <Text style={es.pizzaSize}>{sizeName}</Text>
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
            style={[ec.card, !selectedBorda && ec.cardSelected]}
          >
            <View style={ec.imgWrap}>
              <Ionicons name="close-circle-outline" size={22} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={ec.info}>
              <Text style={ec.name}>Sem borda</Text>
              <Text style={[ec.price, { color: 'rgba(255,255,255,0.3)' }]}>Incluso</Text>
            </View>
            <View style={[ec.check, !selectedBorda && ec.checkActive]}>
              {!selectedBorda && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
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
          colors={['rgba(10,10,10,0)', '#000000']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />

        {/* Qty controls */}
        <View style={es.qtyRow}>
          <TouchableOpacity
            onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
            style={es.qtyBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={es.qtyNum}>{quantidade}</Text>
          <TouchableOpacity
            onPress={() => setQuantidade((q) => q + 1)}
            style={es.qtyBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Price + CTA */}
        <View style={es.ctaRow}>
          <View>
            <Text style={es.totalLabel}>Total</Text>
            <Text style={es.totalPrice}>{formatCurrency(totalFinal)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!canAdd}
            activeOpacity={0.85}
            style={[es.ctaBtn, !canAdd && es.ctaBtnDisabled]}
          >
            <Text style={es.ctaBtnText}>Adicionar ao carrinho</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Snackbar */}
      <Animated.View
        style={[es.snack, { bottom: insets.bottom + 100, opacity: snackOpacity, transform: [{ translateY: snackY }] }]}
        pointerEvents="none"
      >
        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
        <Text style={es.snackText}>Item adicionado! Finalize seu pedido no carrinho</Text>
      </Animated.View>
    </View>
  );
}

const es = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12, gap: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  headerTitle: { color: '#F5F0E8', fontSize: 20, fontWeight: '900' },
  circleSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  pizzaNames: {
    color: '#F5F0E8', fontSize: 14, fontWeight: '700',
    marginTop: 8, textAlign: 'center', paddingHorizontal: 32,
  },
  pizzaSize: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { color: ACCENT, fontSize: 13, fontWeight: '700' },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 24, gap: 12,
  },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 20, marginBottom: 4,
  },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1A1A1A', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: {
    color: '#F5F0E8', fontSize: 20, fontWeight: '900',
    minWidth: 32, textAlign: 'center',
  },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '600' },
  totalPrice: { color: ACCENT, fontSize: 22, fontWeight: '900' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  snack: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 16,
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
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
