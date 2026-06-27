import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orderService';
import { Pedido } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { OrderStatusBadge } from '../../components/specific/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatOrderId } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';

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
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderService.getMyOrders();
      setPedidos(data.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

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
            tintColor="#C0392B"
            colors={['#C0392B']}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color="#1C1C1C" />
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
                <Ionicons name="receipt-outline" size={16} color="#B8860B" />
                <Text style={styles.orderId}>Pedido {formatOrderId(item.id)}</Text>
              </View>
              <OrderStatusBadge status={item.status} />
            </View>

            {/* Date */}
            <View style={styles.cardMid}>
              <Ionicons name="time-outline" size={12} color="#4B5563" />
              <Text style={styles.dateText}>{formatDateTime(item.criadoEm)}</Text>
            </View>

            {/* Bottom row */}
            <View style={styles.cardBottom}>
              <View style={styles.paymentRow}>
                <Ionicons
                  name={METODO_ICON[item.metodoPagamento] ?? 'cash-outline'}
                  size={14}
                  color="#4B5563"
                />
                <Text style={styles.paymentText}>{item.metodoPagamento}</Text>
              </View>
              <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
            </View>
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
    emptyTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
    emptyHint: { color: c.textSecondary, fontSize: 14 },
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    orderId: { color: c.text, fontWeight: '700', fontSize: 14 },
    cardMid: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
    dateText: { color: c.textSecondary, fontSize: 12 },
    cardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    paymentText: { color: c.textSecondary, fontSize: 13 },
    totalText: { color: c.accent, fontWeight: '800', fontSize: 16 },
  });
}
