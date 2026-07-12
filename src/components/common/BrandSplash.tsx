import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, letterSpacing } from '../../theme/theme';
import { Crest } from './Crest';
import { Ornament } from './Ornament';

interface BrandSplashProps {
  message?: string;
}

/**
 * Tela de boot com identidade "Nobile": brasão da casa, nome em capitulares
 * romanas e ornamento — como o rótulo de um vinho antigo.
 */
export function BrandSplash({ message }: BrandSplashProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const crestScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(crestScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 8 }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ scale: crestScale }] }}>
          <Crest size={128} />
        </Animated.View>

        <Text style={styles.brandName}>PIZZARIA</Text>
        <Ornament width={160} style={styles.ornament} color={colors.accent} />
        <Text style={styles.brandSub}>UBERABA — MG</Text>

        <ActivityIndicator color={colors.accent} style={styles.spinner} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Animated.View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
    brandName: {
      color: c.text,
      fontFamily: fontFamily.displayBold,
      fontSize: 30,
      letterSpacing: 4,
      marginTop: 24,
    },
    ornament: { marginTop: 14 },
    brandSub: {
      color: c.textSecondary,
      fontFamily: fontFamily.bodySemiBold,
      fontSize: 10,
      letterSpacing: letterSpacing.capsWide,
      marginTop: 14,
    },
    spinner: { marginTop: 40 },
    message: { color: c.textMuted, fontFamily: fontFamily.bodyRegular, fontSize: 13, marginTop: 12 },
  });
}
