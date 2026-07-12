import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, radius } from '../../theme/theme';
import { Header } from '../../components/common/Header';
import { useCart } from '../../contexts/CartContext';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import { Endereco, MetodoPagamento } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Checkout'>;
};

const METODOS: { value: MetodoPagamento; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'PIX', label: 'PIX', icon: 'phone-portrait-outline' },
  { value: 'CARTAO', label: 'Cartão', icon: 'card-outline' },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: 'cash-outline' },
];

/* ─── Overlay de sucesso ao confirmar o pedido ──────────────── */
function SuccessOverlay({ visible }: { visible: boolean }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 10 }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.successOverlay, { opacity }]} pointerEvents="auto">
      <Animated.View style={[s.successCircle, { transform: [{ scale }] }]}>
        <Ionicons name="checkmark" size={44} color="#F4EDE1" />
      </Animated.View>
      <Text style={s.successTitle}>Pedido confirmado!</Text>
      <Text style={s.successSub}>Estamos preparando tudo com carinho</Text>
    </Animated.View>
  );
}

export function CheckoutScreen({ navigation }: Props) {
  const { itens, total, cupom, clearCart } = useCart();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [selectedEndereco, setSelectedEndereco] = useState<Endereco | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('PIX');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userService.getAddresses()
      .then((data) => {
        setEnderecos(data);
        const padrao = data.find((e) => e.padrao) ?? data[0];
        if (padrao) setSelectedEndereco(padrao);
      })
      .catch((e) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handlePlaceOrder() {
    if (!selectedEndereco) {
      Alert.alert('Atenção', 'Selecione um endereço de entrega');
      return;
    }

    setSubmitting(true);
    try {
      const pedido = await orderService.createOrder({
        enderecoId: selectedEndereco.id,
        metodoPagamento,
        codigoCupom: cupom?.codigo,
        itens: itens.map((item) => ({
          produtoId: item.produto.id,
          tamanhoProdutoId: item.tamanho?.id ?? null,
          bordaId: item.borda?.id ?? null,
          quantidade: item.quantidade,
          preco: item.precoUnitario,
        })),
      });
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        navigation.replace('OrderTracking', { orderId: pedido.id });
      }, 1300);
    } catch (e: any) {
      setSubmitting(false);
      Alert.alert('Erro ao fazer pedido', e.message);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Header title="Finalizar pedido" onBack={() => navigation.goBack()} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Endereço de entrega</Text>
          {enderecos.length === 0 ? (
            <TouchableOpacity
              style={s.addAddressBtn}
              onPress={() => navigation.navigate('AddressForm', {})}
              activeOpacity={0.8}
            >
              <Text style={s.addAddressText}>+ Adicionar endereço</Text>
            </TouchableOpacity>
          ) : (
            <>
              {enderecos.map((end) => {
                const active = selectedEndereco?.id === end.id;
                return (
                  <TouchableOpacity
                    key={end.id}
                    onPress={() => setSelectedEndereco(end)}
                    style={[s.addressCard, { borderColor: active ? colors.primary : colors.border }]}
                    activeOpacity={0.85}
                  >
                    <View style={s.addressRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.addressLine}>{end.rua}, {end.numero}</Text>
                        {end.complemento && <Text style={s.addressMeta}>{end.complemento}</Text>}
                        <Text style={s.addressMeta}>{end.bairro} — {end.cidade}/{end.estado}</Text>
                      </View>
                      <View style={[s.radio, active && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                    </View>
                    {end.padrao && <Text style={s.addressDefault}>Endereço padrão</Text>}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => navigation.navigate('AddressForm', {})} style={{ marginTop: 4 }} activeOpacity={0.7}>
                <Text style={s.newAddressLink}>+ Novo endereço</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Forma de pagamento</Text>
          <View style={s.paymentRow}>
            {METODOS.map((m) => {
              const active = metodoPagamento === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setMetodoPagamento(m.value)}
                  style={[s.paymentCard, { borderColor: active ? colors.primary : colors.border }]}
                  activeOpacity={0.85}
                >
                  <Ionicons name={m.icon} size={24} color={active ? colors.primary : colors.textMuted} style={{ marginBottom: 4 }} />
                  <Text style={[s.paymentLabel, { color: active ? colors.primary : colors.textSecondary }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.summaryCard}>
          <Text style={s.sectionTitle}>Resumo do pedido</Text>
          {itens.map((item, i) => (
            <View key={i} style={s.summaryRow}>
              <Text style={s.summaryItem} numberOfLines={1}>{item.quantidade}x {item.produto.nome}</Text>
              <Text style={s.summaryItemPrice}>{formatCurrency(item.precoUnitario * item.quantidade)}</Text>
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={s.footer}>
        <Button
          title={`Confirmar pedido — ${formatCurrency(total)}`}
          onPress={handlePlaceOrder}
          loading={submitting}
          size="lg"
        />
      </View>

      <SuccessOverlay visible={success} />
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1, paddingHorizontal: 16 },

    section: { marginTop: 16 },
    sectionTitle: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15, marginBottom: 12 },

    addAddressBtn: {
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.primary,
      borderRadius: radius.md,
      padding: 16,
      alignItems: 'center',
    },
    addAddressText: { color: c.primary, fontFamily: fontFamily.bodyBold, fontSize: 14 },

    addressCard: {
      backgroundColor: c.bgElevated,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 14,
      marginBottom: 8,
    },
    addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    addressLine: { color: c.text, fontFamily: fontFamily.bodySemiBold, fontSize: 14 },
    addressMeta: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 11, marginTop: 2 },
    addressDefault: { color: c.accent, fontFamily: fontFamily.bodySemiBold, fontSize: 11, marginTop: 8 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.textMuted },
    newAddressLink: { color: c.primary, fontFamily: fontFamily.bodySemiBold, fontSize: 13 },

    paymentRow: { flexDirection: 'row', gap: 12 },
    paymentCard: {
      flex: 1,
      backgroundColor: c.bgElevated,
      borderWidth: 1.5,
      borderRadius: radius.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    paymentLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13 },

    summaryCard: {
      backgroundColor: c.bgElevated,
      borderRadius: radius.md,
      padding: 16,
      marginTop: 16,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: c.border,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryItem: { flex: 1, color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 13 },
    summaryItemPrice: { color: c.text, fontFamily: fontFamily.bodyMedium, fontSize: 13, marginLeft: 8 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 10 },
    totalLabel: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15 },
    totalValue: { color: c.accent, fontFamily: fontFamily.headingBold, fontSize: 17 },

    footer: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 28,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },

    /* Success overlay */
    successOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    successCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: c.success,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    successTitle: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 22, marginBottom: 6 },
    successSub: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14 },
  });
}
