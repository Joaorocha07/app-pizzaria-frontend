import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, radius } from '../../theme/theme';
import { Header } from '../../components/common/Header';
import { marketingService } from '../../services/marketingService';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/helpers';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Cart'>;
};

export function CartScreen({ navigation }: Props) {
  const {
    itens,
    subtotal,
    desconto,
    total,
    cupom,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [codigoCupom, setCodigoCupom] = useState('');
  const [loadingCupom, setLoadingCupom] = useState(false);

  async function handleApplyCoupon() {
    if (!codigoCupom.trim()) return;
    setLoadingCupom(true);
    try {
      const c = await marketingService.validateCoupon(codigoCupom.trim().toUpperCase());
      applyCoupon(c);
      setCodigoCupom('');
      Alert.alert('Cupom aplicado!', `Desconto de ${c.tipoDesconto === 'PERCENTUAL' ? `${c.valorDesconto}%` : formatCurrency(c.valorDesconto)} aplicado.`);
    } catch (e: any) {
      Alert.alert('Cupom inválido', e.message);
    } finally {
      setLoadingCupom(false);
    }
  }

  function handleClearCart() {
    Alert.alert('Limpar', 'Deseja limpar o carrinho?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: clearCart },
    ]);
  }

  if (itens.length === 0) {
    return (
      <View style={[s.empty, { backgroundColor: colors.bg }]}>
        <Ionicons name="cart-outline" size={64} color={colors.textMuted} style={{ marginBottom: 16 }} />
        <Text style={s.emptyTitle}>Carrinho vazio</Text>
        <Text style={s.emptySub}>Adicione produtos ao seu carrinho para continuar</Text>
        <Button title="Ver cardápio" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Header
        title="Carrinho"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleClearCart} style={{ width: 44, alignItems: 'flex-end' }} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
        {itens.map((item, index) => (
          <View key={index} style={s.itemCard}>
            <View style={s.itemImgWrap}>
              {item.produto.urlImagem ? (
                <Image source={{ uri: item.produto.urlImagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Ionicons name="pizza-outline" size={26} color={colors.textMuted} />
              )}
            </View>

            <View style={s.itemBody}>
              <View style={s.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName} numberOfLines={2}>{item.produto.nome}</Text>
                  {item.tamanho && <Text style={s.itemMeta}>Tamanho: {item.tamanho.nome}</Text>}
                  {item.borda && <Text style={s.itemMeta}>Borda: {item.borda.nome}</Text>}
                </View>
                <TouchableOpacity onPress={() => removeItem(index)} hitSlop={8} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={22} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={s.itemBottomRow}>
                <View style={s.qtyRow}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(index, item.quantidade - 1)}
                    style={[s.qtyBtn, { backgroundColor: colors.bgInput }]}
                    activeOpacity={0.75}
                  >
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyNum}>{item.quantidade}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(index, item.quantidade + 1)}
                    style={[s.qtyBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.qtyBtnText, { color: '#F4EDE1' }]}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.itemTotal}>{formatCurrency(item.precoUnitario * item.quantidade)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Cupom */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cupom de desconto</Text>
          {cupom ? (
            <View style={s.couponApplied}>
              <View>
                <Text style={s.couponCode}>{cupom.codigo}</Text>
                <Text style={s.couponDesc}>
                  {cupom.tipoDesconto === 'PERCENTUAL'
                    ? `${cupom.valorDesconto}% de desconto`
                    : `${formatCurrency(cupom.valorDesconto)} de desconto`}
                </Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} activeOpacity={0.7}>
                <Text style={s.couponRemove}>Remover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.couponRow}>
              <TextInput
                style={s.couponInput}
                placeholder="Código do cupom"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                value={codigoCupom}
                onChangeText={setCodigoCupom}
              />
              <Button
                title="Aplicar"
                onPress={handleApplyCoupon}
                loading={loadingCupom}
                size="sm"
                variant="outline"
              />
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={s.card}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {desconto > 0 && (
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: colors.success }]}>Desconto</Text>
              <Text style={[s.summaryValue, { color: colors.success }]}>−{formatCurrency(desconto)}</Text>
            </View>
          )}
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
          title={`Fechar pedido — ${formatCurrency(total)}`}
          onPress={() => navigation.navigate('Checkout')}
          size="lg"
        />
      </View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1, paddingHorizontal: 16 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    emptyTitle: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 20, marginBottom: 8 },
    emptySub: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14, textAlign: 'center', marginBottom: 24 },

    itemCard: {
      flexDirection: 'row',
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: 12,
      marginTop: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    itemImgWrap: {
      width: 64,
      height: 64,
      borderRadius: radius.sm,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    itemBody: { flex: 1, justifyContent: 'space-between' },
    itemTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    itemName: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15, lineHeight: 19 },
    itemMeta: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 11, marginTop: 2 },
    itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15 },
    qtyNum: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 14, minWidth: 16, textAlign: 'center' },
    itemTotal: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15 },

    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 15, marginBottom: 12 },

    couponApplied: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: `${c.success}1F`,
      borderRadius: radius.sm,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    couponCode: { color: c.success, fontFamily: fontFamily.bodyBold, fontSize: 14 },
    couponDesc: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 11, marginTop: 2 },
    couponRemove: { color: c.danger, fontFamily: fontFamily.bodySemiBold, fontSize: 13 },
    couponRow: { flexDirection: 'row', gap: 8 },
    couponInput: {
      flex: 1,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.sm,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: c.text,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 14,
    },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14 },
    summaryValue: { color: c.text, fontFamily: fontFamily.bodyMedium, fontSize: 14 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 8 },
    totalLabel: { color: c.text, fontFamily: fontFamily.bodyBold, fontSize: 17 },
    totalValue: { color: c.accent, fontFamily: fontFamily.headingBold, fontSize: 19 },

    footer: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 28,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
  });
}
