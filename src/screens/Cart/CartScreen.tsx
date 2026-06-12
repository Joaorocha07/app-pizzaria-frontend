import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
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

  if (itens.length === 0) {
    return (
      <View className="flex-1 bg-dark items-center justify-center px-6">
        <Ionicons name="cart-outline" size={64} color="#6B7280" style={{ marginBottom: 16 }} />
        <Text className="text-offwhite text-xl font-bold mb-2">Carrinho vazio</Text>
        <Text className="text-gray-400 text-center mb-6">
          Adicione produtos ao seu carrinho para continuar
        </Text>
        <Button title="Ver cardápio" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8B1A1A" />
        </TouchableOpacity>
        <Text className="text-offwhite text-xl font-bold">Carrinho</Text>
        <TouchableOpacity onPress={() => Alert.alert('Limpar', 'Deseja limpar o carrinho?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Limpar', style: 'destructive', onPress: clearCart },
        ])}>
          <Text className="text-danger text-sm">Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {itens.map((item, index) => (
          <View key={index} className="bg-dark-card rounded-2xl p-4 mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-offwhite font-bold text-base">{item.produto.nome}</Text>
                {item.tamanho && (
                  <Text className="text-gray-400 text-xs mt-0.5">Tamanho: {item.tamanho.nome}</Text>
                )}
                {item.borda && (
                  <Text className="text-gray-400 text-xs">Borda: {item.borda.nome}</Text>
                )}
                <Text className="text-accent font-bold mt-1">
                  {formatCurrency(item.precoUnitario)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(index)} className="ml-2 p-1">
                <Ionicons name="close-circle" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => updateQuantity(index, item.quantidade - 1)}
                  className="w-8 h-8 bg-dark-border rounded-full items-center justify-center"
                >
                  <Text className="text-offwhite font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-offwhite font-bold">{item.quantidade}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(index, item.quantidade + 1)}
                  className="w-8 h-8 bg-primary rounded-full items-center justify-center"
                >
                  <Text className="text-offwhite font-bold">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-offwhite font-bold">
                {formatCurrency(item.precoUnitario * item.quantidade)}
              </Text>
            </View>
          </View>
        ))}

        <View className="bg-dark-card rounded-2xl p-4 mb-3">
          <Text className="text-offwhite font-bold mb-3">Cupom de desconto</Text>
          {cupom ? (
            <View className="flex-row items-center justify-between bg-green-900/30 rounded-xl px-4 py-3">
              <View>
                <Text className="text-success font-bold">{cupom.codigo}</Text>
                <Text className="text-gray-400 text-xs">
                  {cupom.tipoDesconto === 'PERCENTUAL'
                    ? `${cupom.valorDesconto}% de desconto`
                    : `${formatCurrency(cupom.valorDesconto)} de desconto`}
                </Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text className="text-danger text-sm">Remover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-dark border border-dark-border rounded-xl px-4 py-3 text-offwhite"
                placeholder="Código do cupom"
                placeholderTextColor="#6B7280"
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

        <View className="bg-dark-card rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Subtotal</Text>
            <Text className="text-offwhite">{formatCurrency(subtotal)}</Text>
          </View>
          {desconto > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-success">Desconto</Text>
              <Text className="text-success">−{formatCurrency(desconto)}</Text>
            </View>
          )}
          <View className="h-px bg-dark-border my-2" />
          <View className="flex-row justify-between">
            <Text className="text-offwhite font-bold text-lg">Total</Text>
            <Text className="text-accent font-bold text-lg">{formatCurrency(total)}</Text>
          </View>
        </View>
        <View className="h-4" />
      </ScrollView>

      <View className="px-4 pb-8 pt-4 bg-dark border-t border-dark-border">
        <Button
          title={`Fechar pedido — ${formatCurrency(total)}`}
          onPress={() => navigation.navigate('Checkout')}
          size="lg"
        />
      </View>
    </View>
  );
}
