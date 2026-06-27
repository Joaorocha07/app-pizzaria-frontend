import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
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

export function CheckoutScreen({ navigation }: Props) {
  const { itens, total, cupom, clearCart } = useCart();
  const { colors } = useTheme();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [selectedEndereco, setSelectedEndereco] = useState<Endereco | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('PIX');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      navigation.replace('OrderTracking', { orderId: pedido.id });
    } catch (e: any) {
      Alert.alert('Erro ao fazer pedido', e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Finalizar pedido" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Endereço de entrega</Text>
          {enderecos.length === 0 ? (
            <TouchableOpacity
              className="bg-dark-card border border-dashed border-primary rounded-2xl p-4 items-center"
              onPress={() => navigation.navigate('AddressForm', {})}
            >
              <Text className="text-primary font-bold">+ Adicionar endereço</Text>
            </TouchableOpacity>
          ) : (
            <>
              {enderecos.map((end) => (
                <TouchableOpacity
                  key={end.id}
                  onPress={() => setSelectedEndereco(end)}
                  className={`rounded-2xl p-4 mb-2 border ${
                    selectedEndereco?.id === end.id ? 'border-primary' : ''
                  }`}
                  style={{ backgroundColor: colors.bgElevated, borderColor: selectedEndereco?.id === end.id ? colors.primary : colors.border }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold" style={{ color: colors.text }}>
                        {end.rua}, {end.numero}
                      </Text>
                      {end.complemento && (
                        <Text className="text-gray-400 text-xs">{end.complemento}</Text>
                      )}
                      <Text className="text-gray-400 text-xs">
                        {end.bairro} — {end.cidade}/{end.estado}
                      </Text>
                    </View>
                    <View
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedEndereco?.id === end.id
                          ? 'bg-primary border-primary'
                          : 'border-gray-500'
                      }`}
                    />
                  </View>
                  {end.padrao && (
                    <View className="mt-2">
                      <Text className="text-accent text-xs font-semibold">Endereço padrão</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('AddressForm', {})}
                className="mt-1"
              >
                <Text className="text-primary text-sm font-semibold">+ Novo endereço</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="mb-4">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Forma de pagamento</Text>
          <View className="flex-row gap-3">
            {METODOS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setMetodoPagamento(m.value)}
                className="flex-1 rounded-2xl p-3 items-center border"
                style={{ backgroundColor: colors.bgElevated, borderColor: metodoPagamento === m.value ? colors.primary : colors.border }}
              >
                <Ionicons name={m.icon} size={24} color={metodoPagamento === m.value ? '#C0392B' : '#6B7280'} style={{ marginBottom: 4 }} />
                <Text className={`text-sm font-bold ${metodoPagamento === m.value ? 'text-primary' : 'text-gray-400'}`}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="rounded-2xl p-4 mb-8" style={{ backgroundColor: colors.bgElevated }}>
          <Text className="font-bold mb-3" style={{ color: colors.text }}>Resumo do pedido</Text>
          {itens.map((item, i) => (
            <View key={i} className="flex-row justify-between mb-1">
              <Text className="text-sm flex-1" style={{ color: colors.textSecondary }} numberOfLines={1}>
                {item.quantidade}x {item.produto.nome}
              </Text>
              <Text className="text-sm ml-2" style={{ color: colors.text }}>
                {formatCurrency(item.precoUnitario * item.quantidade)}
              </Text>
            </View>
          ))}
          <View className="h-px my-3" style={{ backgroundColor: colors.border }} />
          <View className="flex-row justify-between">
            <Text className="font-bold" style={{ color: colors.text }}>Total</Text>
            <Text className="font-bold text-lg" style={{ color: colors.accent }}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-8 pt-4 border-t" style={{ backgroundColor: colors.bg, borderTopColor: colors.border }}>
        <Button
          title={`Confirmar pedido — ${formatCurrency(total)}`}
          onPress={handlePlaceOrder}
          loading={submitting}
          size="lg"
        />
      </View>
    </View>
  );
}
