import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Animated, FlatList, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/theme';
import { Pedido, StatusPedido } from '../../types';
import { formatCurrency, formatOrderId } from '../../utils/helpers';

// Escala de espaçamento única — evita valores "no olho" espalhados pela tela.
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Status config (derivado dos tokens do tema — reage a dark/light) ────
function getStatusColor(c: AppColors): Record<StatusPedido, string> {
  return {
    PENDENTE:   c.warning,
    PREPARANDO: c.primary,
    ENTREGANDO: c.info,
    ENTREGUE:   c.success,
    CANCELADO:  c.textMuted,
  };
}

const STATUS_LABEL: Record<StatusPedido, string> = {
  PENDENTE:   'Pendente',
  PREPARANDO: 'Cozinha',
  ENTREGANDO: 'Em entrega',
  ENTREGUE:   'Entregue',
  CANCELADO:  'Cancelado',
};

const NEXT_STATUS: Partial<Record<StatusPedido, StatusPedido[]>> = {
  PENDENTE:   ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['ENTREGANDO', 'CANCELADO'],
  ENTREGANDO: ['ENTREGUE'],
};

const NEXT_ACTION_LABEL: Partial<Record<StatusPedido, string>> = {
  PENDENTE:   'Enviar para cozinha',
  PREPARANDO: 'Marcar como saiu',
  ENTREGANDO: 'Confirmar entrega',
};

const ACTIVE_STATUSES: StatusPedido[] = ['PENDENTE', 'PREPARANDO', 'ENTREGANDO'];

const METODO_ICON: Record<string, IoniconName> = {
  PIX: 'qr-code-outline', CARTAO: 'card-outline', DINHEIRO: 'cash-outline',
};

function getFilters(c: AppColors): { label: string; value: StatusPedido | null; icon: IoniconName; color: string }[] {
  return [
    { label: 'Todos',    value: null,         icon: 'apps-outline',           color: c.accent  },
    { label: 'Novos',   value: 'PENDENTE',   icon: 'time-outline',           color: c.warning },
    { label: 'Cozinha', value: 'PREPARANDO', icon: 'flame-outline',          color: c.primary },
    { label: 'Entrega', value: 'ENTREGANDO', icon: 'bicycle-outline',        color: c.info    },
    { label: 'Prontos', value: 'ENTREGUE',   icon: 'checkmark-done-outline', color: c.success },
    { label: 'Cancel.', value: 'CANCELADO',  icon: 'close-circle-outline',   color: c.textMuted },
  ];
}

// "Situação dos pedidos" — único painel-resumo da tela (4 mini cards)
function getSituacaoStats(c: AppColors): { label: string; status: StatusPedido; icon: IoniconName; color: string }[] {
  return [
    { label: 'Pendentes',   status: 'PENDENTE',   icon: 'time-outline',           color: c.warning },
    { label: 'Confirmados', status: 'PREPARANDO', icon: 'flame-outline',          color: c.primary },
    { label: 'Em entrega',  status: 'ENTREGANDO', icon: 'bicycle-outline',        color: c.info    },
    { label: 'Concluídos',  status: 'ENTREGUE',   icon: 'checkmark-done-outline', color: c.success },
  ];
}

// ─── Helpers ─────────────────────────────────────────────
function elapsed(criadoEm: string): string {
  const mins = Math.floor((Date.now() - new Date(criadoEm).getTime()) / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}min`;
  const h = Math.floor(mins / 60);
  return `há ${h}h${mins % 60 > 0 ? `${mins % 60}m` : ''}`;
}

function sameDay(iso: string, ref: Date): boolean {
  return new Date(iso).toDateString() === ref.toDateString();
}

// Capitaliza cada parte (ex: "quarta-feira" -> "Quarta-Feira") sem usar
// textTransform:'capitalize', que forçaria maiúscula em conectores ("de").
function capitalizeParts(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

// ─── Skel (shimmer) ───────────────────────────────────────
function Skel({ w, h, r = 8, style }: { w: number | string; h: number; r?: number; style?: object }) {
  const { colors } = useTheme();
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 0.8, duration: 700, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[{ width: w as any, height: h, borderRadius: r, backgroundColor: colors.bgCard, opacity: op }, style]} />;
}

// ─── useCountUp (inteiro) ──────────────────────────────────
function useCountUp(target: number, duration = 600): number {
  const anim = useRef(new Animated.Value(0)).current;
  const [val, setVal] = useState(0);
  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value }) => setVal(Math.round(value)));
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [target]);
  return val;
}

// ─── useCountUpValue (float, para moeda) ───────────────────
function useCountUpValue(target: number, duration = 600): number {
  const anim = useRef(new Animated.Value(0)).current;
  const [val, setVal] = useState(0);
  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value }) => setVal(value));
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [target]);
  return val;
}

// ─── PressableScale ────────────────────────────────────────
// Um único nó animável+pressionável: o `style` (largura, flex, padding, cor)
// precisa cair no mesmo elemento que o grid pai mede como item da linha —
// separar em Pressable (sem style) + Animated.View interno (com o style)
// faz o Pressable colapsar, já que ele não sabe calcular '47%' de nada.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableScale({ onPress, style, children }: { onPress?: () => void; style?: object | object[]; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── VariationBadge ────────────────────────────────────────
function VariationBadge({ value, isPercent, compareLabel }: { value: number; isPercent?: boolean; compareLabel?: string }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const positive = value > 0;
  const neutral  = value === 0;
  const color = neutral ? colors.textSecondary : positive ? colors.success : colors.primary;
  const icon: IoniconName = neutral ? 'remove-outline' : positive ? 'arrow-up' : 'arrow-down';
  const sign = positive ? '+' : '';
  return (
    <View style={[s.varBadge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <Ionicons name={icon} size={10} color={color} />
      <Text style={[s.varBadgeText, { color }]} numberOfLines={1}>
        {sign}{value}{isPercent ? '%' : ''}{compareLabel ? ` ${compareLabel}` : ''}
      </Text>
    </View>
  );
}

// ─── OrderCard ───────────────────────────────────────────
function OrderCard({ pedido, onPress }: { pedido: Pedido; onPress: () => void }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const scale   = useRef(new Animated.Value(1)).current;
  const slideY  = useRef(new Animated.Value(-16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const color     = getStatusColor(colors)[pedido.status];
  const hasNext   = Boolean(NEXT_STATUS[pedido.status]?.length);
  const actionLbl = NEXT_ACTION_LABEL[pedido.status];

  return (
    <Animated.View style={[s.card, { borderLeftColor: color, opacity, transform: [{ translateY: slideY }, { scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()}
        style={{ padding: SPACING.lg }}
      >
        {/* Linha 1: ID + status badge */}
        <View style={s.cardRow1}>
          <Text style={s.cardId} numberOfLines={1}>{formatOrderId(pedido.id)}</Text>
          <View style={[s.statusBadge, { backgroundColor: `${color}18`, borderColor: `${color}55` }]}>
            <View style={[s.statusDot, { backgroundColor: color }]} />
            <Text style={[s.statusText, { color }]} numberOfLines={1}>{STATUS_LABEL[pedido.status]}</Text>
          </View>
        </View>

        {/* Linha 2: horário + pagamento */}
        <View style={s.cardRow2}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={s.cardMeta} numberOfLines={1}>{elapsed(pedido.criadoEm)}</Text>
          <Text style={s.cardMetaDot}>·</Text>
          <Ionicons name={METODO_ICON[pedido.metodoPagamento] ?? 'cash-outline'} size={12} color={colors.textSecondary} />
          <Text style={s.cardMeta} numberOfLines={1}>{pedido.metodoPagamento}</Text>
          {pedido.cupomId && (
            <>
              <Text style={s.cardMetaDot}>·</Text>
              <Ionicons name="pricetag-outline" size={12} color={colors.accent} />
              <Text style={[s.cardMeta, { color: colors.accent }]} numberOfLines={1}>Cupom</Text>
            </>
          )}
        </View>

        {/* Linha 3: total */}
        <Text style={s.cardTotal} numberOfLines={1}>{formatCurrency(pedido.total)}</Text>

        {/* Botão de ação rápida */}
        {hasNext && actionLbl && (
          <View style={[s.actionBtn, { backgroundColor: color }]}>
            <Text style={s.actionBtnText} numberOfLines={1}>{actionLbl}</Text>
            <Ionicons name="arrow-forward" size={14} color="#F5F0E8" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── DashboardSkeleton ─────────────────────────────────────
function DashboardSkeleton() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={{ paddingHorizontal: SPACING.lg, gap: SPACING.xl, paddingTop: SPACING.xs }}>
      {/* 2 cards lado a lado */}
      <View style={s.dashRow}>
        <View style={[s.dashCard, s.dashCardLeft, { borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skel w={70} h={44} r={8} />
            <Skel w={56} h={30} r={6} />
          </View>
          <Skel w={130} h={11} r={5} style={{ marginTop: SPACING.md }} />
          <Skel w={90} h={20} r={10} style={{ marginTop: SPACING.sm }} />
        </View>
        <View style={[s.dashCard, s.dashCardRight, { borderColor: colors.border }]}>
          <Skel w={18} h={18} r={9} />
          <Skel w={90} h={10} r={5} style={{ marginTop: SPACING.sm }} />
          <Skel w={110} h={22} r={6} style={{ marginTop: SPACING.xs }} />
          <Skel w={60} h={18} r={9} style={{ marginTop: SPACING.sm }} />
        </View>
      </View>

      {/* Situação dos pedidos */}
      <View style={[s.situacaoCard, { gap: SPACING.lg }]}>
        <Skel w={160} h={16} r={6} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
          <Skel w="47%" h={62} r={14} />
          <Skel w="47%" h={62} r={14} />
          <Skel w="47%" h={62} r={14} />
          <Skel w="47%" h={62} r={14} />
        </View>
      </View>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        {[72, 80, 76, 80, 76, 70].map((w, i) => <Skel key={i} w={w} h={32} r={16} />)}
      </View>

      {/* Pedidos */}
      {[1, 2, 3].map(i => (
        <View key={i} style={[s.card, { borderLeftColor: colors.border, padding: SPACING.lg, gap: SPACING.md }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skel w={110} h={16} r={6} />
            <Skel w={80}  h={24} r={12} />
          </View>
          <Skel w="60%" h={12} r={5} />
          <Skel w={90} h={18} r={6} />
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════
export function AdminOrdersManagementScreen() {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const FILTERS = useMemo(() => getFilters(colors), [colors]);
  const SITUACAO_STATS = useMemo(() => getSituacaoStats(colors), [colors]);
  const [pedidos,         setPedidos]         = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [statusFilter,    setStatusFilter]    = useState<StatusPedido | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);

  const listOpacity = useRef(new Animated.Value(1)).current;

  // ─── Logic (pedidos/status/API — inalterada) ───────────
  const load = useCallback(async () => {
    try {
      const data = await adminService.getOrders();
      const sorted = data.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      setPedidos(sorted);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFilteredPedidos(statusFilter ? pedidos.filter(p => p.status === statusFilter) : pedidos);
  }, [pedidos, statusFilter]);

  const counts = useMemo(() =>
    pedidos.reduce<Record<string, number>>((acc, p) => {
      acc.total = (acc.total ?? 0) + 1;
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, { total: 0 }),
  [pedidos]);

  const activeOrders = useMemo(
    () => pedidos.filter(p => ACTIVE_STATUSES.includes(p.status)).length,
    [pedidos],
  );

  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return pedidos
      .filter(p => p.status !== 'CANCELADO' && new Date(p.criadoEm).toDateString() === today)
      .reduce((sum, p) => sum + p.total, 0);
  }, [pedidos]);

  // ─── Métricas derivadas (somente exibição — nenhuma API nova) ─────
  const yesterdayRevenue = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return pedidos
      .filter(p => p.status !== 'CANCELADO' && sameDay(p.criadoEm, yesterday))
      .reduce((sum, p) => sum + p.total, 0);
  }, [pedidos]);

  const revenueVariationPct = useMemo(() => {
    if (yesterdayRevenue <= 0) return 0;
    return Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
  }, [todayRevenue, yesterdayRevenue]);

  const ordersVariation = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const todayCount     = pedidos.filter(p => sameDay(p.criadoEm, today)).length;
    const yesterdayCount = pedidos.filter(p => sameDay(p.criadoEm, yesterday)).length;
    if (yesterdayCount === 0) return 0;
    return todayCount - yesterdayCount;
  }, [pedidos]);

  const headerDateLabel = useMemo(() => {
    const now = new Date();
    const weekday = capitalizeParts(now.toLocaleDateString('pt-BR', { weekday: 'long' }));
    const month = now.toLocaleDateString('pt-BR', { month: 'long' });
    const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
    return `${weekday}, ${now.getDate()} de ${monthCap}`;
  }, []);

  const firstName = usuario?.nome?.split(' ')[0] ?? 'Admin';
  const pendingCount = counts['PENDENTE'] ?? 0;

  function handleUpdateStatus(pedido: Pedido) {
    const proximos = NEXT_STATUS[pedido.status];
    if (!proximos?.length) return;
    Alert.alert(
      `Pedido ${formatOrderId(pedido.id)}`,
      'Atualizar status para:',
      [
        ...proximos.map(s => ({ text: STATUS_LABEL[s] === 'Cozinha' ? 'Preparando' : STATUS_LABEL[s], onPress: () => confirmUpdateStatus(pedido.id, s) })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  }

  async function confirmUpdateStatus(id: number, status: StatusPedido) {
    try {
      await adminService.updateOrderStatus(id, status);
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }

  // ─── Filter change with fade ──────────────────────────
  function changeFilter(value: StatusPedido | null) {
    Animated.timing(listOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setStatusFilter(value);
      Animated.timing(listOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  // ─── Count-up ──────────────────────────────────────────
  const activeDisplay  = useCountUp(loading ? 0 : activeOrders);
  const revenueDisplay = useCountUpValue(loading ? 0 : todayRevenue);

  // ─── Header (saudação + notificações) ─────────────────
  const Header = (
    <View style={[s.header, { paddingTop: insets.top + SPACING.md }]}>
      <View style={{ flex: 1, marginRight: SPACING.md }}>
        <Text style={s.greeting} numberOfLines={1}>Olá, {firstName}</Text>
        <Text style={s.headerDate} numberOfLines={1}>{headerDateLabel}</Text>
      </View>
      <TouchableOpacity
        onPress={() => { setRefreshing(true); load(); }}
        style={s.notifBtn}
        activeOpacity={0.75}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {pendingCount > 0 && (
          <View style={s.notifBadge}>
            <Text style={s.notifBadgeText} numberOfLines={1}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // ─── List header (dashboard) ──────────────────────────
  const ListHeader = (
    <>
      {/* 2 cards lado a lado */}
      <View style={s.dashRow}>
        <LinearGradient colors={[colors.bgCard, colors.bg]} style={[s.dashCard, s.dashCardLeft]}>
          <Text style={s.bigNumber} numberOfLines={1} adjustsFontSizeToFit>{activeDisplay}</Text>
          <Text style={s.bigLabel} numberOfLines={1}>Atendimentos ativos</Text>
          <VariationBadge value={ordersVariation} compareLabel="vs ontem" />
        </LinearGradient>

        <LinearGradient colors={[colors.bgCard, colors.bg]} style={[s.dashCard, s.dashCardRight]}>
          <Ionicons name="cash-outline" size={18} color={colors.accent} />
          <Text style={s.smallLabel} numberOfLines={1}>RECEITA DO DIA</Text>
          <Text style={s.revenueValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(revenueDisplay)}</Text>
          <VariationBadge value={revenueVariationPct} isPercent />
        </LinearGradient>
      </View>

      {/* Situação dos pedidos — único painel-resumo */}
      <View style={s.situacaoCard}>
        <View style={s.situacaoHeader}>
          <Text style={s.situacaoTitle} numberOfLines={1}>Situação dos pedidos</Text>
        </View>
        <View style={s.miniGrid}>
          {SITUACAO_STATS.map(stat => (
            <PressableScale
              key={stat.status}
              onPress={() => changeFilter(statusFilter === stat.status ? null : stat.status)}
              style={[s.miniCard, { backgroundColor: `${stat.color}18`, borderColor: `${stat.color}2A` }]}
            >
              <View style={[s.miniIconBox, { backgroundColor: `${stat.color}26` }]}>
                <Ionicons name={stat.icon} size={19} color={stat.color} />
              </View>
              <View style={s.miniTextCol}>
                <Text style={[s.miniNumber, { color: stat.color }]} numberOfLines={1}>{counts[stat.status] ?? 0}</Text>
                <Text style={s.miniLabel} numberOfLines={1}>{stat.label}</Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </View>

      {/* Filtros de fila */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtersRow}
        style={{ marginBottom: SPACING.lg }}
      >
        {FILTERS.map(f => {
          const active = statusFilter === f.value;
          const count  = f.value ? (counts[f.value] ?? 0) : (counts.total ?? 0);
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => changeFilter(f.value)}
              activeOpacity={0.78}
              style={[s.chip, active && s.chipActive]}
            >
              <Ionicons name={f.icon} size={13} color={active ? colors.primary : colors.textSecondary} />
              <Text style={[s.chipLabel, active && { color: colors.text }]} numberOfLines={1}>{f.label}</Text>
              <Text style={[s.chipCount, active && { color: colors.primary }]} numberOfLines={1}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );

  if (loading) {
    return (
      <View style={s.root}>
        {Header}
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {Header}

      <Animated.FlatList
        data={filteredPedidos}
        keyExtractor={item => String(item.id)}
        style={{ opacity: listOpacity }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={s.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
            </View>
            <Text style={s.emptyTitle}>Nenhum pedido por aqui</Text>
            <Text style={s.emptyText}>Assim que um cliente pedir, ele aparece aqui na hora</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard pedido={item} onPress={() => handleUpdateStatus(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      />
    </View>
  );
}

// ─── Styles (dependem do tema — nenhuma cor hardcoded) ────
function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },

    /* Header */
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl,
    },
    greeting:   { color: c.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    headerDate: { color: c.textSecondary, fontSize: 12, fontWeight: '500', marginTop: 4 },
    notifBtn: {
      width: 44, height: 44,
      alignItems: 'center', justifyContent: 'center',
    },
    notifBadge: {
      position: 'absolute', top: 2, right: 2,
      minWidth: 16, height: 16, borderRadius: 8, flexShrink: 0,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 3, borderWidth: 1.5, borderColor: c.bg,
    },
    notifBadgeText: { color: '#F5F0E8', fontSize: 9, fontWeight: '800' },

    /* List */
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },

    /* Dashboard: 2 cards lado a lado */
    dashRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    dashCard: {
      borderRadius: 20, padding: SPACING.xxl, borderWidth: 1, borderColor: `${c.accent}33`,
      shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
    },
    dashCardLeft:  { flex: 1, minHeight: 132 },
    dashCardRight: { flex: 1, minHeight: 132 },

    bigNumber: { flexShrink: 1, color: c.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.5, lineHeight: 42 },
    bigLabel:  { color: c.textSecondary, fontSize: 12, fontWeight: '600', marginTop: SPACING.sm },

    smallLabel:   { color: c.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: SPACING.sm },
    revenueValue: { color: c.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: SPACING.xs },

    varBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0,
      alignSelf: 'flex-start', marginTop: SPACING.sm,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1,
    },
    varBadgeText: { fontSize: 11, fontWeight: '800' },

    /* Situação dos pedidos — dashboard de 4 mini cards */
    situacaoCard: {
      backgroundColor: c.bgCard, borderRadius: 20, padding: SPACING.xl,
      borderWidth: 1, borderColor: c.border, marginBottom: SPACING.xl,
    },
    situacaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
    situacaoTitle:  { color: c.text, fontSize: 16, fontWeight: '800', flexShrink: 1 },

    miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    miniCard: {
      width: '47%', flexGrow: 1,
      flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
      borderRadius: 14, borderWidth: 1,
      paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    },
    miniIconBox: {
      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
      alignItems: 'center', justifyContent: 'center',
    },
    miniTextCol: { flex: 1 },
    miniNumber: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    miniLabel:  { color: c.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },

    /* Filter chips */
    filtersRow: { gap: SPACING.xs, paddingVertical: 2, paddingRight: SPACING.lg },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: SPACING.sm, paddingVertical: 7, borderRadius: 20,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
    },
    chipActive: { borderColor: c.primary, backgroundColor: `${c.primary}1F` },
    chipLabel: { color: c.textSecondary, fontSize: 12, fontWeight: '700' },
    chipCount: { color: c.textSecondary, fontSize: 11, fontWeight: '700', opacity: 0.7 },

    /* Order card */
    card: {
      backgroundColor: c.bgCard, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      borderLeftWidth: 3, overflow: 'hidden',
    },
    cardRow1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
    cardId:   { color: c.text, fontSize: 16, fontWeight: '800', flexShrink: 1, marginRight: SPACING.sm },
    statusBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0,
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 20, borderWidth: 1,
    },
    statusDot:  { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700' },

    cardRow2: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: SPACING.md },
    cardMeta: { color: c.textSecondary, fontSize: 12, fontWeight: '500' },
    cardMetaDot: { color: c.textSecondary, fontSize: 12 },

    cardTotal: { color: c.accent, fontSize: 18, fontWeight: '900' },

    actionBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, marginTop: SPACING.md, paddingVertical: 11, borderRadius: 12,
    },
    actionBtnText: { color: '#F5F0E8', fontSize: 13, fontWeight: '800' },

    /* Empty state */
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 96, paddingHorizontal: SPACING.xxl, gap: SPACING.md },
    emptyIconWrap: {
      width: 88, height: 88, borderRadius: 44,
      backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs,
    },
    emptyTitle: { color: c.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    emptyText:  { color: c.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  });
}
