import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orderService';
import { Pedido, HistoricoStatusPedido, StatusPedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, radius } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'OrderTracking'>;
  route: RouteProp<AppStackParamList, 'OrderTracking'>;
};

const STEPS: StatusPedido[] = ['PENDENTE', 'PREPARANDO', 'ENTREGANDO', 'ENTREGUE'];

/*
 * O backend só rastreia 4 estágios reais (StatusPedido). "Em preparo" e "No forno"
 * fazem parte do mesmo estágio PREPARANDO — combinamos os dois no mesmo nó da
 * timeline em vez de inventar um estágio que o servidor não rastreia de verdade.
 */
const STEP_LABELS: Record<StatusPedido, string> = {
  PENDENTE: 'Pedido recebido',
  PREPARANDO: 'Em preparo · No forno',
  ENTREGANDO: 'Saiu para entrega',
  ENTREGUE: 'Entregue!',
  CANCELADO: 'Cancelado',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_ICONS: Record<StatusPedido, IoniconName> = {
  PENDENTE: 'receipt-outline',
  PREPARANDO: 'flame-outline',
  ENTREGANDO: 'bicycle-outline',
  ENTREGUE: 'checkmark-circle-outline',
  CANCELADO: 'close-circle-outline',
};

/* ─── TimelineStep ───────────────────────────────────────────── */
function TimelineStep({
  step,
  index,
  done,
  active,
  isLast,
}: {
  step: StatusPedido;
  index: number;
  done: boolean;
  active: boolean;
  isLast: boolean;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-16)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: index * 90, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, delay: index * 90, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(checkScale, { toValue: done ? 1 : 0, useNativeDriver: true, speed: 16, bounciness: 10 }).start();
  }, [done]);

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <View style={s.stepRow}>
        <View style={s.stepIconCol}>
          {active && (
            <Animated.View
              pointerEvents="none"
              style={[s.pulseRing, { borderColor: colors.primaryGlow, transform: [{ scale: pulse }] }]}
            />
          )}
          <View style={[s.stepCircle, { backgroundColor: done ? colors.primary : colors.bgInput }]}>
            <Ionicons name={STEP_ICONS[step]} size={19} color={done ? '#F4EDE1' : colors.textMuted} />
          </View>
          {!isLast && <View style={[s.stepLine, { backgroundColor: done ? colors.primary : colors.border }]} />}
        </View>

        <View style={s.stepBody}>
          <Text style={[s.stepLabel, { color: done ? colors.text : colors.textMuted }]}>
            {STEP_LABELS[step]}
          </Text>
          {active && <Text style={s.stepActiveHint}>Em andamento</Text>}
        </View>

        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export function OrderTrackingScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<HistoricoStatusPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderHistory(orderId),
      ]);
      setPedido(p);
      setHistorico(h);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || !pedido) return <LoadingSpinner fullScreen message="Carregando pedido..." />;

  const isCanceled = pedido.status === 'CANCELADO';
  const currentStep = isCanceled ? -1 : STEPS.indexOf(pedido.status);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Header
        title={`Pedido ${formatOrderId(pedido.id)}`}
        onBack={() => navigation.navigate('MainTabs', { screen: 'Pedidos' })}
        rightElement={<OrderStatusBadge status={pedido.status} />}
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
        }
      >
        {!isCanceled && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Acompanhamento</Text>
            {STEPS.map((step, index) => (
              <TimelineStep
                key={step}
                step={step}
                index={index}
                done={index <= currentStep}
                active={index === currentStep}
                isLast={index === STEPS.length - 1}
              />
            ))}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.cardTitle}>Informações do pedido</Text>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Pedido feito em</Text>
            <Text style={s.infoValue}>{formatDateTime(pedido.criadoEm)}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Pagamento</Text>
            <Text style={s.infoValue}>{pedido.metodoPagamento}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{formatCurrency(pedido.total)}</Text>
          </View>
        </View>

        {historico.length > 0 && (
          <View style={[s.card, { marginBottom: 32 }]}>
            <Text style={s.cardTitle}>Histórico de status</Text>
            {historico.map((h) => (
              <View key={h.id} style={s.historyRow}>
                <Text style={s.historyDate}>{formatDateTime(h.registradoEm)}</Text>
                <OrderStatusBadge status={h.status} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {pedido.status === 'ENTREGUE' && (
        <View style={[s.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <Button
            title="Avaliar pedido"
            variant="outline"
            onPress={() => navigation.navigate('Review', { orderId: pedido.id })}
          />
        </View>
      )}
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1, paddingHorizontal: 16 },

    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15, marginBottom: 14 },

    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    stepIconCol: { alignItems: 'center', position: 'relative' },
    pulseRing: {
      position: 'absolute',
      top: -3,
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      borderWidth: 2,
    },
    stepCircle: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    stepLine: { width: 2, flex: 1, minHeight: 24, marginTop: 4, marginBottom: 4 },
    stepBody: { flex: 1, paddingTop: 8, paddingBottom: 20 },
    stepLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: 14 },
    stepActiveHint: { color: c.primary, fontFamily: fontFamily.bodySemiBold, fontSize: 11, marginTop: 2 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoLabel: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 13 },
    infoValue: { color: c.text, fontFamily: fontFamily.bodyMedium, fontSize: 13 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
    totalLabel: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15 },
    totalValue: { color: c.accent, fontFamily: fontFamily.headingBold, fontSize: 17 },

    historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    historyDate: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 11, width: 128 },

    footer: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 28,
      borderTopWidth: 1,
    },
  });
}
