import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppStackParamList } from '../../navigation/types';
import type { AppColors } from '../../theme/theme';
import { fontFamily } from '../../theme/theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

function createStyles(c: AppColors, topInset: number) {
  return StyleSheet.create({
    container: {
      paddingTop: topInset + 14,
      paddingBottom: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.bg,
    },
    locationBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: c.accent,
    },
    avatarInitial: {
      color: '#F4EDE1',
      fontFamily: fontFamily.displayBold,
      fontSize: 17,
    },
    locationLabel: {
      fontFamily: fontFamily.bodyMedium,
      fontSize: 11,
      marginBottom: 2,
      color: c.textSecondary,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationCity: {
      fontFamily: fontFamily.bodyBold,
      fontSize: 14,
      maxWidth: 150,
      color: c.text,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadge: {
      position: 'absolute',
      top: 5,
      right: 5,
      minWidth: 16,
      height: 16,
      borderRadius: 4,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: c.bg,
    },
    cartBadgeText: {
      color: '#F4EDE1',
      fontFamily: fontFamily.bodyBold,
      fontSize: 9,
    },
    notifDot: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.primary,
      borderWidth: 1.5,
      borderColor: c.bg,
    },
  });
}

export function AppHeader() {
  const { usuario } = useAuth();
  const { totalItens } = useCart();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const styles = useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);

  const initial = usuario?.nome?.charAt(0).toUpperCase() ?? '?';
  const firstName = usuario?.nome?.split(' ')[0] ?? 'Meu endereço';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Addresses')}
        style={styles.locationBlock}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View>
          <Text style={styles.locationLabel}>Localização</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationCity} numberOfLines={1}>{firstName}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.text} style={{ marginLeft: 3 }} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.iconBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="bag-outline" size={22} color={colors.text} />
          {totalItens > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItens > 9 ? '9+' : totalItens}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notificacoes')}
          style={styles.iconBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
