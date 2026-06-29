import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Produto } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/colors';

interface ProductCardProps {
  produto: Produto;
  onPress: (produto: Produto) => void;
  animationDelay?: number;
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 14,
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardUnavailable: {
      opacity: 0.5,
    },
    imageWrapper: {
      width: 118,
      height: 118,
      position: 'relative',
    },
    image: {
      width: 118,
      height: 118,
    },
    imagePlaceholder: {
      width: 118,
      height: 118,
      backgroundColor: c.bgCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unavailableBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
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
      color: c.accent,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    nome: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 20,
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    descricao: {
      color: c.textMuted,
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
      color: c.textMuted,
      fontSize: 10,
      marginBottom: 1,
    },
    preco: {
      color: c.accent,
      fontSize: 17,
      fontWeight: '800',
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#C0392B',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
  });
}

export function ProductCard({ produto, onPress, animationDelay = 0 }: ProductCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: animationDelay,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
    ]).start();
  }, []);

  function handlePressIn() {
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  }

  function handlePressOut() {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pressScale }] }]}
    >
      <TouchableOpacity
        onPress={() => onPress(produto)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, !produto.disponivel && styles.cardUnavailable]}
        activeOpacity={1}
      >
        <View style={styles.imageWrapper}>
          {produto.urlImagem ? (
            <Image source={{ uri: produto.urlImagem }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="pizza-outline" size={40} color={colors.textMuted} />
            </View>
          )}
          {!produto.disponivel && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Indisponível</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.infoTop}>
            {produto.categoria && (
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {produto.categoria.nome}
              </Text>
            )}
            <Text style={styles.nome} numberOfLines={2}>{produto.nome}</Text>
            {produto.descricao && (
              <Text style={styles.descricao} numberOfLines={2}>{produto.descricao}</Text>
            )}
          </View>

          <View style={styles.infoBottom}>
            <View>
              <Text style={styles.precoLabel}>a partir de</Text>
              <Text style={styles.preco}>{formatCurrency(produto.preco)}</Text>
            </View>
            {produto.disponivel && (
              <View style={styles.addBtn}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
