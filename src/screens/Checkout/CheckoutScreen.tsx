import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

const METODOS: { value: MetodoPagamento; label: string; emoji: string }[] = [
  { value: 'PIX', label: 'PIX', emoji: '📱' },
  { value: 'CARTAO', label: 'Cartão', emoji: '💳' },
  { value: 'DINHEIRO', label: 'Dinheiro', emoji: '💵' },
];

export function CheckoutScreen({ navigation }: Props) {
  const { itens, total, cupom, clearCart } = useCart();
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
    <View className="flex-1 bg-dark">
      <Header title="Finalizar pedido" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-offwhite font-bold text-base mb-3">Endereço de entrega</Text>
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
                  className={`bg-dark-card rounded-2xl p-4 mb-2 border ${
                    selectedEndereco?.id === end.id ? 'border-primary' : 'border-dark-border'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-offwhite font-semibold">
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
          <Text className="text-offwhite font-bold text-base mb-3">Forma de pagamento</Text>
          <View className="flex-row gap-3">
            {METODOS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setMetodoPagamento(m.value)}
                className={`flex-1 bg-dark-card rounded-2xl p-3 items-center border ${
                  metodoPagamento === m.value ? 'border-primary' : 'border-dark-border'
                }`}
              >
                <Text className="text-2xl mb-1">{m.emoji}</Text>
                <Text className={`text-sm font-bold ${metodoPagamento === m.value ? 'text-primary' : 'text-gray-400'}`}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-dark-card rounded-2xl p-4 mb-8">
          <Text className="text-offwhite font-bold mb-3">Resumo do pedido</Text>
          {itens.map((item, i) => (
            <View key={i} className="flex-row justify-between mb-1">
              <Text className="text-gray-400 text-sm flex-1" numberOfLines={1}>
                {item.quantidade}x {item.produto.nome}
              </Text>
              <Text className="text-offwhite text-sm ml-2">
                {formatCurrency(item.precoUnitario * item.quantidade)}
              </Text>
            </View>
          ))}
          <View className="h-px bg-dark-border my-3" />
          <View className="flex-row justify-between">
            <Text className="text-offwhite font-bold">Total</Text>
            <Text className="text-accent font-bold text-lg">{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-8 pt-4 bg-dark border-t border-dark-border">
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
