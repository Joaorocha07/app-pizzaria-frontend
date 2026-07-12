import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Produto } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/theme';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

interface ProductCardProps {
  produto: Produto;
  onPress: (produto: Produto) => void;
  animationDelay?: number;
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    /* Moldura dupla de impresso: filete externo + filete interno com respiro */
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: 3,
      marginBottom: 14,
    },
    cardInner: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.sm,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    cardUnavailable: {
      opacity: 0.5,
    },
    imageWrapper: {
      width: 112,
      height: 112,
      position: 'relative',
    },
    image: {
      width: 112,
      height: 112,
    },
    imagePlaceholder: {
      width: 112,
      height: 112,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unavailableBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(44,33,24,0.75)',
      paddingVertical: 4,
      alignItems: 'center',
    },
    unavailableText: {
      color: '#F4EDE1',
      fontFamily: fontFamily.bodySemiBold,
      fontSize: 9,
      letterSpacing: letterSpacing.caps,
    },
    info: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    infoTop: {},
    categoryLabel: {
      color: c.accent,
      fontFamily: fontFamily.bodySemiBold,
      fontSize: 9,
      letterSpacing: letterSpacing.capsWide,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    nome: {
      color: c.text,
      fontFamily: fontFamily.headingMedium,
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: 0.1,
      marginBottom: 4,
    },
    descricao: {
      color: c.textMuted,
      fontFamily: fontFamily.bodyRegular,
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
      fontFamily: fontFamily.bodyRegular,
      fontSize: 10,
      marginBottom: 1,
    },
    preco: {
      color: c.accent,
      fontFamily: fontFamily.headingBold,
      fontSize: 17,
    },
    addBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.sm,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
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
        <View style={styles.cardInner}>
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
                <Text style={styles.unavailableText}>INDISPONÍVEL</Text>
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
                  <Ionicons name="add" size={22} color="#F4EDE1" />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
