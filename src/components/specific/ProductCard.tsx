import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Produto } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ProductCardProps {
  produto: Produto;
  onPress: (produto: Produto) => void;
}

export function ProductCard({ produto, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(produto)}
      className="bg-dark-card rounded-2xl overflow-hidden mb-4 flex-row"
      activeOpacity={0.8}
    >
      {produto.urlImagem ? (
        <Image source={{ uri: produto.urlImagem }} className="w-28 h-28" resizeMode="cover" />
      ) : (
        <View className="w-28 h-28 bg-dark-border items-center justify-center">
          <Text className="text-4xl">🍕</Text>
        </View>
      )}
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-offwhite font-bold text-base" numberOfLines={1}>
            {produto.nome}
          </Text>
          {produto.descricao && (
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
              {produto.descricao}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-accent font-bold text-base">
            {formatCurrency(produto.preco)}
          </Text>
          <View className="bg-primary rounded-lg px-3 py-1">
            <Text className="text-offwhite text-xs font-bold">+ Add</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
