import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet, Animated, Dimensions, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService, RelatorioVendas, RelatorioProduto } from '../../services/adminService';
import { Pedido } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/theme';

const { width: SW } = Dimensions.get('window');
const H_PAD = 20;

// ─── Tokens derivados do tema (cada componente lê via useTheme) ──
// Helper único para não repetir a mesma desestruturação em cada função.
function useTokens() {
  const { colors: c } = useTheme();
  return {
    c,
    BG: c.bg, CARD: c.bgCard, BORDER: c.border, TEXT: c.text, TEXT2: c.textSecondary,
    RED: c.primary, RED_S: `${c.primary}26`,
    GOLD: c.accent, GOLD_S: `${c.accent}26`,
    GREEN: c.success, GREEN_S: `${c.success}26`,
    BLUE: c.info, BLUE_S: `${c.info}26`,
    AMBER: c.warning,
  };
}

function getCardStyle(c: AppColors): object {
  return {
    backgroundColor: c.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 8,
  };
}

function getStatusCfg(c: AppColors): Record<string, { label: string; color: string }> {
  return {
    PENDENTE:   { label: 'Pendentes',  color: c.warning },
    PREPARANDO: { label: 'Preparando', color: c.warning },
    ENTREGANDO: { label: 'Em entrega', color: c.info },
    ENTREGUE:   { label: 'Entregues',  color: c.success },
    CANCELADO:  { label: 'Cancelados', color: c.primary },
  };
}

const TABS = ['Operacional', 'Financeiro', 'Clientes', 'Produtos'] as const;
type TabType = typeof TABS[number];
type Periodo = 'hoje' | 'semana' | 'mes';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Helpers ─────────────────────────────────────────────
function dateRange(periodo: Periodo) {
  const hoje = new Date();
  const ate = hoje.toISOString().split('T')[0];
  let de: string;
  if (periodo === 'hoje') {
    de = ate;
  } else if (periodo === 'semana') {
    const d = new Date(hoje); d.setDate(d.getDate() - 6); de = d.toISOString().split('T')[0];
  } else {
    const d = new Date(hoje); d.setDate(d.getDate() - 29); de = d.toISOString().split('T')[0];
  }
  return { de, ate };
}

function dayAbbr(daysAgo: number): string {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

function elapsed(criadoEm: string): string {
  const mins = Math.floor((Date.now() - new Date(criadoEm).getTime()) / 60000);
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
}

// ─── Skel (shimmer) ───────────────────────────────────────
function Skel({ w, h, r = 8, style }: { w: number | string; h: number; r?: number; style?: object }) {
  const { c } = useTokens();
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 0.8, duration: 700, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[{ width: w as any, height: h, borderRadius: r, backgroundColor: c.bgCard, opacity: op }, style]} />;
}

// ─── AnimatedBar (barra vertical com spring de entrada) ──
const BAR_MAX_H = 80;
function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(h, { toValue: Math.max(3, pct * BAR_MAX_H), delay, useNativeDriver: false, speed: 14, bounciness: 5 }).start();
  }, [pct]);
  return (
    <View style={{ height: BAR_MAX_H, justifyContent: 'flex-end' }}>
      <Animated.View style={{ height: h, width: 10, borderRadius: 5, overflow: 'hidden' }}>
        <LinearGradient colors={[color, `${color}66`]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      </Animated.View>
    </View>
  );
}

// ─── BarFill (barra horizontal proporcional com spring) ──
function BarFill({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(w, { toValue: pct, delay, useNativeDriver: false, speed: 14, bounciness: 4 }).start();
  }, [pct]);
  return <Animated.View style={{ flex: w, height: '100%', backgroundColor: color, borderRadius: 2 }} />;
}

// ─── ProgressBar (horizontal com gradiente) ───────────────
function ProgressBar({ pct, gradColors }: { pct: number; gradColors: [string, string] }) {
  const { BORDER } = useTokens();
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(w, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
  }, [pct]);
  return (
    <View style={{ height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: 'hidden' }}>
      <Animated.View style={{ flex: w, height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <LinearGradient colors={gradColors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </Animated.View>
    </View>
  );
}

// ─── MetricCard (2x2 header) ─────────────────────────────
function MetricCard({
  icon, label, displayValue, iconColor, iconBg, badge, badgeUp, isLoading, textColor,
}: {
  icon: IoniconName; label: string; displayValue: string;
  iconColor: string; iconBg: string; badge: string; badgeUp: boolean;
  isLoading: boolean; textColor?: string;
}) {
  const { c, TEXT, TEXT2, GREEN, GREEN_S, RED, RED_S } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const scale = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
  }, [displayValue]);
  return (
    <Animated.View style={[cardStyle, { flex: 1, transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()}
        style={{ flex: 1 }}
      >
        {/* Top row: icon + badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: badgeUp ? GREEN_S : RED_S, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
            <Ionicons name={badgeUp ? 'arrow-up' : 'arrow-down'} size={9} color={badgeUp ? GREEN : RED} />
            <Text style={{ color: badgeUp ? GREEN : RED, fontSize: 10, fontWeight: '700' }}>{badge}</Text>
          </View>
        </View>
        {/* Value */}
        {isLoading
          ? <Skel w={64} h={28} r={6} style={{ marginBottom: 6 }} />
          : <Animated.Text style={{ color: textColor ?? TEXT, fontSize: 26, fontWeight: '900', lineHeight: 30, opacity: entrance }}>{displayValue}</Animated.Text>
        }
        <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600', marginTop: 4 }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── StatusSegments ───────────────────────────────────────
function StatusSegments({ porStatus, total, isLoading }: {
  porStatus: { status: string; quantidade: number }[];
  total: number; isLoading: boolean;
}) {
  const { c, TEXT, TEXT2, BORDER } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const STATUS_CFG = useMemo(() => getStatusCfg(c), [c]);
  return (
    <View style={[cardStyle, { marginTop: 14 }]}>
      <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800', marginBottom: 14 }}>Status dos pedidos</Text>
      {isLoading ? (
        <View style={{ gap: 12 }}>
          {[80, 55, 90, 45].map((w, i) => <Skel key={i} w={`${w}%`} h={12} r={6} />)}
        </View>
      ) : total === 0 ? (
        <Text style={{ color: TEXT2, fontSize: 13 }}>Sem pedidos registrados</Text>
      ) : (
        <>
          {/* Segmented bar */}
          <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16, backgroundColor: BORDER }}>
            {porStatus.map(({ status, quantidade }) => {
              const cfg = STATUS_CFG[status];
              const pct = total > 0 ? quantidade / total : 0;
              if (pct < 0.01 || !cfg) return null;
              return <View key={status} style={{ flex: pct, backgroundColor: cfg.color }} />;
            })}
          </View>
          {porStatus.map(({ status, quantidade }) => {
            const cfg = STATUS_CFG[status];
            if (!cfg) return null;
            const pct = total > 0 ? Math.round((quantidade / total) * 100) : 0;
            return (
              <View key={status} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.color }} />
                <Text style={{ color: TEXT2, fontSize: 13, flex: 1 }}>{cfg.label}</Text>
                <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '700', minWidth: 34 }}>{pct}%</Text>
                <Text style={{ color: TEXT, fontSize: 13, fontWeight: '800', minWidth: 24, textAlign: 'right' }}>{quantidade}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

// ─── HourlyChart ─────────────────────────────────────────
function HourlyChart({ orders }: { orders: Pedido[] }) {
  const { c, TEXT, TEXT2, RED } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const hours = Array.from({ length: 13 }, (_, i) => i + 10);
  const counts = hours.map(h => orders.filter(o => new Date(o.criadoEm).getHours() === h).length);
  const max = Math.max(...counts, 1);
  const nowH = new Date().getHours();
  return (
    <View style={[cardStyle, { marginTop: 14 }]}>
      <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800' }}>Pedidos por hora</Text>
      <Text style={{ color: TEXT2, fontSize: 11, marginBottom: 16, marginTop: 2 }}>Distribuição de hoje</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {hours.map((h, i) => (
          <View key={h} style={{ flex: 1, alignItems: 'center' }}>
            {counts[i] > 0 && (
              <Text style={{ color: TEXT2, fontSize: 7, marginBottom: 2 }}>{counts[i]}</Text>
            )}
            <AnimatedBar pct={counts[i] / max} color={h === nowH ? RED : c.borderStrong} delay={i * 40} />
            {i % 4 === 0 && <Text style={{ color: TEXT2, fontSize: 7, marginTop: 4 }}>{h}h</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── WeeklyBars ──────────────────────────────────────────
function WeeklyBars({ data, barColor, isLoading }: {
  data: number[]; barColor?: string; isLoading: boolean;
}) {
  const { c, TEXT2, RED } = useTokens();
  const resolvedBarColor = barColor ?? RED;
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100 }}>
      {data.map((v, i) => {
        const isLast = i === data.length - 1;
        if (isLoading) return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 }}>
            <Skel w={10} h={Math.random() * 50 + 20} r={5} />
          </View>
        );
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            {v > 0 && <Text style={{ color: isLast ? resolvedBarColor : TEXT2, fontSize: 7, marginBottom: 2 }}>{v > 999 ? `${(v/1000).toFixed(1)}k` : v}</Text>}
            <AnimatedBar pct={v / max} color={isLast ? resolvedBarColor : c.borderStrong} delay={i * 50} />
            <Text style={{ color: TEXT2, fontSize: 7, marginTop: 4 }}>{dayAbbr(data.length - 1 - i)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// ─── ABA OPERACIONAL ─────────────────────────────────────
// ═══════════════════════════════════════════════════════
function TabOperacional() {
  const { c, BG, TEXT, TEXT2, RED, RED_S, GREEN } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const STATUS_CFG = useMemo(() => getStatusCfg(c), [c]);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const all = await adminService.getOrders({ data: today });
      setOrders(all);
    } catch {
      // silently fail
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const active = orders.filter(o => ['PENDENTE', 'PREPARANDO', 'ENTREGANDO'].includes(o.status));

  // Group today's orders by status for segment chart
  const statusMap: Record<string, number> = {};
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
  const porStatus = Object.entries(statusMap).map(([status, quantidade]) => ({ status, quantidade }));

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: H_PAD, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={RED} />}
    >
      {/* Em andamento */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800' }}>Em andamento</Text>
          <View style={{ backgroundColor: RED_S, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: RED, fontSize: 12, fontWeight: '800' }}>{loading ? '…' : active.length}</Text>
          </View>
        </View>
        {loading ? (
          <View style={{ gap: 10 }}>{[1, 2, 3].map(i => <Skel key={i} w="100%" h={48} r={10} />)}</View>
        ) : active.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle-outline" size={32} color={GREEN} />
            <Text style={{ color: TEXT2, fontSize: 13 }}>Nenhum pedido ativo agora</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {active.map(o => {
              const cfg = STATUS_CFG[o.status];
              return (
                <View key={o.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingVertical: 10, paddingHorizontal: 12,
                  backgroundColor: BG, borderRadius: 12,
                  borderLeftWidth: 3, borderLeftColor: cfg?.color ?? TEXT2,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: TEXT, fontSize: 13, fontWeight: '700' }}>Pedido #{o.id}</Text>
                    <Text style={{ color: TEXT2, fontSize: 11, marginTop: 2 }}>{cfg?.label ?? o.status}</Text>
                  </View>
                  <Text style={{ color: cfg?.color ?? TEXT2, fontSize: 12, fontWeight: '700' }}>{elapsed(o.criadoEm)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Gráfico horário */}
      {loading
        ? <View style={[cardStyle, { marginTop: 14 }]}><Skel w="100%" h={130} r={8} /></View>
        : <HourlyChart orders={orders} />
      }

      {/* Status breakdown */}
      <StatusSegments porStatus={porStatus} total={orders.length} isLoading={loading} />
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════
// ─── ABA FINANCEIRO ──────────────────────────────────────
// ═══════════════════════════════════════════════════════
function TabFinanceiro() {
  const { c, BORDER, TEXT, TEXT2, RED, GOLD, GOLD_S, GREEN, BLUE, BLUE_S, RED_S } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [vendas, setVendas] = useState<RelatorioVendas | null>(null);
  const [prevVendas, setPrevVendas] = useState<RelatorioVendas | null>(null);
  const [weekRevenue, setWeekRevenue] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { de, ate } = dateRange(periodo);

      // Previous period start
      const days = periodo === 'hoje' ? 1 : periodo === 'semana' ? 7 : 30;
      const prevAte = new Date(de); prevAte.setDate(prevAte.getDate() - 1);
      const prevDe = new Date(prevAte); prevDe.setDate(prevDe.getDate() - (days - 1));

      const [curr, prev] = await Promise.all([
        adminService.getSalesReport({ de, ate }),
        adminService.getSalesReport({ de: prevDe.toISOString().split('T')[0], ate: prevAte.toISOString().split('T')[0] }),
      ]);
      setVendas(curr);
      setPrevVendas(prev);

      // Weekly revenue breakdown (7 individual days)
      const dayRevenues = await Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          const day = d.toISOString().split('T')[0];
          try {
            const r = await adminService.getSalesReport({ de: day, ate: day });
            return r.receita;
          } catch { return 0; }
        }),
      );
      setWeekRevenue(dayRevenues);
    } catch {
      // silently fail
    } finally { setLoading(false); setRefreshing(false); }
  }, [periodo]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const ticket = vendas && vendas.totalPedidos > 0 ? vendas.receita / vendas.totalPedidos : 0;
  const receitaDiff = (vendas?.receita ?? 0) - (prevVendas?.receita ?? 0);
  const diffUp = receitaDiff >= 0;
  const cancelados = vendas?.porStatus.find(p => p.status === 'CANCELADO')?.quantidade ?? 0;

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoje', label: 'Hoje' }, { key: 'semana', label: 'Semana' }, { key: 'mes', label: 'Mês' },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: H_PAD, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={RED} />}
    >
      {/* Filtro período */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
        {periodos.map(({ key, label }) => (
          <TouchableOpacity
            key={key} onPress={() => setPeriodo(key)} activeOpacity={0.75}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: periodo === key ? BORDER : 'transparent', borderWidth: 1, borderColor: BORDER }}
          >
            <Text style={{ color: periodo === key ? TEXT : TEXT2, fontSize: 13, fontWeight: '700' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card faturamento principal */}
      <View style={cardStyle}>
        <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Faturamento</Text>
        {loading
          ? <View style={{ marginTop: 8, gap: 8 }}><Skel w={160} h={38} r={8} /><Skel w={120} h={14} r={6} /></View>
          : <>
              <Text style={{ color: TEXT, fontSize: 34, fontWeight: '900', marginTop: 6, lineHeight: 40 }}>
                {formatCurrency(vendas?.receita ?? 0)}
              </Text>
              <Text style={{ color: diffUp ? GREEN : RED, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                {diffUp ? '▲' : '▼'} {formatCurrency(Math.abs(receitaDiff))} vs período anterior
              </Text>
            </>
        }
        {/* Sparkline de 7 dias */}
        <View style={{ marginTop: 18 }}>
          <WeeklyBars data={weekRevenue} barColor={RED} isLoading={loading} />
        </View>
      </View>

      {/* Ticket médio + Total pedidos */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={[cardStyle, { flex: 1 }]}>
          <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: BLUE_S, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Ionicons name="receipt-outline" size={16} color={BLUE} />
          </View>
          <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600' }}>Ticket Médio</Text>
          {loading ? <Skel w={80} h={24} r={6} style={{ marginTop: 6 }} /> : (
            <Text style={{ color: TEXT, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{formatCurrency(ticket)}</Text>
          )}
        </View>
        <View style={[cardStyle, { flex: 1 }]}>
          <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: GOLD_S, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Ionicons name="bag-outline" size={16} color={GOLD} />
          </View>
          <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600' }}>Total Pedidos</Text>
          {loading ? <Skel w={60} h={24} r={6} style={{ marginTop: 6 }} /> : (
            <Text style={{ color: TEXT, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{vendas?.totalPedidos ?? 0}</Text>
          )}
        </View>
      </View>

      {/* Cancelamentos */}
      {!loading && (
        <View style={[cardStyle, { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: RED_S, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close-circle-outline" size={18} color={RED} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600' }}>Cancelamentos</Text>
            <Text style={{ color: cancelados > 0 ? RED : GREEN, fontSize: 20, fontWeight: '900', marginTop: 2 }}>{cancelados}</Text>
          </View>
          {cancelados > 0 && (
            <Text style={{ color: RED, fontSize: 11, fontWeight: '600', textAlign: 'right' }}>
              {Math.round((cancelados / Math.max(vendas?.totalPedidos ?? 1, 1)) * 100)}%{'\n'}dos pedidos
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════
// ─── ABA CLIENTES ────────────────────────────────────────
// ═══════════════════════════════════════════════════════
function TabClientes() {
  const { c, TEXT, TEXT2, RED, GOLD, BLUE, BLUE_S } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await adminService.getOrders();
      const { de, ate } = dateRange('mes');
      setOrders(all.filter(o => { const d = o.criadoEm.split('T')[0]; return d >= de && d <= ate; }));
    } catch {
      // silently fail
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const userCounts: Record<number, number> = {};
  orders.forEach(o => { userCounts[o.usuarioId] = (userCounts[o.usuarioId] ?? 0) + 1; });
  const uniqueUsers = Object.keys(userCounts).length;
  const loyalCount = Object.values(userCounts).filter(n => n > 1).length;
  const loyaltyPct = uniqueUsers > 0 ? loyalCount / uniqueUsers : 0;

  // First order date per user → new customers per day (last 7)
  const firstOrderDate: Record<number, string> = {};
  orders.forEach(o => {
    const d = o.criadoEm.split('T')[0];
    if (!firstOrderDate[o.usuarioId] || d < firstOrderDate[o.usuarioId]) firstOrderDate[o.usuarioId] = d;
  });
  const newPerDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().split('T')[0];
    return Object.values(firstOrderDate).filter(fd => fd === day).length;
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: H_PAD, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={RED} />}
    >
      {/* Total clientes */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: BLUE_S, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="people-outline" size={18} color={BLUE} />
          </View>
          <Text style={{ color: TEXT2, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Clientes únicos (30 dias)</Text>
        </View>
        {loading ? <Skel w={80} h={38} r={8} /> : (
          <Text style={{ color: TEXT, fontSize: 36, fontWeight: '900' }}>{uniqueUsers}</Text>
        )}
        <Text style={{ color: TEXT2, fontSize: 11, marginTop: 4 }}>com pedidos no último mês</Text>
      </View>

      {/* Novos por dia */}
      <View style={[cardStyle, { marginTop: 12 }]}>
        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800' }}>Novos clientes</Text>
        <Text style={{ color: TEXT2, fontSize: 11, marginTop: 2, marginBottom: 14 }}>Últimos 7 dias (1ª compra)</Text>
        <WeeklyBars data={newPerDay} barColor={GOLD} isLoading={loading} />
      </View>

      {/* Fidelização */}
      <View style={[cardStyle, { marginTop: 12 }]}>
        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800' }}>Fidelização</Text>
        <Text style={{ color: TEXT2, fontSize: 11, marginTop: 2, marginBottom: 14 }}>clientes com mais de 1 pedido</Text>
        {loading ? (
          <View style={{ gap: 10 }}><Skel w={80} h={34} r={8} /><Skel w="100%" h={6} r={3} /></View>
        ) : (
          <>
            <Text style={{ color: TEXT, fontSize: 32, fontWeight: '900', marginBottom: 12 }}>
              {Math.round(loyaltyPct * 100)}%
            </Text>
            <ProgressBar pct={loyaltyPct} gradColors={[RED, GOLD]} />
            <Text style={{ color: TEXT2, fontSize: 11, marginTop: 10 }}>
              {loyalCount} de {uniqueUsers} clientes fidelizados
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════
// ─── ABA PRODUTOS ────────────────────────────────────────
// ═══════════════════════════════════════════════════════
function TabProdutos() {
  const { c, BORDER, TEXT, TEXT2, RED, RED_S, GOLD } = useTokens();
  const cardStyle = useMemo(() => getCardStyle(c), [c]);
  const [produtos, setProdutos] = useState<RelatorioProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminService.getProductsReport();
      setProdutos(data.sort((a, b) => b.quantidade - a.quantidade));
    } catch {
      // silently fail
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const top5 = produtos.slice(0, 5);
  const maxQty = top5[0]?.quantidade ?? 1;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: H_PAD, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={RED} />}
    >
      {/* Top 5 */}
      <View style={cardStyle}>
        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800', marginBottom: 18 }}>Top 5 pizzas</Text>
        {loading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <View key={i} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Skel w={22} h={16} r={4} />
                  <Skel w={`${80 - i * 8}%`} h={14} r={6} />
                </View>
                <Skel w="100%" h={4} r={2} />
              </View>
            ))}
          </View>
        ) : top5.length === 0 ? (
          <View style={{ paddingVertical: 24, alignItems: 'center', gap: 8 }}>
            <Ionicons name="bar-chart-outline" size={36} color={BORDER} />
            <Text style={{ color: TEXT2, fontSize: 13 }}>Nenhum dado disponível</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {top5.map((item, i) => {
              const pct = item.quantidade / maxQty;
              const rankColor = i < 3 ? GOLD : TEXT2;
              const isFirst = i === 0;
              return (
                <View key={item.produto.id} style={{ gap: 7 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ color: rankColor, fontSize: 13, fontWeight: '900', minWidth: 22 }}>#{i + 1}</Text>
                    <Text style={{ color: TEXT, fontSize: 13, fontWeight: '700', flex: 1 }} numberOfLines={1}>{item.produto.nome}</Text>
                    <View style={{ backgroundColor: isFirst ? RED_S : BORDER, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                      <Text style={{ color: isFirst ? RED : TEXT2, fontSize: 11, fontWeight: '700' }}>{item.quantidade} un.</Text>
                    </View>
                  </View>
                  <View style={{ height: 4, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                    <BarFill pct={pct} color={isFirst ? RED : c.borderStrong} delay={i * 80} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Outros produtos */}
      {!loading && produtos.length > 5 && (
        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800', marginBottom: 14 }}>Outros produtos</Text>
          <View style={{ gap: 10 }}>
            {produtos.slice(5, 12).map((item, i) => (
              <View key={item.produto.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <Text style={{ color: TEXT2, fontSize: 12, fontWeight: '700', minWidth: 22 }}>{i + 6}</Text>
                <Text style={{ color: TEXT, fontSize: 13, flex: 1 }} numberOfLines={1}>{item.produto.nome}</Text>
                <Text style={{ color: TEXT2, fontSize: 12, fontWeight: '700' }}>{item.quantidade} un.</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════
// ─── ADMINREPORTSSCREEN ──────────────────────────────────
// ═══════════════════════════════════════════════════════
export function AdminReportsScreen() {
  const { BG, BORDER, TEXT, TEXT2, RED, RED_S, GOLD, GOLD_S, GREEN, GREEN_S, BLUE, BLUE_S } = useTokens();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('Operacional');
  const [vendas, setVendas] = useState<RelatorioVendas | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const TAB_W = (SW - H_PAD * 2) / TABS.length;
  const underlineX = useRef(new Animated.Value(0)).current;

  function selectTab(tab: TabType) {
    const idx = TABS.indexOf(tab);
    Animated.timing(underlineX, { toValue: idx * TAB_W, duration: 250, useNativeDriver: true }).start();
    setActiveTab(tab);
  }

  useEffect(() => {
    setLoadingMetrics(true);
    const { de, ate } = dateRange('hoje');
    adminService.getSalesReport({ de, ate })
      .then(setVendas)
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));
  }, [refreshKey]);

  const cancelados = vendas?.porStatus.find(p => p.status === 'CANCELADO')?.quantidade ?? 0;
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* ── Header ─────────────────────────────── */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: H_PAD, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: TEXT2, fontSize: 12, fontWeight: '500', marginBottom: 3 }}>Olá, Admin</Text>
            <Text style={{ color: TEXT, fontSize: 24, fontWeight: '900' }}>Dashboard</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ color: TEXT2, fontSize: 11 }}>{hoje}</Text>
            <TouchableOpacity
              onPress={() => { setLoadingMetrics(true); setRefreshKey(k => k + 1); }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: BORDER, alignItems: 'center', justifyContent: 'center' }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color={TEXT} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Separador gradiente */}
      <LinearGradient
        colors={[BORDER, 'transparent']}
        style={{ height: 1, marginHorizontal: H_PAD, marginBottom: 14 }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      />

      {/* ── Cards 2×2 ──────────────────────────── */}
      <View style={{ paddingHorizontal: H_PAD, gap: 10, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard
            icon="cube-outline" label="Pedidos hoje"
            displayValue={String(vendas?.totalPedidos ?? 0)}
            iconColor={GOLD} iconBg={GOLD_S}
            badge="hoje" badgeUp={true} isLoading={loadingMetrics}
          />
          <MetricCard
            icon="cash-outline" label="Faturamento"
            displayValue={formatCurrency(vendas?.receita ?? 0)}
            iconColor={GREEN} iconBg={GREEN_S}
            badge="hoje" badgeUp={(vendas?.receita ?? 0) > 0} isLoading={loadingMetrics}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard
            icon="people-outline" label="Ver aba Clientes"
            displayValue="—"
            iconColor={BLUE} iconBg={BLUE_S}
            badge="mês" badgeUp={true} isLoading={false}
          />
          <MetricCard
            icon="close-circle-outline" label="Cancelamentos"
            displayValue={String(cancelados)}
            iconColor={RED} iconBg={RED_S}
            badge={cancelados > 0 ? 'atenção' : 'ok'} badgeUp={cancelados === 0}
            isLoading={loadingMetrics} textColor={cancelados > 0 ? RED : TEXT}
          />
        </View>
      </View>

      {/* ── Tab bar ──────────────────────────────── */}
      <View style={{ paddingHorizontal: H_PAD, marginBottom: 2 }}>
        <View style={{ flexDirection: 'row' }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => selectTab(tab)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }} activeOpacity={0.7}>
              <Text style={{ color: activeTab === tab ? TEXT : TEXT2, fontSize: 13, fontWeight: activeTab === tab ? '800' : '500' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 2, backgroundColor: BORDER, borderRadius: 1 }}>
          <Animated.View style={{
            position: 'absolute', left: 0, top: 0, width: TAB_W, height: 2,
            backgroundColor: RED, borderRadius: 1,
            transform: [{ translateX: underlineX }],
          }} />
        </View>
      </View>

      {/* ── Conteúdo das abas ────────────────────── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'Operacional' && <TabOperacional />}
        {activeTab === 'Financeiro'  && <TabFinanceiro />}
        {activeTab === 'Clientes'    && <TabClientes />}
        {activeTab === 'Produtos'    && <TabProdutos />}
      </View>
    </View>
  );
}
