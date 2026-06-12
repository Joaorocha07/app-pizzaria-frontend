import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Categoria } from '../../types';

interface CategoryChipProps {
  categoria: Categoria;
  selected: boolean;
  onPress: (id: number) => void;
}

export function CategoryChip({ categoria, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(categoria.id)}
      className={`px-4 py-2 rounded-full mr-2 border ${
        selected ? 'bg-primary border-primary' : 'bg-dark-card border-dark-border'
      }`}
      activeOpacity={0.8}
    >
      <Text
        className={`text-sm font-semibold ${selected ? 'text-offwhite' : 'text-gray-400'}`}
      >
        {categoria.nome}
      </Text>
    </TouchableOpacity>
  );
}
