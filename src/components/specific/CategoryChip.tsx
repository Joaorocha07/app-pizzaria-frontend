import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
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
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
      activeOpacity={0.75}
    >
      {categoria.icone ? (
        <Text style={styles.emoji}>{categoria.icone}</Text>
      ) : null}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
        {categoria.nome}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  chipDefault: {
    backgroundColor: '#1A1A1A',
    borderColor: '#2A2A2A',
  },
  chipSelected: {
    backgroundColor: '#E63946',
    borderColor: '#FF4D5A',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelDefault: {
    color: '#9CA3AF',
  },
  labelSelected: {
    color: '#F5F0E8',
  },
});
