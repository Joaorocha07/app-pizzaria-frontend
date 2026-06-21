import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      style={[styles.card, !produto.disponivel && styles.cardUnavailable]}
      activeOpacity={0.85}
    >
      {/* Imagem */}
      <View style={styles.imageWrapper}>
        {produto.urlImagem ? (
          <Image source={{ uri: produto.urlImagem }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderEmoji}>🍕</Text>
          </View>
        )}
        {!produto.disponivel && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Indisponível</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoTop}>
          {produto.categoria && (
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {produto.categoria.nome}
            </Text>
          )}
          <Text style={styles.nome} numberOfLines={2}>
            {produto.nome}
          </Text>
          {produto.descricao && (
            <Text style={styles.descricao} numberOfLines={2}>
              {produto.descricao}
            </Text>
          )}
        </View>

        <View style={styles.infoBottom}>
          <View>
            <Text style={styles.precoLabel}>a partir de</Text>
            <Text style={styles.preco}>{formatCurrency(produto.preco)}</Text>
          </View>
          {produto.disponivel && (
            <View style={styles.addBtn}>
              <Ionicons name="add" size={22} color="#F5F0E8" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#242424',
  },
  cardUnavailable: {
    opacity: 0.55,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 42,
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  unavailableText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  infoTop: {},
  categoryLabel: {
    color: '#C8943C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  nome: {
    color: '#F5F0E8',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  descricao: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  infoBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  precoLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginBottom: 1,
  },
  preco: {
    color: '#C8943C',
    fontSize: 17,
    fontWeight: '800',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
