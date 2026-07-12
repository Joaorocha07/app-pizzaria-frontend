import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orderService';
import { Pedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { AppColors } from '../../theme/theme';
import { fontFamily, radius } from '../../theme/theme';

const METODO_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  PIX:      'qr-code-outline',
  CARTAO:   'card-outline',
  DINHEIRO: 'cash-outline',
};

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

export function OrdersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addItem } = useCart();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await orderService.getMyOrders();
      setPedidos(data.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
    } catch (e: any) {
      setError(e.message ?? 'Não foi possível carregar seus pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleRepeatOrder(pedido: Pedido) {
    if (!pedido.itens || pedido.itens.length === 0) {
      Alert.alert('Não foi possível repetir', 'Os itens deste pedido não estão disponíveis.');
      return;
    }
    pedido.itens.forEach((item) => {
      addItem(item.produto, item.quantidade, item.tamanhoProduto ?? undefined, item.borda ?? undefined);
    });
    Alert.alert('Itens adicionados!', 'Os itens deste pedido foram adicionados ao seu carrinho.', [
      { text: 'Continuar comprando', style: 'cancel' },
      { text: 'Ver carrinho', onPress: () => navigation.navigate('Cart') },
    ]);
  }

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <View style={styles.root}>
        <Header title="Meus pedidos" />
        <ErrorMessage message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="Meus pedidos" />

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptyHint}>Faça seu primeiro pedido!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
            style={styles.card}
            activeOpacity={0.78}
          >
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Ionicons name="receipt-outline" size={16} color={colors.accent} />
                <Text style={styles.orderId}>Pedido {formatOrderId(item.id)}</Text>
              </View>
              <OrderStatusBadge status={item.status} />
            </View>

            {/* Date */}
            <View style={styles.cardMid}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.dateText}>{formatDateTime(item.criadoEm)}</Text>
            </View>

            {/* Bottom row */}
            <View style={styles.cardBottom}>
              <View style={styles.paymentRow}>
                <Ionicons
                  name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'}
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.paymentText}>{item.metodoPagamento}</Text>
              </View>
              <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
            </View>

            {item.itens && item.itens.length > 0 && (
              <TouchableOpacity
                onPress={() => handleRepeatOrder(item)}
                style={styles.repeatBtn}
                activeOpacity={0.75}
              >
                <Ionicons name="repeat-outline" size={15} color={colors.primary} />
                <Text style={styles.repeatText}>Repetir pedido</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    emptyState: { alignItems: 'center', paddingVertical: 64, gap: 10 },
    emptyTitle: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 18 },
    emptyHint: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14 },
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: radius.md,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    orderId: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 14 },
    cardMid: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
    dateText: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 12 },
    cardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    paymentText: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 13 },
    totalText: { color: c.accent, fontFamily: fontFamily.bodyBold, fontSize: 16 },
    repeatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 12,
      paddingVertical: 10,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    repeatText: { color: c.primary, fontFamily: fontFamily.bodySemiBold, fontSize: 13 },
  });
}
